const Database = require('better-sqlite3');

const dbPath = 'D:/hariom-traders/server/hariom.db';
const db = new Database(dbPath);

const items = [
  // Beedi & Tobacco / Pan Masala
  { name: 'Yamuna Filter (10)', category: 'Wholesale Beedi & Tobacco', price: 160, mrp: 200 },
  { name: 'Golden Seal (10)', category: 'Wholesale Beedi & Tobacco', price: 160, mrp: 200 },
  { name: 'Panchee (10)', category: 'Wholesale Beedi & Tobacco', price: 150, mrp: 180 },
  { name: 'Panchee (20)', category: 'Wholesale Beedi & Tobacco', price: 300, mrp: 360 },
  { name: 'Dilbagh 3-Pack Set', category: 'Wholesale Beedi & Tobacco', price: 390, mrp: 450 },
  { name: 'Dilbagh Single Packet', category: 'Wholesale Beedi & Tobacco', price: 130, mrp: 150 },
  { name: 'Tansen', category: 'Wholesale Beedi & Tobacco', price: 220, mrp: 250 },
  { name: 'Tulsi', category: 'Wholesale Beedi & Tobacco', price: 120, mrp: 140 },
  { name: 'Kamla Pasand', category: 'Wholesale Beedi & Tobacco', price: 180, mrp: 200 },
  { name: 'Rajnigandha', category: 'Wholesale Beedi & Tobacco', price: 440, mrp: 500 },
  { name: 'Chaini Khaini', category: 'Wholesale Beedi & Tobacco', price: 310, mrp: 350 },
  { name: 'Mahindra Bolero Beedi (10)', category: 'Wholesale Beedi & Tobacco', price: 170, mrp: 200 },
  { name: 'Ghoda Beedi', category: 'Wholesale Beedi & Tobacco', price: 500, mrp: 550 },
  { name: '27 Number Beedi', category: 'Wholesale Beedi & Tobacco', price: 500, mrp: 550 },
  { name: 'Mohan Beedi', category: 'Wholesale Beedi & Tobacco', price: 190, mrp: 220 },
  { name: 'Swagat Sudarshan Chhota', category: 'Wholesale Beedi & Tobacco', price: 200, mrp: 240 },
  { name: 'Swagat Sudarshan Bada (Golden)', category: 'Wholesale Beedi & Tobacco', price: 280, mrp: 320 },
  { name: 'Light Beedi', category: 'Wholesale Beedi & Tobacco', price: 380, mrp: 420 },
  { name: 'Cards Box (Dabba)', category: 'Wholesale Beedi & Tobacco', price: 260, mrp: 300 },
  { name: 'Bahubali', category: 'Wholesale Beedi & Tobacco', price: 130, mrp: 150 },

  // Cigarettes
  { name: 'Capstan', category: 'Cigarettes & Smoking', price: 85, mrp: 100 },
  { name: 'Gold Flake Chhoti (Small)', category: 'Cigarettes & Smoking', price: 85, mrp: 100 },
  { name: 'Gold Flake Badi (Big)', category: 'Cigarettes & Smoking', price: 125, mrp: 140 },
  { name: 'Advance Chhoti', category: 'Cigarettes & Smoking', price: 115, mrp: 130 },
  { name: 'Connect', category: 'Cigarettes & Smoking', price: 300, mrp: 350 },
  { name: 'Classic', category: 'Cigarettes & Smoking', price: 455, mrp: 500 },
  { name: 'Total Chhoti (Small)', category: 'Cigarettes & Smoking', price: 60, mrp: 70 },
  { name: 'Total Badi (Large)', category: 'Cigarettes & Smoking', price: 90, mrp: 100 },
  { name: 'Indie Mint Gold Flake', category: 'Cigarettes & Smoking', price: 115, mrp: 130 },
  { name: 'Wave', category: 'Cigarettes & Smoking', price: 60, mrp: 70 }
];

const insert = db.prepare(`
  INSERT INTO products (
    id, name, brand, category, subcategory, barcode, sku, hsn_code,
    base_unit, purchase_unit, conversion_factor, purchase_price, selling_price, mrp,
    gst_rate, preferred_supplier_id, min_stock_level, max_stock_level, reorder_point, status
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?,
    'pkt', 'box', 1, 0, ?, ?,
    18, 'sup-jindal', 10, 500, 20, 'active'
  ) ON CONFLICT(id) DO UPDATE SET
    selling_price=excluded.selling_price,
    mrp=excluded.mrp,
    name=excluded.name,
    category=excluded.category
`);

const tx = db.transaction(() => {
  for (const it of items) {
    const id = 'prod-' + it.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
    insert.run(
      id,
      it.name,
      it.category.includes('Cigarette') ? 'ITC' : 'Hari Om Wholesale',
      it.category,
      'Wholesale',
      '890' + Math.floor(1000000000 + Math.random() * 9000000000),
      id.toUpperCase(),
      '2402',
      it.price,
      it.mrp
    );
  }
});

tx();
console.log('Successfully inserted/updated ' + items.length + ' wholesale items into hariom.db');
