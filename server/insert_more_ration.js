const Database = require('better-sqlite3');
const db = new Database('D:/hariom-traders/server/hariom.db');

const items = [
  // Aata Packets
  {
    id: 'prod-hp-aata-10kg',
    name: 'HP Fresh Chakki Aata (10 Kg Bag)',
    brand: 'HP',
    category: 'Wholesale Ration & Grains',
    subcategory: 'Flour (Aata & Maida)',
    base_unit: 'BAG (10 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 1,
    purchase_price: 0,
    selling_price: 355,
    mrp: 380,
    barcode: '8901030381203',
    sku: 'HP-AATA-10KG'
  },
  {
    id: 'prod-purnagiri-aata-10kg',
    name: 'Purnagiri Chakki Aata (10 Kg Bag)',
    brand: 'Purnagiri',
    category: 'Wholesale Ration & Grains',
    subcategory: 'Flour (Aata & Maida)',
    base_unit: 'BAG (10 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 1,
    purchase_price: 0,
    selling_price: 350,
    mrp: 380,
    barcode: '8901030381210',
    sku: 'PURNAGIRI-10KG'
  },
  {
    id: 'prod-hp-aata-5kg',
    name: 'HP Fresh Chakki Aata (5 Kg Bag)',
    brand: 'HP',
    category: 'Wholesale Ration & Grains',
    subcategory: 'Flour (Aata & Maida)',
    base_unit: 'BAG (5 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 1,
    purchase_price: 0,
    selling_price: 185,
    mrp: 200,
    barcode: '8901030381227',
    sku: 'HP-AATA-5KG'
  },
  {
    id: 'prod-patanjali-aata-10kg',
    name: 'Patanjali Traditional Whole Wheat Aata (10 Kg)',
    brand: 'Patanjali',
    category: 'Wholesale Ration & Grains',
    subcategory: 'Flour (Aata & Maida)',
    base_unit: 'BAG (10 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 1,
    purchase_price: 0,
    selling_price: 450,
    mrp: 475,
    barcode: '8901030381234',
    sku: 'PATANJALI-10KG'
  },

  // Pulses & Legumes (Daal & Rajma)
  {
    id: 'prod-rajma-chitra',
    name: 'Rajma Chitra (Special)',
    brand: 'Hari Om Special',
    category: 'Wholesale Pulses & Daal',
    subcategory: 'Rajma & Chana',
    base_unit: 'KG / BAG (30 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 30,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381241',
    sku: 'RAJMA-CHITRA'
  },
  {
    id: 'prod-rajma-lal',
    name: 'Rajma Lal (Red)',
    brand: 'Hari Om Special',
    category: 'Wholesale Pulses & Daal',
    subcategory: 'Rajma & Chana',
    base_unit: 'KG / BAG (30 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 30,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381258',
    sku: 'RAJMA-LAL'
  },
  {
    id: 'prod-chana-daal',
    name: 'Chana Daal (Special)',
    brand: 'Hari Om Special',
    category: 'Wholesale Pulses & Daal',
    subcategory: 'Daal',
    base_unit: 'KG / BAG (30 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 30,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381265',
    sku: 'CHANA-DAAL'
  },
  {
    id: 'prod-urad-chilka',
    name: 'Urad Daal Chilka',
    brand: 'Hari Om Special',
    category: 'Wholesale Pulses & Daal',
    subcategory: 'Daal',
    base_unit: 'KG / BAG (30 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 30,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381272',
    sku: 'URAD-CHILKA'
  },
  {
    id: 'prod-kaali-urad-sabut',
    name: 'Kaali Urad Sabut (Black Gram Whole)',
    brand: 'Hari Om Special',
    category: 'Wholesale Pulses & Daal',
    subcategory: 'Daal',
    base_unit: 'KG / BAG (30 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 30,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381289',
    sku: 'KAALI-URAD-SABUT'
  },
  {
    id: 'prod-moong-chilka',
    name: 'Moong Daal Chilka',
    brand: 'Hari Om Special',
    category: 'Wholesale Pulses & Daal',
    subcategory: 'Daal',
    base_unit: 'KG / BAG (30 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 30,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381296',
    sku: 'MOONG-CHILKA'
  },
  {
    id: 'prod-dhuli-moong',
    name: 'Moong Daal Dhuli (Yellow)',
    brand: 'Hari Om Special',
    category: 'Wholesale Pulses & Daal',
    subcategory: 'Daal',
    base_unit: 'KG / BAG (30 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 30,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381302',
    sku: 'DHULI-MOONG'
  },
  {
    id: 'prod-dhuli-urad',
    name: 'Urad Daal Dhuli (White)',
    brand: 'Hari Om Special',
    category: 'Wholesale Pulses & Daal',
    subcategory: 'Daal',
    base_unit: 'KG / BAG (30 KG)',
    purchase_unit: 'BAG',
    conversion_factor: 30,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381319',
    sku: 'DHULI-URAD'
  },

  // Soya & Pasta
  {
    id: 'prod-soyabean-moti',
    name: 'Soyabean Badi / Chunks (Moti Wali)',
    brand: 'Hari Om Special',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Soya & Pasta',
    base_unit: 'KG / SACK (20 KG)',
    purchase_unit: 'SACK',
    conversion_factor: 20,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381326',
    sku: 'SOYA-MOTI'
  },
  {
    id: 'prod-soyabean-chhoti',
    name: 'Soyabean Mini Chunks (Chhoti Wali)',
    brand: 'Hari Om Special',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Soya & Pasta',
    base_unit: 'KG / SACK (20 KG)',
    purchase_unit: 'SACK',
    conversion_factor: 20,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381333',
    sku: 'SOYA-CHHOTI'
  },
  {
    id: 'prod-macaroni',
    name: 'Fine Semolina Macaroni',
    brand: 'Hari Om Special',
    category: 'Wholesale Grocery (Parchun)',
    subcategory: 'Soya & Pasta',
    base_unit: 'KG / SACK (20 KG)',
    purchase_unit: 'SACK',
    conversion_factor: 20,
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    barcode: '8901030381340',
    sku: 'MACARONI-BULK'
  }
];

const insert = db.prepare(`
  INSERT INTO products (
    id, name, brand, category, subcategory, barcode, sku, hsn_code,
    base_unit, purchase_unit, conversion_factor, purchase_price, selling_price, mrp,
    gst_rate, preferred_supplier_id, min_stock_level, max_stock_level, reorder_point, status
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, '1101',
    ?, ?, ?, ?, ?, ?,
    0, 'sup-jindal', 5, 200, 10, 'active'
  ) ON CONFLICT(id) DO UPDATE SET
    name=excluded.name,
    category=excluded.category,
    subcategory=excluded.subcategory,
    base_unit=excluded.base_unit,
    selling_price=excluded.selling_price,
    mrp=excluded.mrp
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
console.log('Saved ' + items.length + ' additional ration, pulse, and aata lines to hariom.db');
