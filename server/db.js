const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'hariom.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    -- 1. Locations, Racks & Sections
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'MAIN_SHOP', 'SECOND_SHOP', 'BACK_GODOWN'
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS racks (
      id TEXT PRIMARY KEY,
      location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      rack_code TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      rack_id TEXT NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
      section_code TEXT NOT NULL,
      description TEXT
    );

    -- 2. Suppliers
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      business_name TEXT NOT NULL,
      gstin TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      state_code TEXT NOT NULL DEFAULT '07', -- Delhi / local default
      return_policy TEXT,
      return_deadline_days INTEGER DEFAULT 30,
      credit_terms_days INTEGER DEFAULT 15,
      outstanding_balance REAL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Products Master
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      category TEXT NOT NULL,
      subcategory TEXT,
      barcode TEXT UNIQUE,
      sku TEXT UNIQUE,
      hsn_code TEXT NOT NULL DEFAULT '2106',
      base_unit TEXT NOT NULL DEFAULT 'PCS',
      purchase_unit TEXT NOT NULL DEFAULT 'BOX',
      conversion_factor REAL NOT NULL DEFAULT 1.0,
      purchase_price REAL NOT NULL DEFAULT 0.0,
      selling_price REAL NOT NULL DEFAULT 0.0,
      mrp REAL NOT NULL DEFAULT 0.0,
      gst_rate REAL NOT NULL DEFAULT 5.0,
      preferred_supplier_id TEXT REFERENCES suppliers(id),
      min_stock_level REAL NOT NULL DEFAULT 10,
      max_stock_level REAL NOT NULL DEFAULT 100,
      reorder_point REAL NOT NULL DEFAULT 20,
      requires_expiry_tracking INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Batch-wise Inventory
    CREATE TABLE IF NOT EXISTS inventory_batches (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      batch_number TEXT NOT NULL,
      location_id TEXT NOT NULL REFERENCES locations(id),
      rack_id TEXT REFERENCES racks(id),
      section_id TEXT REFERENCES sections(id),
      mfg_date DATE,
      expiry_date DATE,
      purchase_invoice_ref TEXT,
      purchase_price REAL NOT NULL DEFAULT 0.0,
      quantity_received REAL NOT NULL,
      quantity_remaining REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'NEAR_EXPIRY', 'EXPIRED', 'RETURN_REQUESTED', 'RETURNED'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Immutable Stock Movements
    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL REFERENCES inventory_batches(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      movement_type TEXT NOT NULL, -- 'INWARD', 'SALE', 'INTERNAL_TRANSFER', 'RETURN', 'DAMAGE_WRITEOFF', 'ADJUSTMENT'
      from_location_id TEXT REFERENCES locations(id),
      to_location_id TEXT REFERENCES locations(id),
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      reference_id TEXT,
      reason TEXT,
      performed_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. Purchases & Scanned Bills
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      invoice_number TEXT NOT NULL,
      invoice_date DATE NOT NULL,
      supplier_gstin TEXT,
      is_gst_bill INTEGER NOT NULL DEFAULT 1,
      taxable_value REAL NOT NULL DEFAULT 0.0,
      cgst_amount REAL NOT NULL DEFAULT 0.0,
      sgst_amount REAL NOT NULL DEFAULT 0.0,
      igst_amount REAL NOT NULL DEFAULT 0.0,
      round_off REAL DEFAULT 0.0,
      grand_total REAL NOT NULL DEFAULT 0.0,
      amount_paid REAL DEFAULT 0.0,
      payment_status TEXT NOT NULL DEFAULT 'PAID', -- 'PAID', 'PARTIAL', 'UNPAID'
      verification_status TEXT NOT NULL DEFAULT 'VERIFIED', -- 'PENDING_VERIFICATION', 'VERIFIED'
      document_path TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      id TEXT PRIMARY KEY,
      purchase_id TEXT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      batch_number TEXT NOT NULL,
      expiry_date DATE,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      rate REAL NOT NULL,
      taxable_value REAL NOT NULL,
      gst_rate REAL NOT NULL,
      cgst REAL DEFAULT 0.0,
      sgst REAL DEFAULT 0.0,
      igst REAL DEFAULT 0.0,
      total_amount REAL NOT NULL,
      destination_location_id TEXT NOT NULL REFERENCES locations(id),
      destination_rack_id TEXT REFERENCES racks(id),
      destination_section_id TEXT REFERENCES sections(id)
    );

    -- 7. Sales & POS Records
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      bill_number TEXT NOT NULL UNIQUE,
      sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_gst_bill INTEGER NOT NULL DEFAULT 0,
      customer_name TEXT DEFAULT 'Walk-in Customer',
      customer_phone TEXT,
      customer_gstin TEXT,
      total_taxable_value REAL NOT NULL DEFAULT 0.0,
      total_cgst REAL NOT NULL DEFAULT 0.0,
      total_sgst REAL NOT NULL DEFAULT 0.0,
      total_igst REAL NOT NULL DEFAULT 0.0,
      discount_amount REAL DEFAULT 0.0,
      grand_total REAL NOT NULL,
      payment_mode TEXT NOT NULL DEFAULT 'CASH', -- 'CASH', 'UPI', 'MIXED'
      cash_received REAL DEFAULT 0.0,
      upi_received REAL DEFAULT 0.0,
      billing_staff_id TEXT NOT NULL DEFAULT 'Staff Member',
      status TEXT NOT NULL DEFAULT 'COMPLETED'
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      batch_id TEXT NOT NULL REFERENCES inventory_batches(id),
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      taxable_value REAL NOT NULL,
      gst_rate REAL NOT NULL,
      cgst REAL DEFAULT 0.0,
      sgst REAL DEFAULT 0.0,
      total_amount REAL NOT NULL
    );

    -- 8. Expiry Returns Workflow
    CREATE TABLE IF NOT EXISTS expiry_returns (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL REFERENCES inventory_batches(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      quantity REAL NOT NULL,
      expiry_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'IDENTIFIED', -- 'IDENTIFIED', 'SUPPLIER_CONTACTED', 'RETURN_REQUESTED', 'APPROVED', 'HANDED_OVER', 'CREDIT_RECEIVED', 'WRITTEN_OFF'
      credit_note_ref TEXT,
      amount_recovered REAL DEFAULT 0.0,
      unrecoverable_loss REAL DEFAULT 0.0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 9. Staff Tasks & Daily SOPs
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      assigned_to TEXT NOT NULL, -- 'Billing Staff', 'Stock Staff', 'Owner'
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'NORMAL', -- 'URGENT', 'HIGH', 'NORMAL'
      status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED'
      due_date DATE NOT NULL,
      completed_at DATETIME,
      verified_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 11. GST Accounting Periods
    CREATE TABLE IF NOT EXISTS gst_periods (
      id TEXT PRIMARY KEY,
      period_name TEXT NOT NULL, -- e.g. 'Q1-2026-27'
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_closed INTEGER NOT NULL DEFAULT 0,
      closed_at DATETIME,
      closed_by TEXT,
      notes TEXT
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const locCount = db.prepare('SELECT COUNT(*) as count FROM locations').get().count;
  if (locCount > 0) return; // Already seeded

  console.log('Seeding initial business data for Hari Om Traders...');

  const insertLoc = db.prepare('INSERT INTO locations (id, name, type, description) VALUES (?, ?, ?, ?)');
  const insertRack = db.prepare('INSERT INTO racks (id, location_id, rack_code, description) VALUES (?, ?, ?, ?)');
  const insertSec = db.prepare('INSERT INTO sections (id, rack_id, section_code, description) VALUES (?, ?, ?, ?)');

  // 1. Locations
  insertLoc.run('loc-main', 'Main Shop', 'MAIN_SHOP', 'Front customer-facing area with 10-12 racks & 8 sections');
  insertLoc.run('loc-second', 'Second Shop', 'SECOND_SHOP', 'Additional stock & expiry-sensitive holding area');
  insertLoc.run('loc-godown', 'Back Godown', 'BACK_GODOWN', 'Bulk cartons and reserve inventory storage');

  // Racks for Main Shop (Rack 1 to 12)
  for (let r = 1; r <= 12; r++) {
    const rackId = `rack-main-${r}`;
    const code = `Rack ${r < 10 ? '0' + r : r}`;
    insertRack.run(rackId, 'loc-main', code, `Main Shop Aisle Display Rack ${r}`);
    
    // Sections A to D for each rack
    ['Section A', 'Section B', 'Section C', 'Section D'].forEach((sec, idx) => {
      insertSec.run(`sec-main-${r}-${idx + 1}`, rackId, sec, `Shelf level ${idx + 1}`);
    });
  }

  // Racks for Second Shop (4 racks)
  for (let r = 1; r <= 4; r++) {
    const rackId = `rack-sec-${r}`;
    insertRack.run(rackId, 'loc-second', `Sec-Rack ${r}`, `Second Shop Storage Rack ${r}`);
    ['Top Shelf', 'Middle Shelf', 'Bottom Shelf'].forEach((sec, idx) => {
      insertSec.run(`sec-sec-${r}-${idx + 1}`, rackId, sec, `Level ${idx + 1}`);
    });
  }

  // Godown Aisles / Stacks
  for (let g = 1; g <= 5; g++) {
    const rackId = `rack-godown-${g}`;
    insertRack.run(rackId, 'loc-godown', `Godown Stack ${g}`, `Bulk Pallet / Carton Stack ${g}`);
    ['Pallet Base', 'Upper Tier'].forEach((sec, idx) => {
      insertSec.run(`sec-godown-${g}-${idx + 1}`, rackId, sec, `Tier ${idx + 1}`);
    });
  }

  // 2. Suppliers
  const insertSup = db.prepare(`
    INSERT INTO suppliers (id, name, business_name, gstin, phone, email, address, return_policy, return_deadline_days, credit_terms_days, outstanding_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSup.run(
    'sup-1',
    'Ramesh Agrawal',
    'Agrawal FMCG Distributors',
    '07AAACA1234A1Z5',
    '+91 98110 22341',
    'orders@agrawalfmcg.com',
    'Shop 14, Grain Market, Khari Baoli, Delhi',
    'Full credit note provided for products returned 15 days before expiry.',
    20,
    15,
    12400.00
  );

  insertSup.run(
    'sup-2',
    'Vikram Sharma',
    'Sharma Spices & Provisions',
    '07BBBCB5678B1Z2',
    '+91 98731 44552',
    'sales@sharmaspices.in',
    'Plot 42, Transport Nagar, Delhi',
    'Return acceptable only with original batch seal intact, up to 30 days prior to expiry.',
    30,
    21,
    8500.00
  );

  insertSup.run(
    'sup-3',
    'Suresh Gupta',
    'Hindustan Personal Care Agencies',
    '07CCCCD9012C1Z8',
    '+91 99580 11223',
    'hpcare.agencies@gmail.com',
    'Warehouse 8, Najafgarh Road, Delhi',
    'Company representative collects expiry stock once per calendar quarter.',
    45,
    30,
    0.00
  );

  // 3. Products
  const insertProd = db.prepare(`
    INSERT INTO products (
      id, name, brand, category, subcategory, barcode, sku, hsn_code,
      base_unit, purchase_unit, conversion_factor, purchase_price, selling_price, mrp,
      gst_rate, preferred_supplier_id, min_stock_level, max_stock_level, reorder_point
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const productsData = [
    ['prod-1', 'Tata Salt Vacuum Evaporated 1kg', 'Tata', 'Groceries', 'Salt & Sugar', '8901030383794', 'TATASALT-1KG', '2501', 'PKT', 'CARTON', 24, 21.50, 26.00, 28.00, 5, 'sup-1', 20, 150, 35],
    ['prod-2', 'Fortune Sunlite Refined Sunflower Oil 1L', 'Fortune', 'Oils & Ghee', 'Edible Oil', '8906007280053', 'FORTUNE-SUN-1L', '1512', 'POUCH', 'CARTON', 12, 115.00, 135.00, 145.00, 5, 'sup-1', 15, 80, 25],
    ['prod-3', 'Aashirvaad Shudh Chakki Atta 5kg', 'Aashirvaad', 'Groceries', 'Flours', '8901058852326', 'AASHIR-ATTA-5KG', '1101', 'BAG', 'BAG', 1, 210.00, 245.00, 260.00, 0, 'sup-1', 10, 50, 18],
    ['prod-4', 'MDH Deggi Mirch Powder 100g', 'MDH', 'Spices & Masala', 'Powder Spices', '8901967200119', 'MDH-DEGGI-100G', '0910', 'BOX', 'CARTON', 20, 68.00, 82.00, 90.00, 5, 'sup-2', 12, 60, 20],
    ['prod-5', 'Everest Garam Masala 100g', 'Everest', 'Spices & Masala', 'Blended Spices', '8901786111025', 'EVR-GARAM-100G', '0910', 'BOX', 'CARTON', 20, 72.00, 88.00, 95.00, 5, 'sup-2', 15, 60, 22],
    ['prod-6', 'Dettol Original Germ Protection Soap 125g (Buy 3 Get 1)', 'Dettol', 'Personal Care', 'Soaps', '8901396123456', 'DETTOL-125G-4PK', '3401', 'PACK', 'CARTON', 18, 142.00, 175.00, 190.00, 18, 'sup-3', 8, 40, 15],
    ['prod-7', 'Colgate Strong Teeth Dental Cream 200g', 'Colgate', 'Personal Care', 'Oral Care', '8901314010545', 'COLGATE-200G', '3306', 'TUBE', 'BOX', 12, 92.00, 115.00, 125.00, 18, 'sup-3', 10, 50, 18],
    ['prod-8', 'Surf Excel Easy Wash Detergent Powder 1kg', 'Surf Excel', 'Cleaning & Hygiene', 'Fabric Wash', '8901030704414', 'SURF-EASY-1KG', '3402', 'PKT', 'CARTON', 12, 118.00, 138.00, 150.00, 18, 'sup-3', 15, 60, 25],
    ['prod-9', 'Parle-G Gold Glucose Biscuits 1kg', 'Parle', 'Packaged Foods', 'Biscuits', '8901719102031', 'PARLE-G-1KG', '1905', 'PKT', 'CARTON', 10, 84.00, 102.00, 110.00, 18, 'sup-1', 12, 50, 20],
    ['prod-10', 'Nestle Maggi 2-Minute Noodles Masala 70g (Pack of 12)', 'Maggi', 'Packaged Foods', 'Noodles', '8901058861236', 'MAGGI-70G-12PK', '1902', 'PACK', 'CARTON', 8, 145.00, 170.00, 180.00, 12, 'sup-1', 10, 45, 18]
  ];

  for (const p of productsData) {
    insertProd.run(...p);
  }

  // 4. Batches in Main Shop, Second Shop, and Godown
  const insertBatch = db.prepare(`
    INSERT INTO inventory_batches (
      id, product_id, supplier_id, batch_number, location_id, rack_id, section_id,
      mfg_date, expiry_date, purchase_invoice_ref, purchase_price, quantity_received, quantity_remaining, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMovement = db.prepare(`
    INSERT INTO stock_movements (
      id, batch_id, product_id, movement_type, from_location_id, to_location_id, quantity, unit, reference_id, reason, performed_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const formatYMD = (d) => d.toISOString().split('T')[0];
  const addDays = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return formatYMD(d);
  };

  const batches = [
    // Tata Salt: 18 pkts in Main Shop, 48 pkts in Godown
    { id: 'b-1', prod: 'prod-1', sup: 'sup-1', batch: 'TS-2026-A1', loc: 'loc-main', rack: 'rack-main-1', sec: 'sec-main-1-1', exp: addDays(280), qty: 18, price: 21.50, status: 'AVAILABLE' },
    { id: 'b-2', prod: 'prod-1', sup: 'sup-1', batch: 'TS-2026-A1', loc: 'loc-godown', rack: 'rack-godown-1', sec: 'sec-godown-1-1', exp: addDays(280), qty: 48, price: 21.50, status: 'AVAILABLE' },

    // Fortune Oil: 8 pouches in Main Shop (LOW!), 24 in Godown
    { id: 'b-3', prod: 'prod-2', sup: 'sup-1', batch: 'FO-NOV-09', loc: 'loc-main', rack: 'rack-main-2', sec: 'sec-main-2-2', exp: addDays(180), qty: 8, price: 115.00, status: 'AVAILABLE' },
    { id: 'b-4', prod: 'prod-2', sup: 'sup-1', batch: 'FO-NOV-09', loc: 'loc-godown', rack: 'rack-godown-2', sec: 'sec-godown-2-1', exp: addDays(180), qty: 24, price: 115.00, status: 'AVAILABLE' },

    // Aashirvaad Atta: 6 bags in Main Shop, 20 in Godown
    { id: 'b-5', prod: 'prod-3', sup: 'sup-1', batch: 'ATT-OCT-22', loc: 'loc-main', rack: 'rack-main-3', sec: 'sec-main-3-1', exp: addDays(75), qty: 6, price: 210.00, status: 'AVAILABLE' },
    { id: 'b-6', prod: 'prod-3', sup: 'sup-1', batch: 'ATT-OCT-22', loc: 'loc-godown', rack: 'rack-godown-3', sec: 'sec-godown-3-1', exp: addDays(75), qty: 20, price: 210.00, status: 'AVAILABLE' },

    // MDH Deggi Mirch: EXPIRING IN 12 DAYS! (Moved to Second Shop expiry section)
    { id: 'b-7', prod: 'prod-4', sup: 'sup-2', batch: 'MDH-DM-EXP12', loc: 'loc-second', rack: 'rack-sec-1', sec: 'sec-sec-1-1', exp: addDays(12), qty: 5, price: 68.00, status: 'NEAR_EXPIRY' },
    { id: 'b-8', prod: 'prod-4', sup: 'sup-2', batch: 'MDH-DM-FRESH', loc: 'loc-main', rack: 'rack-main-4', sec: 'sec-main-4-2', exp: addDays(340), qty: 25, price: 68.00, status: 'AVAILABLE' },

    // Everest Garam Masala: EXPIRED 4 DAYS AGO! In Second Shop
    { id: 'b-9', prod: 'prod-5', sup: 'sup-2', batch: 'EVR-GM-OLD', loc: 'loc-second', rack: 'rack-sec-2', sec: 'sec-sec-2-1', exp: addDays(-4), qty: 4, price: 72.00, status: 'EXPIRED' },
    { id: 'b-10', prod: 'prod-5', sup: 'sup-2', batch: 'EVR-GM-NEW', loc: 'loc-main', rack: 'rack-main-4', sec: 'sec-main-4-3', exp: addDays(290), qty: 16, price: 72.00, status: 'AVAILABLE' },

    // Dettol Soap: 14 packs in Main Shop
    { id: 'b-11', prod: 'prod-6', sup: 'sup-3', batch: 'DET-8812', loc: 'loc-main', rack: 'rack-main-5', sec: 'sec-main-5-1', exp: addDays(400), qty: 14, price: 142.00, status: 'AVAILABLE' },

    // Maggi: 7 packs in Main Shop (Low!), 20 in Godown
    { id: 'b-12', prod: 'prod-10', sup: 'sup-1', batch: 'MAG-2026-X', loc: 'loc-main', rack: 'rack-main-6', sec: 'sec-main-6-2', exp: addDays(190), qty: 7, price: 145.00, status: 'AVAILABLE' },
    { id: 'b-13', prod: 'prod-10', sup: 'sup-1', batch: 'MAG-2026-X', loc: 'loc-godown', rack: 'rack-godown-4', sec: 'sec-godown-4-1', exp: addDays(190), qty: 20, price: 145.00, status: 'AVAILABLE' }
  ];

  for (const b of batches) {
    insertBatch.run(
      b.id, b.prod, b.sup, b.batch, b.loc, b.rack, b.sec,
      formatYMD(today), b.exp, 'INV-INIT-001', b.price, b.qty, b.qty, b.status
    );
    insertMovement.run(
      `mov-${b.id}`, b.id, b.prod, 'INWARD', null, b.loc, b.qty, 'UNIT', 'INV-INIT-001', 'Initial stock take onboarding', 'System Admin'
    );
  }

  // 5. Expiry Return Record for expired Everest Masala
  db.prepare(`
    INSERT INTO expiry_returns (id, batch_id, product_id, supplier_id, quantity, expiry_date, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'ret-1', 'b-9', 'prod-5', 'sup-2', 4, addDays(-4), 'IDENTIFIED',
    'Identified during weekly audit in Second Shop. Supplier Vikram Sharma to be contacted for credit note.'
  );

  // 6. Sample Daily Tasks for Staff
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, assigned_to, title, description, priority, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertTask.run(
    'task-1',
    'Stock Staff',
    'Transfer Fortune Oil (1 Carton / 12 Pouches) from Godown to Main Shop Rack 02',
    'Main shop is low on Fortune Oil (8 left). Shift 1 carton from Godown Stack 2 to Rack 02 Section B.',
    'HIGH',
    'PENDING',
    formatYMD(today)
  );

  insertTask.run(
    'task-2',
    'Stock Staff',
    'Verify Expiry on MDH Deggi Mirch (Batch MDH-DM-EXP12)',
    'Check physical condition of 5 boxes in Second Shop Sec-Rack 1.',
    'URGENT',
    'PENDING',
    formatYMD(today)
  );

  insertTask.run(
    'task-3',
    'Billing Staff',
    'Counter Barcode & Thermal Roll Verification',
    'Verify thermal printer paper roll and barcode scanner connectivity before peak evening rush.',
    'NORMAL',
    'COMPLETED',
    formatYMD(today)
  );

  // 7. Audit Log
  db.prepare(`
    INSERT INTO audit_logs (id, user_name, action, module, details)
    VALUES (?, ?, ?, ?, ?)
  `).run('audit-1', 'Owner', 'SYSTEM_INITIALIZATION', 'SETTINGS', 'Initial database schema and business parameters initialized.');

  console.log('Database successfully seeded with realistic shop data!');
}

initSchema();

module.exports = {
  db,
  initSchema
};
