const Database = require('better-sqlite3');
const db = new Database('D:/hariom-traders/server/hariom.db');

const items = [
  // 1. Edible Oils
  {
    id: 'prod-fortune-mustard-1l',
    name: 'Fortune Kachi Ghani Mustard Oil (1L Pkt)',
    brand: 'Fortune',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Edible Oils',
    base_unit: 'PKT (1L)',
    purchase_unit: 'BOX (16 PKT)',
    conversion_factor: 16,
    purchase_price: 0,
    selling_price: 215,
    mrp: 235,
    barcode: '8901262010015',
    sku: 'FORT-MUST-1L'
  },
  {
    id: 'prod-fortune-refined-1l',
    name: 'Fortune Sunlite Refined Oil (1L Pkt)',
    brand: 'Fortune',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Edible Oils',
    base_unit: 'PKT (1L)',
    purchase_unit: 'BOX (16 PKT)',
    conversion_factor: 16,
    purchase_price: 0,
    selling_price: 170,
    mrp: 190,
    barcode: '8901262020014',
    sku: 'FORT-REF-1L'
  },
  {
    id: 'prod-local-refined-1l',
    name: 'Local Refined Oil (1L Pkt)',
    brand: 'Local',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Edible Oils',
    base_unit: 'PKT (1L)',
    purchase_unit: 'TIN / BOX (16 PKT)',
    conversion_factor: 16,
    purchase_price: 0,
    selling_price: 140,
    mrp: 160,
    barcode: '8901262030013',
    sku: 'LOC-REF-1L'
  },

  // 2. Soaps & Bars - ₹10 MRP (1 Dozen / 12 pcs)
  {
    id: 'prod-rin-bar-10-dz',
    name: 'Rin Washing Bar (MRP 10) - 1 Dozen (12 Pcs)',
    brand: 'HUL',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Laundry & Dishwashing',
    base_unit: 'DZ (12 PCS)',
    purchase_unit: 'BOX',
    conversion_factor: 12,
    purchase_price: 0,
    selling_price: 110,
    mrp: 120,
    barcode: '8901030381012',
    sku: 'RIN-BAR-10-DZ'
  },
  {
    id: 'prod-lifebuoy-10-dz',
    name: 'Lifebuoy Bath Soap (MRP 10) - 1 Dozen (12 Pcs)',
    brand: 'HUL',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Personal Care / Bathing',
    base_unit: 'DZ (12 PCS)',
    purchase_unit: 'BOX',
    conversion_factor: 12,
    purchase_price: 0,
    selling_price: 110,
    mrp: 120,
    barcode: '8901030381029',
    sku: 'LIFEBUOY-10-DZ'
  },
  {
    id: 'prod-lux-10-dz',
    name: 'Lux Beauty Soap (MRP 10) - 1 Dozen (12 Pcs)',
    brand: 'HUL',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Personal Care / Bathing',
    base_unit: 'DZ (12 PCS)',
    purchase_unit: 'BOX',
    conversion_factor: 12,
    purchase_price: 0,
    selling_price: 110,
    mrp: 120,
    barcode: '8901030381036',
    sku: 'LUX-10-DZ'
  },
  {
    id: 'prod-vim-bar-10-dz',
    name: 'Vim Dishwash Bar (MRP 10) - 1 Dozen (12 Pcs)',
    brand: 'HUL',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Laundry & Dishwashing',
    base_unit: 'DZ (12 PCS)',
    purchase_unit: 'BOX',
    conversion_factor: 12,
    purchase_price: 0,
    selling_price: 110,
    mrp: 120,
    barcode: '8901030381043',
    sku: 'VIM-BAR-10-DZ'
  },
  {
    id: 'prod-exo-bar-10-dz',
    name: 'Exo Dishwash Bar (MRP 10) - 1 Dozen (12 Pcs)',
    brand: 'Jyothy',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Laundry & Dishwashing',
    base_unit: 'DZ (12 PCS)',
    purchase_unit: 'BOX',
    conversion_factor: 12,
    purchase_price: 0,
    selling_price: 105,
    mrp: 120,
    barcode: '8901030381098',
    sku: 'EXO-BAR-10-DZ'
  },
  {
    id: 'prod-fena-bar-10-dz',
    name: 'Fena Detergent Bar (MRP 10) - 1 Dozen (12 Pcs)',
    brand: 'Fena',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Laundry & Dishwashing',
    base_unit: 'DZ (12 PCS)',
    purchase_unit: 'BOX',
    conversion_factor: 12,
    purchase_price: 0,
    selling_price: 105,
    mrp: 120,
    barcode: '8901030381104',
    sku: 'FENA-BAR-10-DZ'
  },

  // 3. Soaps & Bars - ₹5 MRP (24 Pcs Pack)
  {
    id: 'prod-rin-bar-5-24p',
    name: 'Rin Washing Bar (MRP 5) - Pack of 24 Pcs',
    brand: 'HUL',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Laundry & Dishwashing',
    base_unit: 'PACK (24 PCS)',
    purchase_unit: 'BOX',
    conversion_factor: 24,
    purchase_price: 0,
    selling_price: 110,
    mrp: 120,
    barcode: '8901030381050',
    sku: 'RIN-BAR-5-24P'
  },
  {
    id: 'prod-lifebuoy-5-24p',
    name: 'Lifebuoy Bath Soap (MRP 5) - Pack of 24 Pcs',
    brand: 'HUL',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Personal Care / Bathing',
    base_unit: 'PACK (24 PCS)',
    purchase_unit: 'BOX',
    conversion_factor: 24,
    purchase_price: 0,
    selling_price: 110,
    mrp: 120,
    barcode: '8901030381067',
    sku: 'LIFEBUOY-5-24P'
  },
  {
    id: 'prod-lux-5-24p',
    name: 'Lux Beauty Soap (MRP 5) - Pack of 24 Pcs',
    brand: 'HUL',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Personal Care / Bathing',
    base_unit: 'PACK (24 PCS)',
    purchase_unit: 'BOX',
    conversion_factor: 24,
    purchase_price: 0,
    selling_price: 110,
    mrp: 120,
    barcode: '8901030381074',
    sku: 'LUX-5-24P'
  },
  {
    id: 'prod-vim-bar-5-24p',
    name: 'Vim Dishwash Bar (MRP 5) - Pack of 24 Pcs',
    brand: 'HUL',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Laundry & Dishwashing',
    base_unit: 'PACK (24 PCS)',
    purchase_unit: 'BOX',
    conversion_factor: 24,
    purchase_price: 0,
    selling_price: 110,
    mrp: 120,
    barcode: '8901030381081',
    sku: 'VIM-BAR-5-24P'
  },
  {
    id: 'prod-exo-bar-5-24p',
    name: 'Exo Dishwash Bar (MRP 5) - Pack of 24 Pcs',
    brand: 'Jyothy',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Laundry & Dishwashing',
    base_unit: 'PACK (24 PCS)',
    purchase_unit: 'BOX',
    conversion_factor: 24,
    purchase_price: 0,
    selling_price: 105,
    mrp: 120,
    barcode: '8901030381111',
    sku: 'EXO-BAR-5-24P'
  },

  // 4. Detergent Powders (Surf)
  {
    id: 'prod-surf-excel-10-dz',
    name: 'Surf Excel Detergent Powder (MRP 10) - 1 Dozen (12 Pkts)',
    brand: 'HUL',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Detergents & Powders',
    base_unit: 'DZ (12 PKTS)',
    purchase_unit: 'BOX',
    conversion_factor: 12,
    purchase_price: 0,
    selling_price: 108,
    mrp: 120,
    barcode: '8901030381128',
    sku: 'SURF-EXCEL-10-DZ'
  },
  {
    id: 'prod-all-in-one-surf-10-dz',
    name: 'All-In-One Detergent Powder (MRP 10) - 1 Dozen (12 Pkts)',
    brand: 'Local / Regional',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Detergents & Powders',
    base_unit: 'DZ (12 PKTS)',
    purchase_unit: 'BOX',
    conversion_factor: 12,
    purchase_price: 0,
    selling_price: 102,
    mrp: 120,
    barcode: '8901030381135',
    sku: 'ALL-IN-ONE-10-DZ'
  }
];

