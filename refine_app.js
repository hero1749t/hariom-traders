const fs = require('fs');

const appPath = 'D:/hariom-traders/client/src/App.jsx';
let code = fs.readFileSync(appPath, 'utf8');

// 1. Replace parseBillFallback completely
const oldFallbackStart = code.indexOf('const parseBillFallback = (filename) => {');
const oldFallbackEnd = code.indexOf('const callGeminiInvoiceOCR = async (file, apiKey) => {');

if (oldFallbackStart !== -1 && oldFallbackEnd !== -1) {
  const newFallback = `const parseBillFallback = (filename) => {
    // 100% Clean Blank Bill Template (NO mock or fake vendor data)
    return {
      supplier_name: '',
      supplier_gstin: '',
      invoice_number: \`INV-\${Date.now().toString().slice(-4)}\`,
      invoice_date: new Date().toISOString().split('T')[0],
      buyer_name: 'SHREE HARI OM TRADERS',
      buyer_gstin: '05DKWPS9122N1Z5',
      is_gst_bill: 1,
      items: [
        {
          raw_name: '',
          product_name: '',
          category: 'Wholesale Grocery (Parchun)',
          quantity: 1,
          unit: 'PCS',
          rate: 0,
          taxable_value: 0,
          gst_rate: 5,
          cgst: 0,
          sgst: 0,
          wholesale_price: 0,
          retail_price: 0,
          total_amount: 0,
          destination_location_id: 'loc-main'
        }
      ],
      subtotal: 0,
      total_cgst: 0,
      total_sgst: 0,
      total_igst: 0,
      round_off: 0,
      grand_total: 0,
      mathCheck: { isValid: true }
    };
  };

  `;

  code = code.slice(0, oldFallbackStart) + newFallback + code.slice(oldFallbackEnd);
  console.log('parseBillFallback replaced with clean version.');
}

// 2. Enhance callGeminiInvoiceOCR
const oldOcrStart = code.indexOf('const callGeminiInvoiceOCR = async (file, apiKey) => {');
const oldOcrEnd = code.indexOf('const handleOpenManualBill = () => {');

if (oldOcrStart !== -1 && oldOcrEnd !== -1) {
  const newOcr = `const callGeminiInvoiceOCR = async (file, apiKey) => {
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result;
        resolve(res.includes(',') ? res.split(',')[1] : res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const mimeType = file.type || 'image/jpeg';
    const promptText = \`You are an AI bill reader for an Indian retail & wholesale grocery store (Shree Hari Om Traders).
Extract invoice details from this bill image (whether computer GST tax invoice, cash memo, or handwritten counter parcha).
Return ONLY valid JSON (no markdown formatting, no text before or after), with exact keys:
{
  "supplier_name": "Supplier / Vendor / Agency Name",
  "supplier_gstin": "15-digit GSTIN or blank",
  "invoice_number": "Bill/Invoice Number",
  "invoice_date": "YYYY-MM-DD",
  "is_gst_bill": true,
  "items": [
    {
      "product_name": "Product Name",
      "category": "Wholesale Beedi & Tobacco / Cigarettes & Smoking / Wholesale Grocery (Parchun) / Wholesale Ration & Grains / General",
      "quantity": 1,
      "unit": "PCS / PKT / BOX / BAG",
      "rate": 100.0,
      "taxable_value": 100.0,
      "gst_rate": 5,
      "cgst": 2.5,
      "sgst": 2.5,
      "wholesale_price": 105.0,
      "retail_price": 115.0,
      "total_amount": 105.0,
      "destination_location_id": "loc-main"
    }
  ],
  "subtotal": 100.0,
  "total_cgst": 2.5,
  "total_sgst": 2.5,
  "total_igst": 0,
  "grand_total": 105.0
}\`;

    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let lastError = null;

    for (const model of models) {
      try {
        const apiRes = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${model}:generateContent?key=\${apiKey}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: promptText },
                { inline_data: { mime_type: mimeType, data: base64Data } }
              ]
            }]
          })
        });

        const resObj = await apiRes.json();
        if (!apiRes.ok || resObj.error) {
          lastError = new Error(resObj.error?.message || \`HTTP \${apiRes.status}\`);
          continue;
        }

        const rawText = resObj.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const firstBrace = rawText.indexOf('{');
          const lastBrace = rawText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            const parsed = JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
            parsed.mathCheck = { isValid: true };
            return parsed;
          }
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Gemini Vision could not parse this bill image.');
  };

  `;

  code = code.slice(0, oldOcrStart) + newOcr + code.slice(oldOcrEnd);
  console.log('callGeminiInvoiceOCR upgraded with multi-model fallback.');
}

// 3. Clean up purchasesHistory demo records
code = code.replace(/HRIDAYRAM KAJU PATISHTA 400 GM/g, 'Fortune Kachi Ghani Mustard Oil 1L');
code = code.replace(/Hridayram Kaju Patishta 400g \(Box\)/g, 'Fortune Kachi Ghani Mustard Oil 1L');
code = code.replace(/HRIDAYRAM GULAB JAMUN 1KG/g, 'Fortune Sunlite Refined Oil 1L');
code = code.replace(/Hridayram Gulab Jamun 1kg \(12 Box\)/g, 'Fortune Sunlite Refined Oil 1L');
code = code.replace(/HR KACHRI SCHEME BIG/g, 'Surf Excel 10-Rupee Pouch (1 Dozen)');
code = code.replace(/HR Kachri Scheme Big \(8 Bags\)/g, 'Surf Excel 10-Rupee Pouch (1 Dozen)');

fs.writeFileSync(appPath, code, 'utf8');
console.log('App.jsx refinement complete.');
