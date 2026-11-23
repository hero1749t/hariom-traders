const fs = require('fs');

let code = fs.readFileSync('D:/hariom-traders/client/src/App.jsx', 'utf8');

// Replace fn.includes('43') and fn.includes('45')
code = code.replace("fn.includes('43') || ", "");
code = code.replace("fn.includes('45') || ", "");

// Update prompt to be adaptive
code = code.replace(
  'Extract Indian GST or Cash Memo invoice data from this image.',
  'Extract Indian wholesale/retail invoice, GST tax bill, cash memo, or handwritten shop counter bill from this image. Adaptively identify items, rates, quantities, and totals.'
);

fs.writeFileSync('D:/hariom-traders/client/src/App.jsx', code, 'utf8');
console.log('App.jsx patched successfully.');
