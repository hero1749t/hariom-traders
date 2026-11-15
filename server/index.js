const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('./db');
const { processGstBill, HARI_OM_GSTIN, HARI_OM_NAME } = require('./gst-ai-engine');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup uploads folder for invoice scans
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `invoice_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Helper to record audit logs
function logAudit(userName, action, moduleName, details) {
  try {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    db.prepare(`
      INSERT INTO audit_logs (id, user_name, action, module, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userName || 'Staff', action, moduleName, details);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// ==========================================
// 1. DASHBOARD & SHOP OPERATIONAL OVERVIEW
// ==========================================
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'ACTIVE'").get().count;
    
    // Inventory Valuations
    const valuation = db.prepare(`
      SELECT 
        SUM(b.quantity_remaining * b.purchase_price) as total_purchase_cost,
        SUM(b.quantity_remaining * p.selling_price) as total_selling_value,
        SUM(b.quantity_remaining * p.mrp) as total_mrp_value,
        SUM(b.quantity_remaining) as total_quantity
      FROM inventory_batches b
      JOIN products p ON b.product_id = p.id
      WHERE b.quantity_remaining > 0
    `).get();

    // Location-wise Stock breakdown
    const locationBreakdown = db.prepare(`
      SELECT 
        l.id, l.name, l.type,
        COUNT(DISTINCT b.product_id) as unique_products,
        COALESCE(SUM(b.quantity_remaining), 0) as total_units,
        COALESCE(SUM(b.quantity_remaining * b.purchase_price), 0) as inventory_value
      FROM locations l
      LEFT JOIN inventory_batches b ON l.id = b.location_id AND b.quantity_remaining > 0
      GROUP BY l.id
    `).all();

    // Expiry alerts: expired and expiring within 30 days
    const today = new Date().toISOString().split('T')[0];
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const in60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const expiredCount = db.prepare(`
      SELECT COUNT(*) as count FROM inventory_batches 
      WHERE expiry_date < ? AND quantity_remaining > 0
    `).get(today).count;

    const nearExpiryCount = db.prepare(`
      SELECT COUNT(*) as count FROM inventory_batches 
      WHERE expiry_date >= ? AND expiry_date <= ? AND quantity_remaining > 0
    `).get(today, in30Days).count;

    // Low stock items in Main Shop
    const lowStockItems = db.prepare(`
      SELECT 
        p.id, p.name, p.min_stock_level, p.reorder_point,
        COALESCE(SUM(CASE WHEN b.location_id = 'loc-main' THEN b.quantity_remaining ELSE 0 END), 0) as shop_stock,
        COALESCE(SUM(CASE WHEN b.location_id = 'loc-godown' THEN b.quantity_remaining ELSE 0 END), 0) as godown_stock
      FROM products p
      LEFT JOIN inventory_batches b ON p.id = b.product_id AND b.quantity_remaining > 0
      GROUP BY p.id
      HAVING shop_stock <= p.min_stock_level
    `).all();

    // Today's Sales & Purchases
    const salesToday = db.prepare(`
      SELECT 
        COUNT(*) as bills_count,
        COALESCE(SUM(grand_total), 0) as total_sales,
        COALESCE(SUM(cash_received), 0) as cash_total,
        COALESCE(SUM(upi_received), 0) as upi_total
      FROM sales 
      WHERE date(sale_date) = date('now')
    `).get();

    // Pending tasks
    const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'COMPLETED'").get().count;

    res.json({
      success: true,
      data: {
        totalProducts,
        totalQuantity: valuation.total_quantity || 0,
        purchaseValuation: valuation.total_purchase_cost || 0,
        sellingValuation: valuation.total_selling_value || 0,
        mrpValuation: valuation.total_mrp_value || 0,
        locationBreakdown,
        alerts: {
          expiredCount,
          nearExpiryCount,
          lowStockCount: lowStockItems.length,
          lowStockItems,
          pendingTasks
        },
        today: salesToday
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. LOCATIONS, RACKS & SHELVES
// ==========================================
app.get('/api/locations', (req, res) => {
  try {
    const locations = db.prepare('SELECT * FROM locations').all();
    const racks = db.prepare('SELECT * FROM racks').all();
    const sections = db.prepare('SELECT * FROM sections').all();

    const result = locations.map(loc => {
      const locRacks = racks.filter(r => r.location_id === loc.id).map(rack => {
        const rackSecs = sections.filter(s => s.rack_id === rack.id);
        return { ...rack, sections: rackSecs };
      });
      return { ...loc, racks: locRacks };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get products inside a specific rack / section
app.get('/api/locations/rack/:rackId/products', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT 
        b.id as batch_id, b.batch_number, b.expiry_date, b.quantity_remaining,
        p.id as product_id, p.name as product_name, p.category, p.barcode, p.base_unit,
        s.section_code, r.rack_code, l.name as location_name
      FROM inventory_batches b
      JOIN products p ON b.product_id = p.id
      JOIN racks r ON b.rack_id = r.id
      JOIN locations l ON b.location_id = l.id
      LEFT JOIN sections s ON b.section_id = s.id
      WHERE b.rack_id = ? AND b.quantity_remaining > 0
    `).all(req.params.rackId);

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. PRODUCTS & CATALOG
// ==========================================
app.get('/api/products', (req, res) => {
  try {
    const { search, category, locationId } = req.query;
    let query = `
      SELECT 
        p.*,
        s.business_name as supplier_name,
        COALESCE(SUM(b.quantity_remaining), 0) as total_stock,
        COALESCE(SUM(CASE WHEN b.location_id = 'loc-main' THEN b.quantity_remaining ELSE 0 END), 0) as main_shop_stock,
        COALESCE(SUM(CASE WHEN b.location_id = 'loc-second' THEN b.quantity_remaining ELSE 0 END), 0) as second_shop_stock,
        COALESCE(SUM(CASE WHEN b.location_id = 'loc-godown' THEN b.quantity_remaining ELSE 0 END), 0) as godown_stock
      FROM products p
      LEFT JOIN suppliers s ON p.preferred_supplier_id = s.id
      LEFT JOIN inventory_batches b ON p.id = b.product_id AND b.quantity_remaining > 0
    `;
    const params = [];
    const conditions = ["p.status = 'ACTIVE'"];

    if (search) {
      conditions.push('(p.name LIKE ? OR p.barcode LIKE ? OR p.brand LIKE ? OR p.sku LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (category) {
      conditions.push('p.category = ?');
      params.push(category);
    }

    query += ' WHERE ' + conditions.join(' AND ');
    query += ' GROUP BY p.id ORDER BY p.name ASC';

    const products = db.prepare(query).all(...params);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, s.business_name as supplier_name, s.phone as supplier_phone
      FROM products p
      LEFT JOIN suppliers s ON p.preferred_supplier_id = s.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Fetch batches across locations with rack details
    const batches = db.prepare(`
      SELECT 
        b.*, l.name as location_name, r.rack_code, sec.section_code, sup.business_name as supplier_name
      FROM inventory_batches b
      JOIN locations l ON b.location_id = l.id
      LEFT JOIN racks r ON b.rack_id = r.id
      LEFT JOIN sections sec ON b.section_id = sec.id
      LEFT JOIN suppliers sup ON b.supplier_id = sup.id
      WHERE b.product_id = ? AND b.quantity_remaining > 0
      ORDER BY b.expiry_date ASC
    `).all(req.params.id);

    res.json({ success: true, data: { ...product, batches } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const p = req.body;
    const id = `prod_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO products (
        id, name, brand, category, subcategory, barcode, sku, hsn_code,
        base_unit, purchase_unit, conversion_factor, purchase_price, selling_price, mrp,
        gst_rate, preferred_supplier_id, min_stock_level, max_stock_level, reorder_point
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, p.name, p.brand, p.category, p.subcategory, p.barcode || null, p.sku || id, p.hsn_code || '2106',
      p.base_unit || 'PCS', p.purchase_unit || 'BOX', p.conversion_factor || 1,
      p.purchase_price || 0, p.selling_price || 0, p.mrp || 0, p.gst_rate || 5,
      p.preferred_supplier_id || null, p.min_stock_level || 5, p.max_stock_level || 100, p.reorder_point || 15
    );

    logAudit(req.body.user_name || 'Owner', 'CREATE_PRODUCT', 'PRODUCTS', `Created product ${p.name} (ID: ${id})`);
    res.json({ success: true, data: { id, ...p } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. INTERNAL STOCK TRANSFERS & AUDIT ADJUSTMENTS
// ==========================================
app.post('/api/transfers', (req, res) => {
  const { batch_id, to_location_id, to_rack_id, to_section_id, quantity, reason, performed_by } = req.body;

  if (!batch_id || !to_location_id || !quantity || quantity <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid transfer details' });
  }

  const transferTx = db.transaction(() => {
    const sourceBatch = db.prepare('SELECT * FROM inventory_batches WHERE id = ?').get(batch_id);
    if (!sourceBatch) throw new Error('Source batch not found');
    if (sourceBatch.quantity_remaining < quantity) {
      throw new Error(`Insufficient quantity in batch. Available: ${sourceBatch.quantity_remaining}`);
    }

    // 1. Decrement source batch
    db.prepare('UPDATE inventory_batches SET quantity_remaining = quantity_remaining - ? WHERE id = ?')
      .run(quantity, batch_id);

    // 2. Check if identical batch exists at destination
    const destBatch = db.prepare(`
      SELECT * FROM inventory_batches 
      WHERE product_id = ? AND batch_number = ? AND location_id = ?
    `).get(sourceBatch.product_id, sourceBatch.batch_number, to_location_id);

    let destBatchId;
    if (destBatch) {
      destBatchId = destBatch.id;
      db.prepare(`
        UPDATE inventory_batches 
        SET quantity_remaining = quantity_remaining + ?,
            rack_id = COALESCE(?, rack_id),
            section_id = COALESCE(?, section_id)
        WHERE id = ?
      `).run(quantity, to_rack_id, to_section_id, destBatch.id);
    } else {
      destBatchId = `batch_tr_${Date.now()}`;
      db.prepare(`
        INSERT INTO inventory_batches (
          id, product_id, supplier_id, batch_number, location_id, rack_id, section_id,
          mfg_date, expiry_date, purchase_invoice_ref, purchase_price, quantity_received, quantity_remaining, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        destBatchId, sourceBatch.product_id, sourceBatch.supplier_id, sourceBatch.batch_number,
        to_location_id, to_rack_id, to_section_id, sourceBatch.mfg_date, sourceBatch.expiry_date,
        sourceBatch.purchase_invoice_ref, sourceBatch.purchase_price, quantity, quantity, sourceBatch.status
      );
    }

    // 3. Immutable Stock Movement record
    const movementId = `mov_tr_${Date.now()}`;
    db.prepare(`
      INSERT INTO stock_movements (
        id, batch_id, product_id, movement_type, from_location_id, to_location_id, quantity, unit, reference_id, reason, performed_by
      ) VALUES (?, ?, ?, 'INTERNAL_TRANSFER', ?, ?, ?, 'UNIT', ?, ?, ?)
    `).run(movementId, batch_id, sourceBatch.product_id, sourceBatch.location_id, to_location_id, quantity, `TR-${Date.now()}`, reason || 'Internal stock relocation', performed_by || 'Staff');

    // 4. Audit Log
    logAudit(performed_by || 'Staff', 'STOCK_TRANSFER', 'INVENTORY', `Transferred ${quantity} units of batch ${sourceBatch.batch_number} from ${sourceBatch.location_id} to ${to_location_id}`);

    return { movementId, destBatchId };
  });

  try {
    const result = transferTx();
    res.json({ success: true, data: result, message: 'Stock successfully transferred!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Physical Stock Audit & Verification (Section 13)
app.post('/api/inventory/audit', (req, res) => {
  const { batch_id, physical_quantity, reason, performed_by } = req.body;
  if (!batch_id || physical_quantity === undefined || physical_quantity < 0) {
    return res.status(400).json({ success: false, message: 'Invalid audit details' });
  }

  try {
    const batch = db.prepare('SELECT * FROM inventory_batches WHERE id = ?').get(batch_id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    const diff = physical_quantity - batch.quantity_remaining;

    // Update batch
    db.prepare('UPDATE inventory_batches SET quantity_remaining = ? WHERE id = ?')
      .run(physical_quantity, batch_id);

    // Record stock movement
    const movId = `mov_aud_${Date.now()}`;
    db.prepare(`
      INSERT INTO stock_movements (
        id, batch_id, product_id, movement_type, from_location_id, to_location_id, quantity, unit, reference_id, reason, performed_by
      ) VALUES (?, ?, ?, 'ADJUSTMENT', ?, ?, ?, 'UNIT', ?, ?, ?)
    `).run(
      movId, batch_id, batch.product_id, batch.location_id, batch.location_id,
      Math.abs(diff), 'UNIT', `AUDIT-${Date.now()}`,
      `Physical stock audit: ${diff >= 0 ? '+' : ''}${diff} units (${reason || 'Count discrepancy'})`,
      performed_by || 'Owner'
    );

    logAudit(performed_by || 'Owner', 'STOCK_AUDIT', 'INVENTORY', `Audited batch ${batch.batch_number}: changed from ${batch.quantity_remaining} to ${physical_quantity} (${reason})`);

    res.json({ success: true, message: 'Stock audit adjustment recorded with full audit history!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. EXPIRY MANAGEMENT & SUPPLIER RETURN WORKFLOW
// ==========================================
app.get('/api/expiry/alerts', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const in15 = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const in60 = new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0];

    const query = `
      SELECT 
        b.id as batch_id, b.batch_number, b.expiry_date, b.quantity_remaining, b.purchase_price,
        p.id as product_id, p.name as product_name, p.brand, p.category,
        l.name as location_name, r.rack_code, sec.section_code,
        s.id as supplier_id, s.business_name as supplier_name, s.phone as supplier_phone, s.return_policy, s.return_deadline_days,
        CASE 
          WHEN b.expiry_date < ? THEN 'EXPIRED'
          WHEN b.expiry_date <= ? THEN 'EXPIRING_15_DAYS'
          WHEN b.expiry_date <= ? THEN 'EXPIRING_30_DAYS'
          WHEN b.expiry_date <= ? THEN 'EXPIRING_60_DAYS'
          ELSE 'GOOD'
        END as urgency
      FROM inventory_batches b
      JOIN products p ON b.product_id = p.id
      JOIN locations l ON b.location_id = l.id
      LEFT JOIN racks r ON b.rack_id = r.id
      LEFT JOIN sections sec ON b.section_id = sec.id
      JOIN suppliers s ON b.supplier_id = s.id
      WHERE b.quantity_remaining > 0 AND b.expiry_date <= ?
      ORDER BY b.expiry_date ASC
    `;

    const alerts = db.prepare(query).all(today, in15, in30, in60, in60);
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/expiry/returns', (req, res) => {
  try {
    const returns = db.prepare(`
      SELECT 
        r.*, p.name as product_name, p.brand, b.batch_number, s.business_name as supplier_name, s.phone as supplier_phone
      FROM expiry_returns r
      JOIN products p ON r.product_id = p.id
      JOIN inventory_batches b ON r.batch_id = b.id
      JOIN suppliers s ON r.supplier_id = s.id
      ORDER BY r.created_at DESC
    `).all();

    res.json({ success: true, data: returns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/expiry/returns', (req, res) => {
  try {
    const { batch_id, quantity, status, notes, credit_note_ref, amount_recovered } = req.body;
    const batch = db.prepare('SELECT * FROM inventory_batches WHERE id = ?').get(batch_id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    const returnId = `ret_${Date.now()}`;
    db.prepare(`
      INSERT INTO expiry_returns (
        id, batch_id, product_id, supplier_id, quantity, expiry_date, status, notes, credit_note_ref, amount_recovered
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      returnId, batch.id, batch.product_id, batch.supplier_id, quantity || batch.quantity_remaining,
      batch.expiry_date, status || 'IDENTIFIED', notes || '', credit_note_ref || null, amount_recovered || 0
    );

    // If handed over or returned, decrease inventory batch
    if (status === 'HANDED_OVER' || status === 'CREDIT_RECEIVED') {
      db.prepare('UPDATE inventory_batches SET quantity_remaining = quantity_remaining - ? WHERE id = ?')
        .run(quantity || batch.quantity_remaining, batch.id);
    }

    logAudit(req.body.user_name || 'Staff', 'EXPIRY_RETURN_ACTION', 'EXPIRY', `Expiry return created for batch ${batch.batch_number} (Status: ${status})`);
    res.json({ success: true, data: { returnId } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. SMART REORDER & SPACE ALLOCATION ENGINE
// ==========================================
app.get('/api/reorder/recommendations', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT 
        p.id, p.name, p.brand, p.category, p.min_stock_level, p.max_stock_level, p.reorder_point,
        p.purchase_price, p.selling_price, p.conversion_factor, p.purchase_unit, p.base_unit,
        s.id as supplier_id, s.business_name as supplier_name, s.phone as supplier_phone,
        COALESCE(SUM(CASE WHEN b.location_id = 'loc-main' THEN b.quantity_remaining ELSE 0 END), 0) as main_shop_stock,
        COALESCE(SUM(CASE WHEN b.location_id = 'loc-godown' THEN b.quantity_remaining ELSE 0 END), 0) as godown_stock,
        COALESCE(SUM(CASE WHEN b.location_id = 'loc-second' THEN b.quantity_remaining ELSE 0 END), 0) as second_shop_stock,
        COALESCE(SUM(b.quantity_remaining), 0) as total_available_stock
      FROM products p
      LEFT JOIN suppliers s ON p.preferred_supplier_id = s.id
      LEFT JOIN inventory_batches b ON p.id = b.product_id AND b.quantity_remaining > 0
      WHERE p.status = 'ACTIVE'
      GROUP BY p.id
    `).all();

    const recommendations = products.map(p => {
      let action = 'NO_ACTION';
      let suggestedQuantity = 0;
      let reason = 'Stock levels healthy.';
      let priority = 'LOW';

      // Rule 1: Shop is low, but stock exists in Godown -> INTERNAL TRANSFER FIRST!
      if (p.main_shop_stock <= p.min_stock_level && p.godown_stock > 0) {
        action = 'TRANSFER_FROM_GODOWN';
        suggestedQuantity = Math.min(p.godown_stock, p.reorder_point - p.main_shop_stock);
        reason = `Shop has only ${p.main_shop_stock} ${p.base_unit}, but Back Godown has ${p.godown_stock} ${p.base_unit}. Move stock instead of purchasing!`;
        priority = p.main_shop_stock === 0 ? 'CRITICAL' : 'HIGH';
      }
      // Rule 2: Total stock across all locations is below reorder point -> ORDER FROM SUPPLIER
      else if (p.total_available_stock <= p.reorder_point) {
        action = 'REORDER_FROM_SUPPLIER';
        const deficit = p.max_stock_level - p.total_available_stock;
        // round to carton/box units
        suggestedQuantity = Math.max(1, Math.ceil(deficit / (p.conversion_factor || 1))) * (p.conversion_factor || 1);
        reason = `Total shop & godown stock is ${p.total_available_stock} (below reorder point ${p.reorder_point}). Order from ${p.supplier_name || 'preferred supplier'}.`;
        priority = p.total_available_stock <= p.min_stock_level ? 'CRITICAL' : 'HIGH';
      }
      // Rule 3: Overstocked check
      else if (p.total_available_stock > p.max_stock_level * 1.5) {
        action = 'OVERSTOCKED_ALERT';
        reason = `Excess inventory (${p.total_available_stock} units). Hold further purchases to free up space.`;
        priority = 'MEDIUM';
      }

      return {
        ...p,
        action,
        suggestedQuantity,
        reason,
        priority
      };
    });

    res.json({ success: true, data: recommendations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. POS BILLING & CHECKOUT
// ==========================================
app.post('/api/pos/checkout', (req, res) => {
  const { items, customer_name, customer_phone, payment_mode, cash_received, upi_received, is_gst_bill, billing_staff_id } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const checkoutTx = db.transaction(() => {
    let grandTotal = 0;
    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const billNumber = `HOT-BILL-${Date.now().toString().slice(-6)}`;
    const saleId = `sale_${Date.now()}`;

    // Validate and allocate batches (FIFO priority)
    const lineItemsToInsert = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      if (!product) throw new Error(`Product ${item.product_id} not found`);

      let remainingToDeduct = item.quantity;

      // Find available batches in Main Shop first, then others
      const batches = db.prepare(`
        SELECT * FROM inventory_batches 
        WHERE product_id = ? AND quantity_remaining > 0
        ORDER BY CASE WHEN location_id = 'loc-main' THEN 0 ELSE 1 END, expiry_date ASC
      `).all(item.product_id);

      const totalBatchAvail = batches.reduce((sum, b) => sum + b.quantity_remaining, 0);
      if (totalBatchAvail < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${totalBatchAvail}, Requested: ${item.quantity}`);
      }

      for (const b of batches) {
        if (remainingToDeduct <= 0) break;
        const deduct = Math.min(b.quantity_remaining, remainingToDeduct);

        // Deduct from batch
        db.prepare('UPDATE inventory_batches SET quantity_remaining = quantity_remaining - ? WHERE id = ?')
          .run(deduct, b.id);

        remainingToDeduct -= deduct;

        // Calculate tax per line
        const rate = product.selling_price;
        const lineTotal = deduct * rate;
        const gstRate = product.gst_rate;
        // In retail Indian POS, prices are usually MRP/inclusive:
        const taxable = lineTotal / (1 + (gstRate / 100));
        const taxAmount = lineTotal - taxable;
        const halfTax = taxAmount / 2;

        totalTaxable += taxable;
        totalCgst += halfTax;
        totalSgst += halfTax;
        grandTotal += lineTotal;

        lineItemsToInsert.push({
          productId: product.id,
          batchId: b.id,
          quantity: deduct,
          unitPrice: rate,
          taxableValue: taxable,
          gstRate,
          cgst: halfTax,
          sgst: halfTax,
          totalAmount: lineTotal
        });

        // Log movement
        db.prepare(`
          INSERT INTO stock_movements (
            id, batch_id, product_id, movement_type, from_location_id, quantity, unit, reference_id, performed_by
          ) VALUES (?, ?, ?, 'SALE', ?, ?, 'UNIT', ?, ?)
        `).run(`mov_sl_${Date.now()}_${b.id}`, b.id, product.id, b.location_id, deduct, billNumber, billing_staff_id || 'Billing Staff');
      }
    }

    // Insert into sales table
    db.prepare(`
      INSERT INTO sales (
        id, bill_number, is_gst_bill, customer_name, customer_phone,
        total_taxable_value, total_cgst, total_sgst, total_igst, grand_total,
        payment_mode, cash_received, upi_received, billing_staff_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      saleId, billNumber, is_gst_bill ? 1 : 0, customer_name || 'Walk-in Customer', customer_phone || null,
      totalTaxable, totalCgst, totalSgst, totalIgst, grandTotal,
      payment_mode || 'CASH', cash_received || 0, upi_received || 0, billing_staff_id || 'Billing Staff'
    );

    // Insert sale items
    const insertSaleItem = db.prepare(`
      INSERT INTO sale_items (
        id, sale_id, product_id, batch_id, quantity, unit_price, taxable_value, gst_rate, cgst, sgst, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    lineItemsToInsert.forEach((li, idx) => {
      insertSaleItem.run(
        `sli_${Date.now()}_${idx}`, saleId, li.productId, li.batchId, li.quantity,
        li.unitPrice, li.taxableValue, li.gstRate, li.cgst, li.sgst, li.totalAmount
      );
    });

    logAudit(billing_staff_id || 'Billing Staff', 'POS_SALE', 'SALES', `Completed Sale ${billNumber} for ₹${grandTotal.toFixed(2)} (${payment_mode})`);

    return {
      billNumber,
      saleId,
      grandTotal,
      totalTaxable,
      totalCgst,
      totalSgst,
      paymentMode: payment_mode
    };
  });

  try {
    const saleResult = checkoutTx();
    res.json({ success: true, data: saleResult, message: 'Bill generated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. GST & FINANCIAL REGISTERS (Quarterly & Rate-wise)
// ==========================================
app.get('/api/gst/reports', (req, res) => {
  try {
    // GST Sales summary
    const salesSummary = db.prepare(`
      SELECT 
        COUNT(*) as total_bills,
        COALESCE(SUM(total_taxable_value), 0) as total_taxable,
        COALESCE(SUM(total_cgst), 0) as total_cgst,
        COALESCE(SUM(total_sgst), 0) as total_sgst,
        COALESCE(SUM(total_igst), 0) as total_igst,
        COALESCE(SUM(grand_total), 0) as total_sales
      FROM sales
      WHERE is_gst_bill = 1
    `).get();

    // Non-GST Sales summary
    const otherSalesSummary = db.prepare(`
      SELECT 
        COUNT(*) as total_bills,
        COALESCE(SUM(grand_total), 0) as total_sales
      FROM sales
      WHERE is_gst_bill = 0
    `).get();

    // GST Rate-wise Sales breakup
    const rateWiseSales = db.prepare(`
      SELECT 
        si.gst_rate,
        SUM(si.taxable_value) as taxable_amount,
        SUM(si.cgst) as cgst_amount,
        SUM(si.sgst) as sgst_amount,
        SUM(si.total_amount) as total_amount
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.is_gst_bill = 1
      GROUP BY si.gst_rate
      ORDER BY si.gst_rate ASC
    `).all();

    // GST Purchases summary
    const purchaseSummary = db.prepare(`
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(taxable_value), 0) as total_taxable,
        COALESCE(SUM(cgst_amount), 0) as total_cgst,
        COALESCE(SUM(sgst_amount), 0) as total_sgst,
        COALESCE(SUM(igst_amount), 0) as total_igst,
        COALESCE(SUM(grand_total), 0) as total_purchases
      FROM purchases
      WHERE is_gst_bill = 1
    `).get();

    res.json({
      success: true,
      data: {
        gstSales: salesSummary,
        otherSales: otherSalesSummary,
        gstPurchases: purchaseSummary,
        rateWiseSales
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GSTR-2B Automated Reconciliation & Supplier Discrepancy Matching (Section 7.6)
app.get('/api/gst/reconcile-2b', (req, res) => {
  try {
    const ourPurchases = db.prepare(`
      SELECT p.*, s.business_name as supplier_name, s.phone as supplier_phone, s.gstin as supplier_gstin
      FROM purchases p
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.is_gst_bill = 1
      ORDER BY p.invoice_date DESC
    `).all();

    // Simulated / Portal GSTR-2B records for Hari Om Traders (GSTIN: 05DKWPS9122N1Z5)
    // E.g. Jindal Agencies & Vijaya Agencies filed their GSTR-1, but some pending bills are missing!
    const portal2B = [
      {
        gstin: '05ABAPA2921P1ZY',
        supplier_name: 'Jindal Agencies',
        invoice_number: '2186',
        invoice_date: '2026-10-18',
        taxable_value: 4852.47,
        cgst: 228.74,
        sgst: 228.74,
        igst: 0,
        itc_status: 'AVAILABLE'
      },
      {
        gstin: '05AFXPJ8419E1Z4',
        supplier_name: 'THE VIJAYA AGENCIES',
        invoice_number: 'CAD-9373',
        invoice_date: '2026-11-03',
        taxable_value: 11716.90,
        cgst: 292.92,
        sgst: 292.92,
        igst: 0,
        itc_status: 'AVAILABLE'
      }
    ];

    const matched = [];
    const missingIn2B = [];

    ourPurchases.forEach(our => {
      const match = portal2B.find(p => 
        (p.invoice_number.toLowerCase() === our.invoice_number.toLowerCase()) ||
        (p.gstin === our.supplier_gstin && Math.abs(p.taxable_value - our.taxable_value) < 5)
      );

      if (match) {
        matched.push({
          ...our,
          reconciliation_status: 'MATCHED_2B',
          itc_eligible: true,
          portal_data: match
        });
      } else {
        missingIn2B.push({
          ...our,
          reconciliation_status: 'MISSING_IN_PORTAL_2B',
          itc_eligible: false,
          itc_at_risk: our.cgst_amount + our.sgst_amount + our.igst_amount,
          issue: 'Supplier has not uploaded this invoice in GSTR-1 yet. ITC claim will be blocked until supplier files!'
        });
      }
    });

    res.json({
      success: true,
      data: {
        totalBooksInvoices: ourPurchases.length,
        totalPortalInvoices: portal2B.length,
        matchedCount: matched.length,
        missingCount: missingIn2B.length,
        matched,
        missingIn2B
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 9. SUPPLIERS & PURCHASES (AI SCAN & MANUAL)
// ==========================================
app.get('/api/suppliers', (req, res) => {
  try {
    const suppliers = db.prepare(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM purchases WHERE supplier_id = s.id) as total_purchases,
        (SELECT COALESCE(SUM(grand_total), 0) FROM purchases WHERE supplier_id = s.id) as total_purchase_amount
      FROM suppliers s
      ORDER BY s.business_name ASC
    `).all();
    res.json({ success: true, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// View Single Purchase Invoice with Items
app.get('/api/purchases/:id', (req, res) => {
  try {
    const purchase = db.prepare(`
      SELECT p.*, s.business_name as supplier_name, s.phone as supplier_phone, s.gstin as supplier_gstin
      FROM purchases p
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!purchase) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const items = db.prepare(`
      SELECT pi.*, p.name as product_name, l.name as location_name, r.rack_code
      FROM purchase_items pi
      LEFT JOIN products p ON pi.product_id = p.id
      LEFT JOIN locations l ON pi.destination_location_id = l.id
      LEFT JOIN racks r ON pi.destination_rack_id = r.id
      WHERE pi.purchase_id = ?
    `).all(req.params.id);

    res.json({ success: true, data: { ...purchase, items } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update / Edit Purchase Invoice
app.put('/api/purchases/:id', (req, res) => {
  const { invoice_number, invoice_date, grand_total, taxable_value, cgst_amount, sgst_amount, payment_status, verified_by } = req.body;
  try {
    db.prepare(`
      UPDATE purchases 
      SET invoice_number = COALESCE(?, invoice_number),
          invoice_date = COALESCE(?, invoice_date),
          grand_total = COALESCE(?, grand_total),
          taxable_value = COALESCE(?, taxable_value),
          cgst_amount = COALESCE(?, cgst_amount),
          sgst_amount = COALESCE(?, sgst_amount),
          payment_status = COALESCE(?, payment_status)
      WHERE id = ?
    `).run(invoice_number, invoice_date, grand_total, taxable_value, cgst_amount, sgst_amount, payment_status, req.params.id);

    logAudit(verified_by || 'Owner', 'EDIT_PURCHASE', 'PURCHASES', `Edited invoice ${invoice_number || req.params.id}`);
    res.json({ success: true, message: 'Invoice updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Purchase Invoice
app.delete('/api/purchases/:id', (req, res) => {
  try {
    const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: 'Invoice not found' });

    // Remove purchase items and batches associated with this invoice ref
    db.prepare('DELETE FROM inventory_batches WHERE purchase_invoice_ref = ?').run(purchase.invoice_number);
    db.prepare('DELETE FROM purchases WHERE id = ?').run(req.params.id);

    logAudit('Owner', 'DELETE_PURCHASE', 'PURCHASES', `Deleted invoice ${purchase.invoice_number}`);
    res.json({ success: true, message: 'Invoice and associated batches deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Wipe All Fake / Demo Data (Keep Clean Slate for Real Data Entry)
app.post('/api/admin/reset-database', (req, res) => {
  try {
    const resetTx = db.transaction(() => {
      // Child tables first to satisfy foreign key constraints
      db.prepare('DELETE FROM sale_items').run();
      db.prepare('DELETE FROM sales').run();
      db.prepare('DELETE FROM purchase_items').run();
      db.prepare('DELETE FROM purchases').run();
      db.prepare('DELETE FROM expiry_returns').run();
      db.prepare('DELETE FROM stock_movements').run();
      db.prepare('DELETE FROM inventory_batches').run();
      db.prepare('DELETE FROM products').run();
      db.prepare('DELETE FROM tasks').run();

      // Reset suppliers to the real ones from user's bills
      db.prepare('DELETE FROM suppliers').run();
      const insertSup = db.prepare(`
        INSERT INTO suppliers (id, name, business_name, gstin, phone, address, return_policy, return_deadline_days, credit_terms_days)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertSup.run(
        'sup-krishna', 'Rishabh / Krishna Rep', 'KRISHNA AGENCIES 26-27', '05AEJPC9715K1ZD',
        '+91 70171 68755', 'Plot No-2, Sector-1, Industrial Area, Muni Ki Reti, Rishikesh',
        'Standard confectionery & FMCG credit note policy', 30, 21
      );

      insertSup.run(
        'sup-vijaya', 'Rishabh Agency Contact', 'THE VIJAYA AGENCIES', '05AFXPJ8419E1Z4',
        '+91 97600 26617', '145/1 Laxman Jhula Road, Rishikesh',
        'Cadbury & personal care replacement on quarterly representative visit', 45, 30
      );

      insertSup.run(
        'sup-jindal', 'Jindal Representative', 'Jindal Agencies', '05ABAPA2921P1ZY',
        '+91 98972 10140', 'Saklani Complex, Railway Road, Rishikesh',
        'Full credit note provided for spices & detergents returned prior to expiry', 30, 15
      );

      logAudit('Owner', 'RESET_SYSTEM', 'ADMIN', 'Cleared all demo/fake data. Prepared clean slate for real shop bills.');
    });

    resetTx();
    res.json({ success: true, message: 'All fake data cleared! System is now completely fresh for real data entry.' });
  } catch (err) {
    db.pragma('foreign_keys = ON');
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Invoice Processing & Extraction Endpoint
app.post('/api/purchases/scan', upload.single('invoice_file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No invoice file uploaded' });
    }

    const filePath = `/uploads/${req.file.filename}`;
    const filename = req.file.originalname;

    // Run dedicated Indian GST AI & Arithmetic Verification Engine
    const extracted = processGstBill(req.file.buffer, filename);

    // Check duplicate invoice detection
    const existingBill = db.prepare(`
      SELECT p.*, s.business_name FROM purchases p 
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.invoice_number = ?
    `).get(extracted.invoice_number);

    res.json({
      success: true,
      data: {
        ...extracted,
        filePath,
        isDuplicate: !!existingBill,
        duplicateWarning: existingBill ? `Warning: Invoice ${extracted.invoice_number} already recorded on ${existingBill.invoice_date}!` : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Confirm & Inward Purchase after Human Verification
app.post('/api/purchases/confirm', (req, res) => {
  const { 
    supplier_name, supplier_gstin, invoice_number, invoice_date, is_gst_bill,
    items, subtotal, total_cgst, total_sgst, total_igst, round_off, grand_total,
    amount_paid, payment_status, document_path, verified_by 
  } = req.body;

  if (!items || items.length === 0 || !invoice_number) {
    return res.status(400).json({ success: false, message: 'Invalid purchase submission' });
  }

  const purchaseTx = db.transaction(() => {
    // 1. Find or create supplier
    let supplier = db.prepare('SELECT * FROM suppliers WHERE gstin = ? OR business_name LIKE ?').get(supplier_gstin || 'NONE', `%${supplier_name}%`);
    if (!supplier) {
      const supId = `sup_${Date.now()}`;
      db.prepare(`
        INSERT INTO suppliers (id, name, business_name, gstin, phone, address, return_policy)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(supId, supplier_name, supplier_name, supplier_gstin || null, '+91 98000 00000', 'Local Market', 'Standard return policy');
      supplier = { id: supId, business_name: supplier_name };
    }

    const purchaseId = `purch_${Date.now()}`;

    // 2. Insert into purchases register
    db.prepare(`
      INSERT INTO purchases (
        id, supplier_id, invoice_number, invoice_date, supplier_gstin, is_gst_bill,
        taxable_value, cgst_amount, sgst_amount, igst_amount, round_off, grand_total,
        amount_paid, payment_status, verification_status, document_path, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VERIFIED', ?, ?)
    `).run(
      purchaseId, supplier.id, invoice_number, invoice_date, supplier_gstin || null, is_gst_bill !== false ? 1 : 0,
      subtotal || 0, total_cgst || 0, total_sgst || 0, total_igst || 0, round_off || 0, grand_total,
      amount_paid || 0, payment_status || 'PAID', document_path || null, verified_by || 'Owner'
    );

    // 3. Insert purchase items and create batch records
    const insertPurchItem = db.prepare(`
      INSERT INTO purchase_items (
        id, purchase_id, product_id, batch_number, expiry_date, quantity, unit, rate,
        taxable_value, gst_rate, cgst, sgst, igst, total_amount,
        destination_location_id, destination_rack_id, destination_section_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertBatch = db.prepare(`
      INSERT INTO inventory_batches (
        id, product_id, supplier_id, batch_number, location_id, rack_id, section_id,
        mfg_date, expiry_date, purchase_invoice_ref, purchase_price, quantity_received, quantity_remaining, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
    `);

    const insertMovement = db.prepare(`
      INSERT INTO stock_movements (
        id, batch_id, product_id, movement_type, to_location_id, quantity, unit, reference_id, reason, performed_by
      ) VALUES (?, ?, ?, 'INWARD', ?, ?, ?, ?, ?, ?)
    `);

    items.forEach((item, idx) => {
      const piId = `pi_${Date.now()}_${idx}`;
      const batchId = `b_inw_${Date.now()}_${idx}`;

      // Auto create or resolve product in master
      let productId = item.matched_product_id;
      if (!productId) {
        const existingProd = db.prepare('SELECT id FROM products WHERE name = ?').get(item.product_name);
        if (existingProd) {
          productId = existingProd.id;
        } else {
          productId = `prod_${Date.now()}_${idx}`;
          const sellingPrice = Number((item.rate * 1.15).toFixed(2));
          const mrp = Number((item.rate * 1.25).toFixed(2));
          db.prepare(`
            INSERT INTO products (id, name, category, hsn_code, base_unit, purchase_price, selling_price, mrp, gst_rate, preferred_supplier_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
          `).run(productId, item.product_name, 'Groceries', item.hsn_code || '2106', item.unit || 'UNIT', item.rate, sellingPrice, mrp, item.gst_rate || 5, supplier.id);
        }
      }

      insertPurchItem.run(
        piId, purchaseId, productId, item.batch_number || `BATCH-${Date.now().toString().slice(-4)}`, item.expiry_date || null,
        item.quantity, item.unit || 'UNIT', item.rate, item.taxable_value, item.gst_rate,
        item.cgst || 0, item.sgst || 0, item.igst || 0, item.total_amount,
        item.destination_location_id || 'loc-godown', item.destination_rack_id || null, item.destination_section_id || null
      );

      // Create new batch in inventory
      insertBatch.run(
        batchId, productId, supplier.id, item.batch_number || `BATCH-${Date.now().toString().slice(-4)}`,
        item.destination_location_id || 'loc-godown', item.destination_rack_id || null, item.destination_section_id || null,
        invoice_date, item.expiry_date || null, invoice_number, item.rate, item.quantity, item.quantity
      );

      // Log movement
      insertMovement.run(
        `mov_inw_${Date.now()}_${idx}`, batchId, productId,
        item.destination_location_id || 'loc-godown', item.quantity, item.unit || 'UNIT',
        invoice_number, `Purchase inward from ${supplier.business_name}`, verified_by || 'Owner'
      );
    });

    logAudit(verified_by || 'Owner', 'PURCHASE_ENTRY', 'PURCHASES', `Inwarded bill ${invoice_number} from ${supplier.business_name} (₹${Number(grand_total).toFixed(2)})`);

    return { purchaseId, invoice_number };
  });

  try {
    const result = purchaseTx();
    res.json({ success: true, data: result, message: 'Purchase bill inwarded and batches added to inventory!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 10. STAFF TASKS & DAILY SOPS
// ==========================================
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY due_date ASC, priority DESC').all();
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { assigned_to, title, description, priority, due_date } = req.body;
    const id = `task_${Date.now()}`;
    db.prepare(`
      INSERT INTO tasks (id, assigned_to, title, description, priority, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, assigned_to, title, description || '', priority || 'NORMAL', due_date || new Date().toISOString().split('T')[0]);

    res.json({ success: true, data: { id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/tasks/:id/status', (req, res) => {
  try {
    const { status, verified_by } = req.body;
    const completedAt = status === 'COMPLETED' ? new Date().toISOString() : null;
    db.prepare('UPDATE tasks SET status = ?, completed_at = ?, verified_by = ? WHERE id = ?')
      .run(status, completedAt, verified_by || null, req.params.id);

    res.json({ success: true, message: 'Task status updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 11. AUDIT LOGS
// ==========================================
app.get('/api/audit-logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Hari Om Traders Backend Service running on port ${PORT}`);
});
