const Database = require('better-sqlite3');
const db = new Database('D:/hariom-traders/server/hariom.db');

const items = [
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
  }
];

const insert = db.prepare(`
  INSERT INTO products (
    id, name, brand, category, subcategory, barcode, sku, hsn_code,
    base_unit, purchase_unit, conversion_factor, purchase_price, selling_price, mrp,
    gst_rate, preferred_supplier_id, min_stock_level, max_stock_level, reorder_point, status
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, '1514',
    ?, ?, ?, ?, ?, ?,
    5, 'sup-jindal', 10, 500, 20, 'active'
  ) ON CONFLICT(id) DO UPDATE SET
    name=excluded.name,
    selling_price=excluded.selling_price,
    mrp=excluded.mrp,
    base_unit=excluded.base_unit,
    purchase_unit=excluded.purchase_unit,
    conversion_factor=excluded.conversion_factor
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
console.log('All 3 edible oil wholesale rates inserted/updated successfully.');
