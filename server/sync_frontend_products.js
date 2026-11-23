const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('D:/hariom-traders/server/hariom.db');

// Delete the old demo items from the SQLite database completely!
const deleteOld = db.prepare("DELETE FROM products WHERE id IN ('prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7', 'prod-8', 'prod-9')");
deleteOld.run();

// Query all actual user products
const products = db.prepare('SELECT * FROM products').all().map(p => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  category: p.category,
  subcategory: p.subcategory || 'General',
  barcode: p.barcode,
  base_unit: p.base_unit || 'PKT',
  selling_price: p.selling_price || 0,
  mrp: p.mrp || 0,
  gst_rate: p.gst_rate || 5,
  total_stock: 50,
  main_shop_stock: 30,
  godown_stock: 20
}));

console.log('Total real wholesale products to put into frontend:', products.length);

// Now patch App.jsx to replace the old demo products in catch block!
const appPath = 'D:/hariom-traders/client/src/App.jsx';
let appCode = fs.readFileSync(appPath, 'utf8');

// Find setProducts([ ... ]) in catch block
const startMarker = 'setProducts([';
const endMarker = ']);\n      setLocations([';

const startIndex = appCode.indexOf(startMarker);
const endIndex = appCode.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = 'setProducts(' + JSON.stringify(products, null, 2) + ');\n      setLocations([';
  const before = appCode.slice(0, startIndex);
  const after = appCode.slice(endIndex + endMarker.length);
  appCode = before + replacement + after;
  fs.writeFileSync(appPath, appCode, 'utf8');
  console.log('App.jsx successfully patched with clean wholesale products!');
} else {
  console.error('Could not locate setProducts slice in App.jsx', { startIndex, endIndex });
}