const insert = db.prepare(`
  INSERT INTO products (
    id, name, brand, category, subcategory, barcode, sku, hsn_code,
    base_unit, purchase_unit, conversion_factor, purchase_price, selling_price, mrp,
    gst_rate, preferred_supplier_id, min_stock_level, max_stock_level, reorder_point, status
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, '3401',
    ?, ?, ?, ?, ?, ?,
    18, 'sup-jindal', 10, 500, 20, 'active'
  ) ON CONFLICT(id) DO UPDATE SET
    name=excluded.name,
    selling_price=excluded.selling_price,
    mrp=excluded.mrp,
    base_unit=excluded.base_unit,
    purchase_unit=excluded.purchase_unit,
    conversion_factor=excluded.conversion_factor,
    category=excluded.category,
    subcategory=excluded.subcategory
`);

const tx = db.transaction(() => {
  for (const it of items) {
    insert.run(
      it.id,
      it.name,
      it.brand,
      it.category,
      it.subcategory,
      it.barcode,
      it.sku,
      it.base_unit,
      it.purchase_unit,
      it.conversion_factor,
      it.purchase_price,
      it.selling_price,
      it.mrp
    );
  }
});

tx();
console.log('Saved all ' + items.length + ' grocery, oil, soap, and detergent products to hariom.db');
