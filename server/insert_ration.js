const Database = require('better-sqlite3');
const db = new Database('D:/hariom-traders/server/hariom.db');

const items = [
  {
    id: 'prod-aata-40kg',
    name: 'Chakki Fresh Aata (40 Kg Bori)',
    brand: 'Hari Om Special',
    category: 'Wholesale Ration & Grains',
    subcategory: 'Flour (Aata & Maida)',
    base_unit: 'BAG (40 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 1,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381142',
    sku: 'AATA-40KG'
  },
  {
    id: 'prod-maida-40kg',
    name: 'Fine Maida (40 Kg Bori)',
    brand: 'Hari Om Special',
    category: 'Wholesale Ration & Grains',
    subcategory: 'Flour (Aata & Maida)',
    base_unit: 'BAG (40 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 1,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381159',
    sku: 'MAIDA-40KG'
  },
  {
    id: 'prod-chawal-sona-masoori',
    name: 'Chawal Sona Masoori (Sepis / CP)',
    brand: 'Sona Masoori',
    category: 'Wholesale Ration & Grains',
    subcategory: 'Rice & Paddy',
    base_unit: 'BAG (25/50 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 1,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381166',
    sku: 'CHAWAL-SONA-MAS'
  },
  {
    id: 'prod-chawal-panghat-khanda',
    name: 'Panghat Khanda Chawal',
    brand: 'Panghat',
    category: 'Wholesale Ration & Grains',
    subcategory: 'Rice & Paddy',
    base_unit: 'BAG (25/50 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 1,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381173',
    sku: 'PANGHAT-KHANDA'
  },
  {
    id: 'prod-chawal-panghat-pauna',
    name: 'Panghat Pauna Chawal',
    brand: 'Panghat',
    category: 'Wholesale Ration & Grains',
    subcategory: 'Rice & Paddy',
    base_unit: 'BAG (25/50 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 1,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381180',
    sku: 'PANGHAT-PAUNA'
  },
  {
    id: 'prod-chawal-parmal',
    name: 'Parmal Rice (Chawal)',
    brand: 'Parmal',
    category: 'Wholesale Ration & Grains',
    subcategory: 'Rice & Paddy',
    base_unit: 'BAG (25/50 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 1,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381197',
    sku: 'PARMAL-CHAWAL'
  }
];

const insert = db.prepare(`
  INSERT INTO products (
    id, name, brand, category, subcategory, barcode, sku, hsn_code,
    base_unit, purchase_unit, conversion_factor, purchase_price, selling_price, mrp,
    gst_rate, preferred_supplier_id, min_stock_level, max_stock_level, reorder_point, status
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, '1006',
    ?, ?, ?, ?, ?, ?,
    0, 'sup-jindal', 5, 200, 10, 'active'
  ) ON CONFLICT(id) DO UPDATE SET
    name=excluded.name,
    category=excluded.category,
    subcategory=excluded.subcategory,
    base_unit=excluded.base_unit
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
console.log('Prepared ration & grains categories in hariom.db');
