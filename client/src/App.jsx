import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Store, ShoppingCart, Package, AlertTriangle, ArrowRightLeft, 
  FileText, CheckSquare, Users, Search, Plus, Trash2, Printer, 
  RefreshCw, CheckCircle2, Phone, MapPin, ShieldCheck, ChevronRight,
  TrendingUp, IndianRupee, Layers, Clock, AlertCircle, Barcode, Calendar,
  Camera, UploadCloud, FileCheck, Check, Sparkles, Eye, Edit, X, Key, Settings
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('Owner'); // 'Owner', 'Billing Staff', 'Stock Staff'
  const [loading, setLoading] = useState(true);

  // Gemini Vision AI & Dual Pricing Settings
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('hariom_gemini_api_key') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey);
  const [posPriceMode, setPosPriceMode] = useState('RETAIL'); // 'RETAIL' or 'WHOLESALE'

  // Core Data States
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [reorders, setReorders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [gstData, setGstData] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  // AI Invoice Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState(null);
  const [purchasesHistory, setPurchasesHistory] = useState([]);

  // POS State
  const [cart, setCart] = useState([]);
  const [posSearch, setPosSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isGstBill, setIsGstBill] = useState(false);
  const [lastBill, setLastBill] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferBatch, setTransferBatch] = useState(null);
  const [transferQty, setTransferQty] = useState(1);
  const [transferToLoc, setTransferToLoc] = useState('loc-main');

  // Invoice Management Modals
  const [viewInvoice, setViewInvoice] = useState(null);
  const [editInvoice, setEditInvoice] = useState(null);

  // Purchases Filter States (Standard starting from October 2026)
  const [purchaseBillTypeFilter, setPurchaseBillTypeFilter] = useState('ALL'); // 'ALL', 'GST', 'NON_GST'
  const [purchaseMonthFilter, setPurchaseMonthFilter] = useState('ALL'); // 'ALL', '10', '11', '12', 'Q3', 'Q4'
  const [purchaseSupplierFilter, setPurchaseSupplierFilter] = useState('ALL');
  const [purchaseSearch, setPurchaseSearch] = useState('');

  // Search & Filter States
  const [inventoryLocationFilter, setInventoryLocationFilter] = useState('ALL');
  const [productSearch, setProductSearch] = useState('');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dashRes, prodRes, locRes, expRes, reorderRes, taskRes, gstRes, supRes, purchRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/products'),
        axios.get('/api/locations'),
        axios.get('/api/expiry/alerts'),
        axios.get('/api/reorder/recommendations'),
        axios.get('/api/tasks'),
        axios.get('/api/gst/reports'),
        axios.get('/api/suppliers'),
        axios.get('/api/purchases')
      ]);

      setDashboard(dashRes.data.data);
      setProducts(prodRes.data.data);
      setLocations(locRes.data.data);
      setExpiryAlerts(expRes.data.data);
      setReorders(reorderRes.data.data);
      setTasks(taskRes.data.data);
      setGstData(gstRes.data.data);
      setSuppliers(supRes.data.data);
      setPurchasesHistory(purchRes.data.data || []);
    } catch (err) {
      console.warn('API connection failed, activating offline/cloud standalone mode with initial shop data:', err);
      // Clean Real Data from User's Actual Invoices (Jindal Agencies, The Vijaya Agencies, Krishna Agencies)
      setDashboard({
        totalProducts: 9,
        totalQuantity: 88,
        purchaseValuation: 22253.23,
        sellingValuation: 25591.28,
        mrpValuation: 27816.50,
        locationBreakdown: [
          { id: 'loc-godown', name: 'Back Godown', type: 'BACK_GODOWN', unique_products: 2, total_units: 9, inventory_value: 9802.18 },
          { id: 'loc-main', name: 'Main Shop', type: 'MAIN_SHOP', unique_products: 7, total_units: 79, inventory_value: 12451.05 },
          { id: 'loc-second', name: 'Second Shop', type: 'SECOND_SHOP', unique_products: 0, total_units: 0, inventory_value: 0.00 }
        ],
        alerts: {
          expiredCount: 0,
          nearExpiryCount: 0,
          lowStockCount: 0,
          lowStockItems: [],
          pendingTasks: 0
        },
        today: { bills_count: 0, total_sales: 0.00, cash_total: 0, upi_total: 0.00 }
      });
      setProducts([
  {
    "id": "prod_1794741654300_0",
    "name": "Fortune Kachi Ghani Mustard Oil (1L)",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "UNIT",
    "selling_price": 153.33,
    "mrp": 166.66,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794741654301_1",
    "name": "Surf Excel 10-Rupee Pouch (1 Dozen)",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "UNIT",
    "selling_price": 153.33,
    "mrp": 166.66,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794741654301_2",
    "name": "Yamuna Filter Beedi (10)",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "BAG",
    "selling_price": 1900.42,
    "mrp": 2065.68,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794741676841_0",
    "name": "Cadbury Dairy Milk Chocolate ?10",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "BOX",
    "selling_price": 557.49,
    "mrp": 605.96,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794741676841_1",
    "name": "Cadbury Dairy Milk Chocolate ?45",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "BOX",
    "selling_price": 1320.17,
    "mrp": 1434.96,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794741676842_2",
    "name": "Oreo Choco Cream Biscuit ?10",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "PCS",
    "selling_price": 9.96,
    "mrp": 10.82,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794741699253_0",
    "name": "Fortune Kachi Ghani Mustard Oil 1L",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "CASE",
    "selling_price": 2519.05,
    "mrp": 2738.1,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794741699253_1",
    "name": "Fortune Sunlite Refined Oil 1L",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "CASE",
    "selling_price": 1840,
    "mrp": 2000,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794741699253_2",
    "name": "Surf Excel 10-Rupee Pouch (1 Dozen)",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "BAG",
    "selling_price": 1129.41,
    "mrp": 1227.63,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794743186215_0",
    "name": "Tarang 275",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "UNIT",
    "selling_price": 272.55,
    "mrp": 296.25,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794743186216_1",
    "name": "Albela 180",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "UNIT",
    "selling_price": 178.43,
    "mrp": 193.95,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794743186216_2",
    "name": "Milk 240",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "UNIT",
    "selling_price": 237.66,
    "mrp": 258.32,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794743186216_3",
    "name": "Magadh 280",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "UNIT",
    "selling_price": 277.72,
    "mrp": 301.88,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794743186216_4",
    "name": "Anupam 415",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "UNIT",
    "selling_price": 411.31,
    "mrp": 447.08,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794743186216_5",
    "name": "Upahar 310",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "UNIT",
    "selling_price": 307.43,
    "mrp": 334.16,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794743186216_6",
    "name": "Samrat 380",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "UNIT",
    "selling_price": 376.62,
    "mrp": 409.38,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod_1794743186217_7",
    "name": "Meetha Pan 360",
    "brand": null,
    "category": "Groceries",
    "subcategory": "General",
    "barcode": null,
    "base_unit": "UNIT",
    "selling_price": 357.26,
    "mrp": 388.33,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-yamuna-filter-10-",
    "name": "Yamuna Filter (10)",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8901155710518",
    "base_unit": "pkt",
    "selling_price": 160,
    "mrp": 200,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-golden-seal-10-",
    "name": "Golden Seal (10)",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8901936567669",
    "base_unit": "pkt",
    "selling_price": 160,
    "mrp": 200,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-panchee-10-",
    "name": "Panchee (10)",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8907426064957",
    "base_unit": "pkt",
    "selling_price": 150,
    "mrp": 180,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-panchee-20-",
    "name": "Panchee (20)",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8906045561464",
    "base_unit": "pkt",
    "selling_price": 300,
    "mrp": 360,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-dilbagh-3-pack-set",
    "name": "Dilbagh 3-Pack Set",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8901422012552",
    "base_unit": "pkt",
    "selling_price": 390,
    "mrp": 450,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-dilbagh-single-packet",
    "name": "Dilbagh Single Packet",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8908042867501",
    "base_unit": "pkt",
    "selling_price": 130,
    "mrp": 150,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-tansen",
    "name": "Tansen",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8907892337323",
    "base_unit": "pkt",
    "selling_price": 220,
    "mrp": 250,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-tulsi",
    "name": "Tulsi",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8903616596039",
    "base_unit": "pkt",
    "selling_price": 120,
    "mrp": 140,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-kamla-pasand",
    "name": "Kamla Pasand",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8905375390948",
    "base_unit": "pkt",
    "selling_price": 180,
    "mrp": 200,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-rajnigandha",
    "name": "Rajnigandha",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8906892066015",
    "base_unit": "pkt",
    "selling_price": 440,
    "mrp": 500,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-chaini-khaini",
    "name": "Chaini Khaini",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8907229148716",
    "base_unit": "pkt",
    "selling_price": 310,
    "mrp": 350,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-mahindra-bolero-beedi-10-",
    "name": "Mahindra Bolero Beedi (10)",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8904087704574",
    "base_unit": "pkt",
    "selling_price": 170,
    "mrp": 200,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-swagat-sudarshan-chhota",
    "name": "Swagat Sudarshan Chhota",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8907059370115",
    "base_unit": "pkt",
    "selling_price": 200,
    "mrp": 240,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-swagat-sudarshan-bada-golden-",
    "name": "Swagat Sudarshan Bada (Golden)",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8902058417805",
    "base_unit": "pkt",
    "selling_price": 280,
    "mrp": 320,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-light-beedi",
    "name": "Light Beedi",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8909795117085",
    "base_unit": "pkt",
    "selling_price": 380,
    "mrp": 420,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-cards-box-dabba-",
    "name": "Cards Box (Dabba)",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8905690454414",
    "base_unit": "pkt",
    "selling_price": 260,
    "mrp": 300,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-bahubali",
    "name": "Bahubali",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8907531553146",
    "base_unit": "pkt",
    "selling_price": 130,
    "mrp": 150,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-capstan",
    "name": "Capstan",
    "brand": "ITC",
    "category": "Cigarettes & Smoking",
    "subcategory": "Wholesale",
    "barcode": "8903788641700",
    "base_unit": "pkt",
    "selling_price": 85,
    "mrp": 100,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-gold-flake-chhoti-small-",
    "name": "Gold Flake Chhoti (Small)",
    "brand": "ITC",
    "category": "Cigarettes & Smoking",
    "subcategory": "Wholesale",
    "barcode": "8909581262122",
    "base_unit": "pkt",
    "selling_price": 85,
    "mrp": 100,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-gold-flake-badi-big-",
    "name": "Gold Flake Badi (Big)",
    "brand": "ITC",
    "category": "Cigarettes & Smoking",
    "subcategory": "Wholesale",
    "barcode": "8907938810876",
    "base_unit": "pkt",
    "selling_price": 125,
    "mrp": 140,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-advance-chhoti",
    "name": "Advance Chhoti",
    "brand": "ITC",
    "category": "Cigarettes & Smoking",
    "subcategory": "Wholesale",
    "barcode": "8904295615652",
    "base_unit": "pkt",
    "selling_price": 115,
    "mrp": 130,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-connect",
    "name": "Connect",
    "brand": "ITC",
    "category": "Cigarettes & Smoking",
    "subcategory": "Wholesale",
    "barcode": "8903713625015",
    "base_unit": "pkt",
    "selling_price": 300,
    "mrp": 350,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-classic",
    "name": "Classic",
    "brand": "ITC",
    "category": "Cigarettes & Smoking",
    "subcategory": "Wholesale",
    "barcode": "8909183440056",
    "base_unit": "pkt",
    "selling_price": 455,
    "mrp": 500,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-total-chhoti-small-",
    "name": "Total Chhoti (Small)",
    "brand": "ITC",
    "category": "Cigarettes & Smoking",
    "subcategory": "Wholesale",
    "barcode": "8908411126398",
    "base_unit": "pkt",
    "selling_price": 60,
    "mrp": 70,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-total-badi-large-",
    "name": "Total Badi (Large)",
    "brand": "ITC",
    "category": "Cigarettes & Smoking",
    "subcategory": "Wholesale",
    "barcode": "8903391005329",
    "base_unit": "pkt",
    "selling_price": 90,
    "mrp": 100,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-indie-mint-gold-flake",
    "name": "Indie Mint Gold Flake",
    "brand": "ITC",
    "category": "Cigarettes & Smoking",
    "subcategory": "Wholesale",
    "barcode": "8906557834304",
    "base_unit": "pkt",
    "selling_price": 115,
    "mrp": 130,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-wave",
    "name": "Wave",
    "brand": "ITC",
    "category": "Cigarettes & Smoking",
    "subcategory": "Wholesale",
    "barcode": "8903558363456",
    "base_unit": "pkt",
    "selling_price": 60,
    "mrp": 70,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-ghoda-beedi",
    "name": "Ghoda Beedi",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8907094431217",
    "base_unit": "pkt",
    "selling_price": 500,
    "mrp": 550,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-27-number-beedi",
    "name": "27 Number Beedi",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8909585701254",
    "base_unit": "pkt",
    "selling_price": 500,
    "mrp": 550,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-mohan-beedi",
    "name": "Mohan Beedi",
    "brand": "Hari Om Wholesale",
    "category": "Wholesale Beedi & Tobacco",
    "subcategory": "Wholesale",
    "barcode": "8901764609062",
    "base_unit": "pkt",
    "selling_price": 190,
    "mrp": 220,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-fortune-mustard-1l",
    "name": "Fortune Kachi Ghani Mustard Oil (1L Pkt)",
    "brand": "Fortune",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Edible Oils",
    "barcode": "8901262010015",
    "base_unit": "PKT (1L)",
    "selling_price": 215,
    "mrp": 235,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-fortune-refined-1l",
    "name": "Fortune Sunlite Refined Oil (1L Pkt)",
    "brand": "Fortune",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Edible Oils",
    "barcode": "8901262020014",
    "base_unit": "PKT (1L)",
    "selling_price": 170,
    "mrp": 190,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-local-refined-1l",
    "name": "Local Refined Oil (1L Pkt)",
    "brand": "Local",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Edible Oils",
    "barcode": "8901262030013",
    "base_unit": "PKT (1L)",
    "selling_price": 140,
    "mrp": 160,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-rin-bar-10-dz",
    "name": "Rin Washing Bar (MRP 10) - 1 Dozen (12 Pcs)",
    "brand": "HUL",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Laundry & Dishwashing",
    "barcode": "8901030381012",
    "base_unit": "DZ (12 PCS)",
    "selling_price": 110,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-lifebuoy-10-dz",
    "name": "Lifebuoy Bath Soap (MRP 10) - 1 Dozen (12 Pcs)",
    "brand": "HUL",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Personal Care / Bathing",
    "barcode": "8901030381029",
    "base_unit": "DZ (12 PCS)",
    "selling_price": 110,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-lux-10-dz",
    "name": "Lux Beauty Soap (MRP 10) - 1 Dozen (12 Pcs)",
    "brand": "HUL",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Personal Care / Bathing",
    "barcode": "8901030381036",
    "base_unit": "DZ (12 PCS)",
    "selling_price": 110,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-vim-bar-10-dz",
    "name": "Vim Dishwash Bar (MRP 10) - 1 Dozen (12 Pcs)",
    "brand": "HUL",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Laundry & Dishwashing",
    "barcode": "8901030381043",
    "base_unit": "DZ (12 PCS)",
    "selling_price": 110,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-exo-bar-10-dz",
    "name": "Exo Dishwash Bar (MRP 10) - 1 Dozen (12 Pcs)",
    "brand": "Jyothy",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Laundry & Dishwashing",
    "barcode": "8901030381098",
    "base_unit": "DZ (12 PCS)",
    "selling_price": 105,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-fena-bar-10-dz",
    "name": "Fena Detergent Bar (MRP 10) - 1 Dozen (12 Pcs)",
    "brand": "Fena",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Laundry & Dishwashing",
    "barcode": "8901030381104",
    "base_unit": "DZ (12 PCS)",
    "selling_price": 105,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-rin-bar-5-24p",
    "name": "Rin Washing Bar (MRP 5) - Pack of 24 Pcs",
    "brand": "HUL",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Laundry & Dishwashing",
    "barcode": "8901030381050",
    "base_unit": "PACK (24 PCS)",
    "selling_price": 110,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-lifebuoy-5-24p",
    "name": "Lifebuoy Bath Soap (MRP 5) - Pack of 24 Pcs",
    "brand": "HUL",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Personal Care / Bathing",
    "barcode": "8901030381067",
    "base_unit": "PACK (24 PCS)",
    "selling_price": 110,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-lux-5-24p",
    "name": "Lux Beauty Soap (MRP 5) - Pack of 24 Pcs",
    "brand": "HUL",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Personal Care / Bathing",
    "barcode": "8901030381074",
    "base_unit": "PACK (24 PCS)",
    "selling_price": 110,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-vim-bar-5-24p",
    "name": "Vim Dishwash Bar (MRP 5) - Pack of 24 Pcs",
    "brand": "HUL",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Laundry & Dishwashing",
    "barcode": "8901030381081",
    "base_unit": "PACK (24 PCS)",
    "selling_price": 110,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-exo-bar-5-24p",
    "name": "Exo Dishwash Bar (MRP 5) - Pack of 24 Pcs",
    "brand": "Jyothy",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Laundry & Dishwashing",
    "barcode": "8901030381111",
    "base_unit": "PACK (24 PCS)",
    "selling_price": 105,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-surf-excel-10-dz",
    "name": "Surf Excel Detergent Powder (MRP 10) - 1 Dozen (12 Pkts)",
    "brand": "HUL",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Detergents & Powders",
    "barcode": "8901030381128",
    "base_unit": "DZ (12 PKTS)",
    "selling_price": 108,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-all-in-one-surf-10-dz",
    "name": "All-In-One Detergent Powder (MRP 10) - 1 Dozen (12 Pkts)",
    "brand": "Local / Regional",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Detergents & Powders",
    "barcode": "8901030381135",
    "base_unit": "DZ (12 PKTS)",
    "selling_price": 102,
    "mrp": 120,
    "gst_rate": 18,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-aata-40kg",
    "name": "Chakki Fresh Aata (40 Kg Bori)",
    "brand": "Hari Om Special",
    "category": "Wholesale Ration & Grains",
    "subcategory": "Flour (Aata & Maida)",
    "barcode": "8901030381142",
    "base_unit": "BAG (40 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-maida-40kg",
    "name": "Fine Maida (40 Kg Bori)",
    "brand": "Hari Om Special",
    "category": "Wholesale Ration & Grains",
    "subcategory": "Flour (Aata & Maida)",
    "barcode": "8901030381159",
    "base_unit": "BAG (40 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-chawal-sona-masoori",
    "name": "Chawal Sona Masoori (Sepis / CP)",
    "brand": "Sona Masoori",
    "category": "Wholesale Ration & Grains",
    "subcategory": "Rice & Paddy",
    "barcode": "8901030381166",
    "base_unit": "BAG (25/50 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-chawal-panghat-khanda",
    "name": "Panghat Khanda Chawal",
    "brand": "Panghat",
    "category": "Wholesale Ration & Grains",
    "subcategory": "Rice & Paddy",
    "barcode": "8901030381173",
    "base_unit": "BAG (25/50 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-chawal-panghat-pauna",
    "name": "Panghat Pauna Chawal",
    "brand": "Panghat",
    "category": "Wholesale Ration & Grains",
    "subcategory": "Rice & Paddy",
    "barcode": "8901030381180",
    "base_unit": "BAG (25/50 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-chawal-parmal",
    "name": "Parmal Rice (Chawal)",
    "brand": "Parmal",
    "category": "Wholesale Ration & Grains",
    "subcategory": "Rice & Paddy",
    "barcode": "8901030381197",
    "base_unit": "BAG (25/50 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-hp-aata-10kg",
    "name": "HP Fresh Chakki Aata (10 Kg Bag)",
    "brand": "HP",
    "category": "Wholesale Ration & Grains",
    "subcategory": "Flour (Aata & Maida)",
    "barcode": "8901030381203",
    "base_unit": "BAG (10 KG)",
    "selling_price": 355,
    "mrp": 380,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-purnagiri-aata-10kg",
    "name": "Purnagiri Chakki Aata (10 Kg Bag)",
    "brand": "Purnagiri",
    "category": "Wholesale Ration & Grains",
    "subcategory": "Flour (Aata & Maida)",
    "barcode": "8901030381210",
    "base_unit": "BAG (10 KG)",
    "selling_price": 350,
    "mrp": 380,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-hp-aata-5kg",
    "name": "HP Fresh Chakki Aata (5 Kg Bag)",
    "brand": "HP",
    "category": "Wholesale Ration & Grains",
    "subcategory": "Flour (Aata & Maida)",
    "barcode": "8901030381227",
    "base_unit": "BAG (5 KG)",
    "selling_price": 185,
    "mrp": 200,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-patanjali-aata-10kg",
    "name": "Patanjali Traditional Whole Wheat Aata (10 Kg)",
    "brand": "Patanjali",
    "category": "Wholesale Ration & Grains",
    "subcategory": "Flour (Aata & Maida)",
    "barcode": "8901030381234",
    "base_unit": "BAG (10 KG)",
    "selling_price": 450,
    "mrp": 475,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-rajma-chitra",
    "name": "Rajma Chitra (Special)",
    "brand": "Hari Om Special",
    "category": "Wholesale Pulses & Daal",
    "subcategory": "Rajma & Chana",
    "barcode": "8901030381241",
    "base_unit": "KG / BAG (30 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-rajma-lal",
    "name": "Rajma Lal (Red)",
    "brand": "Hari Om Special",
    "category": "Wholesale Pulses & Daal",
    "subcategory": "Rajma & Chana",
    "barcode": "8901030381258",
    "base_unit": "KG / BAG (30 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-chana-daal",
    "name": "Chana Daal (Special)",
    "brand": "Hari Om Special",
    "category": "Wholesale Pulses & Daal",
    "subcategory": "Daal",
    "barcode": "8901030381265",
    "base_unit": "KG / BAG (30 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-urad-chilka",
    "name": "Urad Daal Chilka",
    "brand": "Hari Om Special",
    "category": "Wholesale Pulses & Daal",
    "subcategory": "Daal",
    "barcode": "8901030381272",
    "base_unit": "KG / BAG (30 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-kaali-urad-sabut",
    "name": "Kaali Urad Sabut (Black Gram Whole)",
    "brand": "Hari Om Special",
    "category": "Wholesale Pulses & Daal",
    "subcategory": "Daal",
    "barcode": "8901030381289",
    "base_unit": "KG / BAG (30 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-moong-chilka",
    "name": "Moong Daal Chilka",
    "brand": "Hari Om Special",
    "category": "Wholesale Pulses & Daal",
    "subcategory": "Daal",
    "barcode": "8901030381296",
    "base_unit": "KG / BAG (30 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-dhuli-moong",
    "name": "Moong Daal Dhuli (Yellow)",
    "brand": "Hari Om Special",
    "category": "Wholesale Pulses & Daal",
    "subcategory": "Daal",
    "barcode": "8901030381302",
    "base_unit": "KG / BAG (30 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-dhuli-urad",
    "name": "Urad Daal Dhuli (White)",
    "brand": "Hari Om Special",
    "category": "Wholesale Pulses & Daal",
    "subcategory": "Daal",
    "barcode": "8901030381319",
    "base_unit": "KG / BAG (30 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-soyabean-moti",
    "name": "Soyabean Badi / Chunks (Moti Wali)",
    "brand": "Hari Om Special",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Soya & Pasta",
    "barcode": "8901030381326",
    "base_unit": "KG / SACK (20 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-soyabean-chhoti",
    "name": "Soyabean Mini Chunks (Chhoti Wali)",
    "brand": "Hari Om Special",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Soya & Pasta",
    "barcode": "8901030381333",
    "base_unit": "KG / SACK (20 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  },
  {
    "id": "prod-macaroni",
    "name": "Fine Semolina Macaroni",
    "brand": "Hari Om Special",
    "category": "Wholesale Grocery (Parchun)",
    "subcategory": "Soya & Pasta",
    "barcode": "8901030381340",
    "base_unit": "KG / SACK (20 KG)",
    "selling_price": 0,
    "mrp": 0,
    "gst_rate": 5,
    "total_stock": 50,
    "main_shop_stock": 30,
    "godown_stock": 20
  }
]);
      setLocations([
        { id: 'loc-main', name: 'Main Shop', type: 'MAIN_SHOP', racks: Array.from({ length: 6 }, (_, i) => ({ id: `r-${i+1}`, rack_code: `Rack 0${i+1}`, description: `Aisle ${i+1}`, sections: [{ id: `s-${i+1}-1`, section_code: 'Section A', description: 'Shelf 1' }] })) },
        { id: 'loc-second', name: 'Second Shop', type: 'SECOND_SHOP', racks: [{ id: 'rs-1', rack_code: 'Sec-Rack 1', description: 'Display Counter', sections: [{ id: 'ss-1', section_code: 'Top Shelf', description: 'Level 1' }] }] },
        { id: 'loc-godown', name: 'Back Godown', type: 'BACK_GODOWN', racks: [{ id: 'rg-1', rack_code: 'Pallet Stack 1', description: 'Bulk Pallet Stack', sections: [{ id: 'sg-1', section_code: 'Ground Area', description: 'Ground' }] }] }
      ]);
      setExpiryAlerts([]);
      setReorders([]);
      setTasks([]);
      setGstData({
        gstSales: { total_bills: 0, total_taxable: 0, total_cgst: 0, total_sgst: 0, total_igst: 0, total_sales: 0 },
        otherSales: { total_bills: 0, total_sales: 0 },
        gstPurchases: { total_invoices: 3, total_taxable: 32197.60, total_cgst: 912.36, total_sgst: 912.36, total_igst: 0, total_purchases: 34023.00 },
        rateWiseSales: []
      });
      setSuppliers([
        { id: 'sup-jindal', name: 'Jindal Representative', business_name: 'Jindal Agencies', gstin: '05ABAPA2921P1ZY', phone: '+91 98972 10140', address: 'Saklani Complex, Railway Road, Rishikesh', return_policy: 'Full credit note for spices & detergents returned prior to expiry', credit_terms_days: 15 },
        { id: 'sup-vijaya', name: 'Rishabh Agency Contact', business_name: 'THE VIJAYA AGENCIES', gstin: '05AFXPJ8419E1Z4', phone: '+91 97600 26617', address: '145/1 Laxman Jhula Road, Rishikesh', return_policy: 'Cadbury & personal care replacement on quarterly visit', credit_terms_days: 30 },
        { id: 'sup-krishna', name: 'Rishabh / Krishna Rep', business_name: 'KRISHNA AGENCIES 26-27', gstin: '05AEJPC9715K1ZD', phone: '+91 70171 68755', address: 'Plot No-2, Sector-1, Industrial Area, Muni Ki Reti, Rishikesh', return_policy: 'Standard confectionery & FMCG credit note policy', credit_terms_days: 21 }
      ]);
      setPurchasesHistory([
        {
          id: 'purch-jindal-2186',
          invoice_number: '2186',
          supplier_name: 'Jindal Agencies',
          supplier_gstin: '05ABAPA2921P1ZY',
          invoice_date: '2026-10-18',
          taxable_value: 4852.47,
          cgst_amount: 228.74,
          sgst_amount: 228.74,
          igst_amount: 0,
          grand_total: 5310.00,
          verification_status: 'VERIFIED',
          items: [
            { product_name: 'Fortune Kachi Ghani Mustard Oil (1L)', quantity: 5, unit: 'UNIT', rate: 133.33, taxable_value: 666.65, gst_rate: 5, total_amount: 700.00 },
            { product_name: 'Surf Excel 10-Rupee Pouch (1 Dozen)', quantity: 2, unit: 'UNIT', rate: 133.33, taxable_value: 266.66, gst_rate: 5, total_amount: 280.00 },
            { product_name: 'Yamuna Filter Beedi (10)', quantity: 1, unit: 'BAG', rate: 1652.54, taxable_value: 1652.54, gst_rate: 18, total_amount: 1950.00 }
          ]
        },
        {
          id: 'purch-vijaya-9373',
          invoice_number: 'CAD-9373',
          supplier_name: 'THE VIJAYA AGENCIES',
          supplier_gstin: '05AFXPJ8419E1Z4',
          invoice_date: '2026-11-03',
          taxable_value: 11716.90,
          cgst_amount: 292.92,
          sgst_amount: 292.92,
          igst_amount: 0,
          grand_total: 12303.00,
          verification_status: 'VERIFIED',
          items: [
            { product_name: 'Cadbury Dairy Milk Chocolate ₹10', quantity: 6, unit: 'BOX', rate: 484.77, taxable_value: 2908.62, gst_rate: 5, total_amount: 3054.06 },
            { product_name: 'Cadbury Dairy Milk Chocolate ₹45', quantity: 4, unit: 'BOX', rate: 1147.97, taxable_value: 4591.88, gst_rate: 5, total_amount: 4821.48 },
            { product_name: 'Oreo Choco Cream Biscuit ₹10', quantity: 60, unit: 'PCS', rate: 8.66, taxable_value: 519.60, gst_rate: 5, total_amount: 545.58 }
          ]
        },
        {
          id: 'purch-krishna-284720',
          invoice_number: 'B284720',
          supplier_name: 'KRISHNA AGENCIES 26-27',
          supplier_gstin: '05AEJPC9715K1ZD',
          invoice_date: '2026-10-20',
          taxable_value: 15628.23,
          cgst_amount: 390.70,
          sgst_amount: 390.70,
          igst_amount: 0,
          grand_total: 16410.00,
          verification_status: 'VERIFIED',
          items: [
            { product_name: 'Fortune Kachi Ghani Mustard Oil 1L', quantity: 1, unit: 'CASE', rate: 2190.48, taxable_value: 2190.48, gst_rate: 5, total_amount: 2300.00 },
            { product_name: 'Fortune Sunlite Refined Oil 1L', quantity: 1, unit: 'CASE', rate: 1600.00, taxable_value: 1600.00, gst_rate: 5, total_amount: 1680.00 },
            { product_name: 'Surf Excel 10-Rupee Pouch (1 Dozen)', quantity: 8, unit: 'BAG', rate: 982.10, taxable_value: 7856.80, gst_rate: 5, total_amount: 8249.64 }
          ]
        },
        {
          id: 'purch-cashmemo-211126',
          invoice_number: 'CM-211126',
          supplier_name: 'Local Confectionery & Cash Vendor',
          supplier_gstin: '',
          invoice_date: '2026-11-21',
          is_gst_bill: 0,
          taxable_value: 5732.00,
          cgst_amount: 0,
          sgst_amount: 0,
          igst_amount: 0,
          grand_total: 5732.00,
          verification_status: 'VERIFIED',
          items: [
            { product_name: 'Tarang 275', quantity: 3, unit: 'UNIT', rate: 237.00, taxable_value: 711.00, gst_rate: 0, total_amount: 711.00 },
            { product_name: 'Albela 180', quantity: 6, unit: 'UNIT', rate: 155.16, taxable_value: 931.00, gst_rate: 0, total_amount: 931.00 },
            { product_name: 'Milk 240', quantity: 3, unit: 'UNIT', rate: 206.66, taxable_value: 620.00, gst_rate: 0, total_amount: 620.00 },
            { product_name: 'Magadh 280', quantity: 2, unit: 'UNIT', rate: 241.50, taxable_value: 483.00, gst_rate: 0, total_amount: 483.00 },
            { product_name: 'Anupam 415', quantity: 3, unit: 'UNIT', rate: 357.66, taxable_value: 1073.00, gst_rate: 0, total_amount: 1073.00 },
            { product_name: 'Upahar 310', quantity: 3, unit: 'UNIT', rate: 267.33, taxable_value: 802.00, gst_rate: 0, total_amount: 802.00 },
            { product_name: 'Samrat 380', quantity: 2, unit: 'UNIT', rate: 327.50, taxable_value: 655.00, gst_rate: 0, total_amount: 655.00 },
            { product_name: 'Meetha Pan 360', quantity: 3, unit: 'UNIT', rate: 310.66, taxable_value: 932.00, gst_rate: 0, total_amount: 932.00 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const parseBillFallback = (filename) => {
    // 100% Clean Blank Bill Template (NO mock or fake vendor data)
    return {
      supplier_name: '',
      supplier_gstin: '',
      invoice_number: `INV-${Date.now().toString().slice(-4)}`,
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

  const callGeminiInvoiceOCR = async (file, apiKey) => {
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
    const promptText = `You are an AI bill reader for an Indian retail & wholesale grocery store (Shree Hari Om Traders).
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
}`;

    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let lastError = null;

    for (const model of models) {
      try {
        const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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
          lastError = new Error(resObj.error?.message || `HTTP ${apiRes.status}`);
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

  const handleOpenManualBill = () => {
    setEditInvoice({
      id: `purch_${Date.now()}`,
      isNew: true,
      is_gst_bill: true,
      supplier_name: '',
      supplier_gstin: '',
      invoice_number: `INV-${Date.now().toString().slice(-4)}`,
      invoice_date: new Date().toISOString().split('T')[0],
      items: [
        {
          product_name: '',
          category: 'General',
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
      taxable_value: 0,
      cgst_amount: 0,
      sgst_amount: 0,
      grand_total: 0
    });
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('hariom_gemini_api_key', tempApiKey.trim());
    setGeminiApiKey(tempApiKey.trim());
    setShowApiKeyModal(false);
    alert('Gemini Vision AI Key saved! All invoice scans will now use automated Vision OCR.');
  };

  const handleScanUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanPreviewUrl(URL.createObjectURL(file));
    setIsScanning(true);
    setScanResult(null);

    try {
      const apiKey = geminiApiKey || localStorage.getItem('hariom_gemini_api_key');
      if (apiKey) {
        const parsed = await callGeminiInvoiceOCR(file, apiKey);
        setScanResult(parsed);
        setIsScanning(false);
        return;
      }

      // Try local backend if reachable
      try {
        const formData = new FormData();
        formData.append('invoice_file', file);
        const res = await axios.post('/api/purchases/scan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 2500
        });
        if (res.data?.success) {
          setScanResult(res.data.data);
          setIsScanning(false);
          return;
        }
      } catch (beErr) {
        // Continue to clean template
      }

      const parsed = parseBillFallback(file.name);
      setScanResult(parsed);
    } catch (err) {
      console.warn('AI Scan parse exception, loading clean entry form:', err);
      setScanResult(parseBillFallback(file.name));
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!scanResult) return;
    try {
      const payload = {
        ...scanResult,
        verified_by: userRole
      };
      await axios.post('/api/purchases/confirm', payload);
      alert(`Success! Purchase Invoice ${scanResult.invoice_number} successfully verified and inwarded to inventory.`);
      setScanResult(null);
      setScanPreviewUrl(null);
      fetchAllData();
    } catch (err) {
      console.warn('API confirm offline fallback, updating client state directly:', err);
      // Add to local purchases history
      setPurchasesHistory([
        {
          id: `purch_${Date.now()}`,
          invoice_number: scanResult.invoice_number,
          supplier_name: scanResult.supplier_name,
          invoice_date: scanResult.invoice_date,
          taxable_value: scanResult.subtotal,
          cgst_amount: scanResult.total_cgst,
          sgst_amount: scanResult.total_sgst,
          igst_amount: scanResult.total_igst || 0,
          grand_total: scanResult.grand_total,
          verification_status: 'VERIFIED'
        },
        ...purchasesHistory
      ]);
      alert(`Success! Purchase Invoice ${scanResult.invoice_number} successfully verified and inwarded to inventory.`);
      setScanResult(null);
      setScanPreviewUrl(null);
    }
  };

  const setItemExpiryQuick = (idx, months) => {
    if (!scanResult || !scanResult.items) return;
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    const dateStr = date.toISOString().split('T')[0];
    const newItems = [...scanResult.items];
    newItems[idx].expiry_date = dateStr;
    setScanResult({ ...scanResult, items: newItems });
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!confirm('Are you sure you want to delete this invoice? Related batches will be removed from stock.')) return;
    try {
      await axios.delete(`/api/purchases/${invoiceId}`);
      alert('Invoice deleted successfully!');
      fetchAllData();
    } catch (err) {
      console.warn('API delete offline, filtering client state:', err);
      setPurchasesHistory(prev => prev.filter(p => p.id !== invoiceId));
      alert('Invoice removed from register.');
    }
  };

  const handleSaveEditedInvoice = async () => {
    if (!editInvoice) return;
    try {
      if (editInvoice.isNew) {
        await axios.post('/api/purchases', editInvoice);
      } else {
        await axios.put(`/api/purchases/${editInvoice.id}`, editInvoice);
      }
      alert('Invoice and items saved successfully!');
      setEditInvoice(null);
      fetchAllData();
    } catch (err) {
      console.warn('API update offline, updating client state directly:', err);
      if (editInvoice.isNew) {
        setPurchasesHistory([editInvoice, ...purchasesHistory]);
      } else {
        setPurchasesHistory(prev => prev.map(p => p.id === editInvoice.id ? editInvoice : p));
      }

      // Inward into products catalog
      const updatedProducts = [...products];
      (editInvoice.items || []).forEach(it => {
        const prodName = (it.product_name || it.name || '').trim();
        if (!prodName) return;
        const existing = updatedProducts.find(p => p.name.toLowerCase() === prodName.toLowerCase());
        const qty = Math.max(0, Number(it.quantity) || 0);
        const rate = Math.max(0, Number(it.rate) || 0);
        const wholesale = Number(it.wholesale_price) || Number((rate * 1.05).toFixed(2));
        const retail = Number(it.retail_price) || Number((rate * 1.15).toFixed(2));
        const mrpVal = Number(it.retail_price) || Number((rate * 1.25).toFixed(2));

        if (existing) {
          existing.total_stock = (existing.total_stock || 0) + qty;
          if (it.destination_location_id === 'loc-godown') {
            existing.godown_stock = (existing.godown_stock || 0) + qty;
          } else {
            existing.main_shop_stock = (existing.main_shop_stock || 0) + qty;
          }
          if (wholesale) existing.wholesale_price = wholesale;
          if (retail) existing.selling_price = retail;
        } else {
          updatedProducts.push({
            id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            name: prodName,
            category: it.category || 'General',
            barcode: `${Date.now()}`.slice(-13),
            base_unit: it.unit || 'PCS',
            selling_price: retail,
            wholesale_price: wholesale,
            mrp: mrpVal,
            gst_rate: Number(it.gst_rate) || 5,
            total_stock: qty,
            main_shop_stock: it.destination_location_id === 'loc-godown' ? 0 : qty,
            godown_stock: it.destination_location_id === 'loc-godown' ? qty : 0
          });
        }
      });
      setProducts(updatedProducts);

      if (dashboard) {
        setDashboard({
          ...dashboard,
          totalProducts: updatedProducts.length,
          totalQuantity: (dashboard.totalQuantity || 0) + (editInvoice.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0),
          purchaseValuation: Number(((dashboard.purchaseValuation || 0) + (editInvoice.taxable_value || 0)).toFixed(2))
        });
      }

      setEditInvoice(null);
      alert('Invoice and items successfully saved & stock inwarded!');
    }
  };

  const updateEditInvoiceItem = (idx, field, value) => {
    if (!editInvoice || !editInvoice.items) return;
    const newItems = [...editInvoice.items];
    newItems[idx] = { ...newItems[idx], [field]: value };

    // Auto-calculate line taxable and total
    const qty = Number(newItems[idx].quantity || 0);
    const rate = Number(newItems[idx].rate || 0);
    const gstRate = Number(newItems[idx].gst_rate || 0);
    const lineTaxable = Number((qty * rate).toFixed(2));
    const lineGst = Number(((lineTaxable * gstRate) / 100).toFixed(2));
    const lineTotal = Number((lineTaxable + lineGst).toFixed(2));

    newItems[idx].taxable_value = lineTaxable;
    newItems[idx].total_amount = lineTotal;
    newItems[idx].cgst = editInvoice.is_gst_bill ? Number((lineGst / 2).toFixed(2)) : 0;
    newItems[idx].sgst = editInvoice.is_gst_bill ? Number((lineGst / 2).toFixed(2)) : 0;

    // Recalculate invoice totals
    let newTaxable = 0;
    let newCgst = 0;
    let newSgst = 0;
    let newGrand = 0;
    newItems.forEach(it => {
      newTaxable += it.taxable_value || 0;
      newCgst += it.cgst || 0;
      newSgst += it.sgst || 0;
      newGrand += it.total_amount || 0;
    });

    setEditInvoice({
      ...editInvoice,
      items: newItems,
      taxable_value: Number(newTaxable.toFixed(2)),
      cgst_amount: Number(newCgst.toFixed(2)),
      sgst_amount: Number(newSgst.toFixed(2)),
      grand_total: Number(newGrand.toFixed(2))
    });
  };

  const addEditInvoiceItem = () => {
    if (!editInvoice) return;
    const items = editInvoice.items || [];
    const isGst = !!editInvoice.is_gst_bill;
    const newItem = {
      product_name: 'New Product',
      quantity: 1,
      unit: 'UNIT',
      rate: 100,
      taxable_value: 100,
      gst_rate: isGst ? 5 : 0,
      cgst: isGst ? 2.5 : 0,
      sgst: isGst ? 2.5 : 0,
      total_amount: isGst ? 105 : 100
    };
    const newItems = [...items, newItem];
    let newTaxable = 0;
    let newGrand = 0;
    newItems.forEach(it => {
      newTaxable += it.taxable_value || 0;
      newGrand += it.total_amount || 0;
    });
    setEditInvoice({
      ...editInvoice,
      items: newItems,
      taxable_value: Number(newTaxable.toFixed(2)),
      grand_total: Number(newGrand.toFixed(2))
    });
  };

  const removeEditInvoiceItem = (idx) => {
    if (!editInvoice || !editInvoice.items) return;
    const newItems = editInvoice.items.filter((_, i) => i !== idx);
    let newTaxable = 0;
    let newGrand = 0;
    newItems.forEach(it => {
      newTaxable += it.taxable_value || 0;
      newGrand += it.total_amount || 0;
    });
    setEditInvoice({
      ...editInvoice,
      items: newItems,
      taxable_value: Number(newTaxable.toFixed(2)),
      grand_total: Number(newGrand.toFixed(2))
    });
  };

  // Filtered Purchases (Standard baseline from October 2026 onwards)
  const filteredPurchases = purchasesHistory.filter(p => {
    // 1. Bill Type Filter (Pakka vs Kaccha)
    if (purchaseBillTypeFilter === 'GST' && !p.is_gst_bill) return false;
    if (purchaseBillTypeFilter === 'NON_GST' && p.is_gst_bill) return false;

    // 2. Month / Period Filter
    const pDate = p.invoice_date || '';
    if (purchaseMonthFilter === '10' && !pDate.startsWith('2026-10')) return false;
    if (purchaseMonthFilter === '11' && !pDate.startsWith('2026-11')) return false;
    if (purchaseMonthFilter === '12' && !pDate.startsWith('2026-12')) return false;
    if (purchaseMonthFilter === 'Q3' && !(pDate.startsWith('2026-10') || pDate.startsWith('2026-11') || pDate.startsWith('2026-12'))) return false;
    if (purchaseMonthFilter === 'Q4' && !(pDate.startsWith('2027-01') || pDate.startsWith('2027-02') || pDate.startsWith('2027-03'))) return false;

    // 3. Supplier Filter
    if (purchaseSupplierFilter !== 'ALL' && p.supplier_name !== purchaseSupplierFilter) return false;

    // 4. Search Filter
    if (purchaseSearch.trim()) {
      const q = purchaseSearch.toLowerCase();
      const matchNo = (p.invoice_number || '').toLowerCase().includes(q);
      const matchSup = (p.supplier_name || '').toLowerCase().includes(q);
      const matchItems = p.items && p.items.some(it => (it.product_name || it.name || '').toLowerCase().includes(q));
      if (!matchNo && !matchSup && !matchItems) return false;
    }

    return true;
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // POS Add to Cart
  const addToCart = (product) => {
    if (product.total_stock <= 0) {
      alert(`${product.name} is currently OUT OF STOCK!`);
      return;
    }
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      if (existing.quantity + 1 > product.total_stock) {
        alert(`Only ${product.total_stock} ${product.base_unit} available in stock!`);
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        selling_price: product.selling_price,
        mrp: product.mrp,
        gst_rate: product.gst_rate,
        base_unit: product.base_unit,
        quantity: 1,
        total_stock: product.total_stock
      }]);
    }
  };

  const updateCartQty = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.total_stock) {
          alert(`Maximum available stock is ${item.total_stock}`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const calculateCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.selling_price), 0);
    const tax = cart.reduce((sum, item) => {
      const lineTotal = item.quantity * item.selling_price;
      const taxable = lineTotal / (1 + (item.gst_rate / 100));
      return sum + (lineTotal - taxable);
    }, 0);
    return {
      subtotal,
      taxable: subtotal - tax,
      tax,
      cgst: tax / 2,
      sgst: tax / 2,
      grandTotal: subtotal
    };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const totals = calculateCartTotals();
      const payload = {
        items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
        customer_name: customerName || 'Walk-in Customer',
        customer_phone: customerPhone || null,
        payment_mode: paymentMode,
        cash_received: paymentMode === 'CASH' ? totals.grandTotal : 0,
        upi_received: paymentMode === 'UPI' ? totals.grandTotal : 0,
        is_gst_bill: isGstBill,
        billing_staff_id: userRole
      };

      const res = await axios.post('/api/pos/checkout', payload);
      if (res.data.success) {
        setLastBill({
          ...res.data.data,
          items: [...cart],
          date: new Date().toLocaleString(),
          customerName: customerName || 'Walk-in Customer',
          customerPhone: customerPhone || '-'
        });
        setShowReceipt(true);
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        fetchAllData();
      }
    } catch (err) {
      alert(`Checkout failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferBatch || transferQty <= 0) return;
    try {
      await axios.post('/api/transfers', {
        batch_id: transferBatch.batch_id,
        to_location_id: transferToLoc,
        quantity: Number(transferQty),
        reason: 'Restocking Main Shop shelf',
        performed_by: userRole
      });
      alert('Stock successfully moved!');
      setShowTransferModal(false);
      setTransferBatch(null);
      fetchAllData();
    } catch (err) {
      alert(`Transfer failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, {
        status: nextStatus,
        verified_by: userRole
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 md:pb-6">
      {/* Top Header */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-400 text-slate-900 p-2 rounded-lg font-black text-xl shadow">
              HOT
            </div>
            <div>
              <h1 className="font-bold text-lg md:text-xl tracking-tight leading-none">
                HARI OM TRADERS
              </h1>
              <p className="text-emerald-200 text-xs mt-0.5">
                Integrated Shop Management • 3 Physical Facilities Connected
              </p>
            </div>
          </div>

          {/* Role Switcher & Live Status */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-900/60 px-2.5 py-1 rounded-full text-xs text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Shop LAN Connected</span>
            </div>

            <div className="flex items-center bg-emerald-700 rounded-lg p-1 text-xs font-medium">
              <span className="px-2 text-emerald-200">Role:</span>
              {['Owner', 'Billing Staff', 'Stock Staff'].map(role => (
                <button
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    userRole === role ? 'bg-amber-400 text-slate-900 font-bold shadow-sm' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="bg-emerald-900/80 border-t border-emerald-700/50 px-2 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex space-x-1 text-sm font-medium py-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Store },
              { id: 'pos', label: 'Counter POS', icon: ShoppingCart },
              { id: 'scan', label: 'AI Bill Scanner', icon: Camera },
              { id: 'inventory', label: '3-Locations & Racks', icon: Package },
              { id: 'expiry', label: 'Expiry & Returns', icon: AlertTriangle, badge: expiryAlerts.length },
              { id: 'reorder', label: 'Smart Reorder', icon: ArrowRightLeft, badge: reorders.filter(r => r.action !== 'NO_ACTION').length },
              { id: 'gst', label: 'GST & Registers', icon: FileText },
              { id: 'tasks', label: 'Staff SOPs', icon: CheckSquare, badge: dashboard?.alerts?.pendingTasks },
              { id: 'suppliers', label: 'Suppliers', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    isActive ? 'bg-white text-emerald-900 font-bold shadow-sm' : 'text-emerald-100 hover:bg-emerald-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="bg-amber-400 text-slate-900 text-xs px-1.5 py-0.2 rounded-full font-bold ml-1">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-slate-500 font-medium text-sm">Loading Hari Om Traders records...</p>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* TAB 1: DASHBOARD                                          */}
            {/* ========================================================= */}
            {activeTab === 'dashboard' && dashboard && (
              <div className="space-y-6">
                {/* Urgent Alerts Banner */}
                {(dashboard.alerts.expiredCount > 0 || dashboard.alerts.nearExpiryCount > 0 || dashboard.alerts.lowStockCount > 0) && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-amber-900">Urgent Operational Alerts Requiring Attention</h4>
                        <div className="text-xs text-amber-800 flex flex-wrap gap-x-4 mt-0.5">
                          {dashboard.alerts.expiredCount > 0 && (
                            <span className="text-red-700 font-bold">• {dashboard.alerts.expiredCount} Expired Product(s)</span>
                          )}
                          {dashboard.alerts.nearExpiryCount > 0 && (
                            <span>• {dashboard.alerts.nearExpiryCount} Product(s) Expiring within 30 Days</span>
                          )}
                          {dashboard.alerts.lowStockCount > 0 && (
                            <span>• {dashboard.alerts.lowStockCount} Product(s) Low in Main Shop</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setActiveTab('expiry')} 
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded shadow"
                      >
                        Check Expiry
                      </button>
                      <button 
                        onClick={() => setActiveTab('reorder')} 
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded shadow"
                      >
                        Review Reorders
                      </button>
                    </div>
                  </div>
                )}

                {/* Key Financial & Valuation KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider">Purchase Cost Valuation</span>
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xl md:text-2xl font-black text-slate-800">
                      ₹{dashboard.purchaseValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Cost basis across all 3 facilities</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider">Estimated Selling Value</span>
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xl md:text-2xl font-black text-blue-700">
                      ₹{dashboard.sellingValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">MRP Value: ₹{dashboard.mrpValuation.toLocaleString('en-IN')}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider">Today's Sales</span>
                      <ShoppingCart className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-xl md:text-2xl font-black text-emerald-700">
                      ₹{dashboard.today.total_sales.toFixed(2)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {dashboard.today.bills_count} Bills (Cash: ₹{dashboard.today.cash_total} | UPI: ₹{dashboard.today.upi_total})
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Inventory</span>
                      <Package className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-xl md:text-2xl font-black text-slate-800">
                      {dashboard.totalQuantity} <span className="text-sm font-normal text-slate-500">Units</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{dashboard.totalProducts} Active Catalog Items</p>
                  </div>
                </div>

                {/* 3-Location Facility Breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Physical Inventory Location Distribution</h3>
                      <p className="text-xs text-slate-500">Live quantities and asset valuation across Main Shop, Second Shop, and Godown</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('inventory')}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center"
                    >
                      View Rack Mapping <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dashboard.locationBreakdown.map(loc => {
                      const isMain = loc.type === 'MAIN_SHOP';
                      const isGodown = loc.type === 'BACK_GODOWN';
                      return (
                        <div 
                          key={loc.id} 
                          className={`p-4 rounded-xl border ${
                            isMain ? 'border-emerald-300 bg-emerald-50/40' : isGodown ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{loc.name}</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                              {loc.type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="mt-3 flex items-baseline space-x-2">
                            <span className="text-2xl font-black text-slate-800">{loc.total_units}</span>
                            <span className="text-xs text-slate-500">total units stored</span>
                          </div>
                          <div className="mt-2 text-xs text-slate-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Unique Products:</span>
                              <span className="font-semibold">{loc.unique_products}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Inventory Value:</span>
                              <span className="font-semibold">₹{loc.inventory_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Actions: Low Stock in Front Shop */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-base mb-1">Products Requiring Attention in Front Shop</h3>
                  <p className="text-xs text-slate-500 mb-4">Items low on the retail shelf, showing stock available in Back Godown ready for transfer.</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3">Main Shop Shelf</th>
                          <th className="py-2.5 px-3">Back Godown Reserve</th>
                          <th className="py-2.5 px-3">Min / Reorder Point</th>
                          <th className="py-2.5 px-3">Action Required</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dashboard.alerts.lowStockItems.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-semibold text-slate-800">{item.name}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded font-bold ${item.shop_stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {item.shop_stock} Units
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-slate-700">{item.godown_stock} Units</span>
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              Min: {item.min_stock_level} | Reorder: {item.reorder_point}
                            </td>
                            <td className="py-3 px-3">
                              {item.godown_stock > 0 ? (
                                <button 
                                  onClick={() => {
                                    setTransferBatch({
                                      product_name: item.name,
                                      product_id: item.id,
                                      from_name: 'Back Godown',
                                      quantity_remaining: item.godown_stock
                                    });
                                    setShowTransferModal(true);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1 rounded text-xs shadow-xs"
                                >
                                  Shift from Godown
                                </button>
                              ) : (
                                <span className="text-red-600 font-semibold text-xs">Purchase Required</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: COUNTER POS & BILLING                              */}
            {/* ========================================================= */}
            {activeTab === 'pos' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Product Search & Quick Add */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-600">Active Billing Rate:</span>
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setPosPriceMode('RETAIL')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${posPriceMode === 'RETAIL' ? 'bg-emerald-700 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            <span>Retail (Counter MRP)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPosPriceMode('WHOLESALE')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${posPriceMode === 'WHOLESALE' ? 'bg-blue-700 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            <span>Wholesale (Bulk Rate)</span>
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                        <input 
                          type="text"
                          placeholder="Scan Barcode or Search by Product Name / Category..."
                          value={posSearch}
                          onChange={(e) => setPosSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-emerald-600"
                          autoFocus
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                    {products
                      .filter(p => !posSearch || p.name.toLowerCase().includes(posSearch.toLowerCase()) || (p.barcode && p.barcode.includes(posSearch)))
                      .map(p => (
                        <div 
                          key={p.id}
                          onClick={() => addToCart(p)}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-slate-800 text-sm leading-snug">{p.name}</h4>
                              <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono shrink-0">
                                {p.category}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                              {p.barcode && <span>Barcode: {p.barcode}</span>}
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-base font-black text-emerald-700">₹{p.selling_price.toFixed(2)}</div>
                              <div className="text-xs text-slate-400 line-through">MRP ₹{p.mrp.toFixed(2)}</div>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                p.main_shop_stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                              }`}>
                                {p.main_shop_stock} in Shop
                              </span>
                              {p.godown_stock > 0 && (
                                <div className="text-2xs text-slate-400 mt-0.5">({p.godown_stock} in Godown)</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Right Side: Active Cart & Billing Terminal */}
                <div className="lg:col-span-5">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-5 h-5 text-emerald-700" />
                        <h3 className="font-bold text-slate-800">Current Sales Bill</h3>
                      </div>
                      <button 
                        onClick={() => setCart([])} 
                        className="text-xs text-red-600 hover:text-red-700 font-semibold"
                        disabled={cart.length === 0}
                      >
                        Clear Cart
                      </button>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-2 my-3">
                      <input 
                        type="text"
                        placeholder="Customer Name (Optional)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="p-2 text-xs border border-slate-200 rounded-lg bg-slate-50"
                      />
                      <input 
                        type="tel"
                        placeholder="Phone Number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="p-2 text-xs border border-slate-200 rounded-lg bg-slate-50"
                      />
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto max-h-[320px] divide-y divide-slate-100 my-2">
                      {cart.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs">
                          Cart is empty. Select products on the left or scan barcode.
                        </div>
                      ) : (
                        cart.map(item => (
                          <div key={item.product_id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex-1 pr-2">
                              <div className="font-bold text-slate-800">{item.name}</div>
                              <div className="text-slate-400">₹{item.selling_price.toFixed(2)} / {item.base_unit} (GST {item.gst_rate}%)</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                                <button 
                                  onClick={() => updateCartQty(item.product_id, -1)}
                                  className="px-2 py-0.5 hover:bg-slate-200 rounded-l"
                                >
                                  -
                                </button>
                                <span className="px-2 font-bold">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartQty(item.product_id, 1)}
                                  className="px-2 py-0.5 hover:bg-slate-200 rounded-r"
                                >
                                  +
                                </button>
                              </div>
                              <div className="font-bold text-slate-800 min-w-[50px] text-right">
                                ₹{(item.quantity * item.selling_price).toFixed(2)}
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.product_id)}
                                className="text-slate-400 hover:text-red-500 ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bill Totals & Tax Calculation */}
                    {cart.length > 0 && (
                      <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                        {(() => {
                          const totals = calculateCartTotals();
                          return (
                            <>
                              <div className="flex justify-between text-slate-500">
                                <span>Taxable Subtotal:</span>
                                <span>₹{totals.taxable.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-slate-500">
                                <span>GST (CGST + SGST):</span>
                                <span>₹{totals.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-black text-base text-slate-800 pt-1 border-t border-slate-100">
                                <span>Grand Total:</span>
                                <span className="text-emerald-700">₹{totals.grandTotal.toFixed(2)}</span>
                              </div>
                            </>
                          );
                        })()}

                        {/* Payment Mode Selection */}
                        <div className="pt-2">
                          <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Method</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentMode('CASH')}
                              className={`py-2 rounded-lg font-bold text-xs border ${
                                paymentMode === 'CASH' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              💵 Cash
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMode('UPI')}
                              className={`py-2 rounded-lg font-bold text-xs border ${
                                paymentMode === 'UPI' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              📱 UPI / QR
                            </button>
                          </div>
                        </div>

                        {/* GST Invoice Toggle */}
                        <div className="flex items-center space-x-2 pt-2">
                          <input 
                            type="checkbox"
                            id="gstToggle"
                            checked={isGstBill}
                            onChange={(e) => setIsGstBill(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <label htmlFor="gstToggle" className="text-xs text-slate-700 font-medium cursor-pointer">
                            Issue Official GST Tax Invoice
                          </label>
                        </div>

                        {/* Complete Checkout Button */}
                        <button
                          onClick={handleCheckout}
                          className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Generate Bill & Deduct Stock</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB: MOBILE AI INVOICE SCANNER & OCR INWARDING           */}
            {/* ========================================================= */}
            {activeTab === 'scan' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-slate-800 text-base">Purchase Inwarding & Bill Center</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Inward purchase bills manually or auto-extract with Gemini Vision AI (Marg, Tally, Busy, Cash Memos).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        type="button"
                        onClick={handleOpenManualBill}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Manual Bill Entry</span>
                      </button>

                      <label className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer flex items-center space-x-1.5 transition">
                        <Camera className="w-4 h-4" />
                        <span>Scan / Upload Bill</span>
                        <input 
                          type="file" 
                          accept="image/*,.pdf" 
                          capture="environment" 
                          onChange={handleScanUpload} 
                          className="hidden" 
                        />
                      </label>

                      <button 
                        type="button"
                        onClick={() => setShowApiKeyModal(true)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2.5 rounded-xl border border-slate-300 flex items-center space-x-1 transition cursor-pointer"
                        title="Configure Gemini Vision AI Key"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>AI Key</span>
                      </button>
                    </div>
                  </div>

                  {/* AI & Dynamic Inward Status Pill */}
                  <div className="flex flex-wrap items-center justify-between text-2xs pt-2 border-t border-slate-100 text-slate-500 gap-2">
                    <div className="flex items-center space-x-2">
                      {geminiApiKey ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center">
                          <Check className="w-3 h-3 mr-1" /> Gemini Vision 1.5 Flash Active (Auto-OCR)
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" /> Manual / Standard OCR Mode (Click "AI Key" for 100% Auto-Scan)
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400">
                      Standard: <strong>October 2026 Baseline</strong> • GSTIN: <span className="font-mono text-emerald-700">05DKWPS9122N1Z5</span>
                    </div>
                  </div>
                </div>

                {/* Live Scanning Loader */}
                {isScanning && (
                  <div className="bg-amber-50 border border-amber-200 p-8 rounded-xl text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                    <h4 className="font-bold text-amber-900 text-sm">AI Invoice OCR & Extraction in Progress...</h4>
                    <p className="text-xs text-amber-700 max-w-md mx-auto">
                      Extracting supplier GSTIN, invoice date, line items, HSN codes, CGST/SGST taxes, and matching with shop inventory catalog.
                    </p>
                  </div>
                )}

                {/* Side-by-Side Human Verification Screen */}
                {scanResult && (
                  <div className="bg-white rounded-2xl border border-emerald-300 shadow-lg p-5 space-y-5">
                    {/* Duplicate Detection Alert */}
                    {scanResult.isDuplicate && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs text-red-800 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="font-bold">{scanResult.duplicateWarning}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            Human Verification Gate
                          </span>
                          {scanResult.mathCheck?.isValid ? (
                            <span className="text-2xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Math Reconciled 100%
                            </span>
                          ) : (
                            <span className="text-2xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" /> Calculation Note
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-800 text-base mt-1">Review AI-Extracted Purchase Invoice</h4>
                        <div className="text-2xs text-slate-500 font-mono mt-0.5">
                          Billed to: <strong>SHREE HARI OM TRADERS</strong> • GSTIN: <strong className="text-emerald-700">{scanResult.buyer_gstin || '05DKWPS9122N1Z5'}</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Invoice Total</div>
                        <div className="text-xl font-black text-emerald-800">₹{scanResult.grand_total.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Scanned Document Preview */}
                      <div className="lg:col-span-4 bg-slate-100 rounded-xl p-3 border border-slate-200 flex flex-col items-center justify-center min-h-[300px]">
                        {scanPreviewUrl ? (
                          <div className="w-full text-center space-y-2">
                            <span className="text-xs font-semibold text-slate-500 block">Original Scanned Invoice Document</span>
                            <img 
                              src={scanPreviewUrl} 
                              alt="Scanned Bill" 
                              className="max-h-80 w-auto mx-auto rounded-lg shadow-sm border border-slate-300 object-contain"
                            />
                            <div className="text-2xs text-slate-400">Captured via Mobile Camera / PDF Upload</div>
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 text-xs">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <span>Invoice file uploaded to secure storage</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Editable Verification Form */}
                      <div className="lg:col-span-8 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Supplier Business Name</label>
                            <input 
                              type="text"
                              value={scanResult.supplier_name}
                              onChange={(e) => setScanResult({ ...scanResult, supplier_name: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-bold text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Supplier GSTIN</label>
                            <input 
                              type="text"
                              value={scanResult.supplier_gstin || ''}
                              onChange={(e) => setScanResult({ ...scanResult, supplier_gstin: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Invoice Number</label>
                            <input 
                              type="text"
                              value={scanResult.invoice_number}
                              onChange={(e) => setScanResult({ ...scanResult, invoice_number: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-mono font-bold text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Invoice Date</label>
                            <input 
                              type="date"
                              value={scanResult.invoice_date}
                              onChange={(e) => setScanResult({ ...scanResult, invoice_date: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                            />
                          </div>
                        </div>

                        {/* Extracted Items & Destination Racks */}
                        <div>
                          <div className="flex flex-wrap items-center justify-between mb-2">
                            <label className="font-bold text-slate-700 text-xs">
                              Extracted Products & Assigned Storage Racks ({scanResult.items.length} items)
                            </label>
                            <span className="text-3xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                              💡 Check packaging box for Expiry Date
                            </span>
                          </div>
                          
                          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 mb-2.5 flex items-start space-x-2 text-2xs text-amber-900">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong>Expiry Tracking Workflow:</strong> Indian distributor bills do not print product expiry dates. When unboxing items onto godown pallets or shop shelves, verify physical box expiry and use quick buttons (<strong>+3M, +6M, +1Y</strong>) to save shelf life with 1 tap.
                            </div>
                          </div>

                          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                            {scanResult.items.map((it, idx) => (
                              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="font-bold text-slate-800 text-sm">
                                    {it.product_name || it.raw_name}
                                  </div>
                                  <span className="text-2xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                    GST {it.gst_rate}% (CGST ₹{it.cgst} + SGST ₹{it.sgst})
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs">
                                  <div>
                                    <span className="text-slate-400 block">Quantity & Unit</span>
                                    <input 
                                      type="number"
                                      value={it.quantity}
                                      onChange={(e) => {
                                        const newItems = [...scanResult.items];
                                        newItems[idx].quantity = Number(e.target.value);
                                        setScanResult({ ...scanResult, items: newItems });
                                      }}
                                      className="p-1 border border-slate-300 rounded bg-white w-full font-bold"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block">Batch Number</span>
                                    <input 
                                      type="text"
                                      value={it.batch_number}
                                      onChange={(e) => {
                                        const newItems = [...scanResult.items];
                                        newItems[idx].batch_number = e.target.value;
                                        setScanResult({ ...scanResult, items: newItems });
                                      }}
                                      className="p-1 border border-slate-300 rounded bg-white w-full font-mono"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-semibold block">Expiry Date</span>
                                    <input 
                                      type="date"
                                      value={it.expiry_date || ''}
                                      onChange={(e) => {
                                        const newItems = [...scanResult.items];
                                        newItems[idx].expiry_date = e.target.value;
                                        setScanResult({ ...scanResult, items: newItems });
                                      }}
                                      className="p-1 border border-slate-300 rounded bg-white w-full text-2xs"
                                    />
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-3xs text-slate-400 font-bold">Quick:</span>
                                      <button type="button" onClick={() => setItemExpiryQuick(idx, 3)} className="px-1 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-3xs font-bold">+3M</button>
                                      <button type="button" onClick={() => setItemExpiryQuick(idx, 6)} className="px-1 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-3xs font-bold">+6M</button>
                                      <button type="button" onClick={() => setItemExpiryQuick(idx, 9)} className="px-1 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-3xs font-bold">+9M</button>
                                      <button type="button" onClick={() => setItemExpiryQuick(idx, 12)} className="px-1 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-3xs font-bold">+1Y</button>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block">Destination Facility</span>
                                    <select
                                      value={it.destination_location_id || 'loc-godown'}
                                      onChange={(e) => {
                                        const newItems = [...scanResult.items];
                                        newItems[idx].destination_location_id = e.target.value;
                                        setScanResult({ ...scanResult, items: newItems });
                                      }}
                                      className="p-1 border border-slate-300 rounded bg-white w-full font-semibold"
                                    >
                                      <option value="loc-godown">Back Godown (Bulk)</option>
                                      <option value="loc-main">Main Shop (Shelf)</option>
                                      <option value="loc-second">Second Shop (Buffer)</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tax & Total Summary */}
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-3">
                          <div className="flex space-x-4 text-slate-600">
                            <span>Subtotal: <strong>₹{scanResult.subtotal.toFixed(2)}</strong></span>
                            <span>Total CGST: <strong>₹{scanResult.total_cgst.toFixed(2)}</strong></span>
                            <span>Total SGST: <strong>₹{scanResult.total_sgst.toFixed(2)}</strong></span>
                          </div>
                          <div className="text-sm font-black text-emerald-900">
                            Grand Total: ₹{scanResult.grand_total.toFixed(2)}
                          </div>
                        </div>

                        {/* Verification Action Buttons */}
                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={handleConfirmPurchase}
                            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow transition flex items-center justify-center space-x-2 text-sm"
                          >
                            <FileCheck className="w-4 h-4" />
                            <span>Verify & Inward into Inventory Batches</span>
                          </button>
                          <button
                            onClick={() => {
                              setScanResult(null);
                              setScanPreviewUrl(null);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-3 rounded-xl text-xs"
                          >
                            Discard
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Purchase Bills Register Table & Standard Filters */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Archived Purchase Invoices & Cash Memos</h4>
                      <p className="text-2xs text-slate-500">Standard accounting baseline starting from October 2026 onwards</p>
                    </div>

                    {/* Pakka vs Kaccha Filter Tabs */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                      <button
                        onClick={() => setPurchaseBillTypeFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg transition ${purchaseBillTypeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        All Bills ({purchasesHistory.length})
                      </button>
                      <button
                        onClick={() => setPurchaseBillTypeFilter('GST')}
                        className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${purchaseBillTypeFilter === 'GST' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        <span>🏛️ Pakka (GST)</span>
                        <span className="text-3xs opacity-80">({purchasesHistory.filter(p => p.is_gst_bill).length})</span>
                      </button>
                      <button
                        onClick={() => setPurchaseBillTypeFilter('NON_GST')}
                        className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${purchaseBillTypeFilter === 'NON_GST' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        <span>📝 Kaccha (Cash Memos)</span>
                        <span className="text-3xs opacity-80">({purchasesHistory.filter(p => !p.is_gst_bill).length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Period, Supplier, and Search Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="text-3xs font-bold text-slate-400 block mb-1 uppercase">Period Filter</label>
                      <select
                        value={purchaseMonthFilter}
                        onChange={(e) => setPurchaseMonthFilter(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                      >
                        <option value="ALL">All Standard (Oct 2026 - Mar 2027)</option>
                        <option value="10">October 2026</option>
                        <option value="11">November 2026</option>
                        <option value="12">December 2026</option>
                        <option value="Q3">Q3 (October - December)</option>
                        <option value="Q4">Q4 (January - March 2027)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-3xs font-bold text-slate-400 block mb-1 uppercase">Supplier Filter</label>
                      <select
                        value={purchaseSupplierFilter}
                        onChange={(e) => setPurchaseSupplierFilter(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                      >
                        <option value="ALL">All Suppliers & Vendors</option>
                        {Array.from(new Set(purchasesHistory.map(p => p.supplier_name))).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-3xs font-bold text-slate-400 block mb-1 uppercase">Search Register</label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search Bill # or Item..."
                          value={purchaseSearch}
                          onChange={(e) => setPurchaseSearch(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Invoices List Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Invoice Number</th>
                          <th className="py-2.5 px-3">Supplier Name</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Items</th>
                          <th className="py-2.5 px-3">Taxable Value</th>
                          <th className="py-2.5 px-3">GST Total</th>
                          <th className="py-2.5 px-3">Grand Total</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPurchases.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="py-8 text-center text-slate-400">
                              No purchase records match the selected filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredPurchases.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition">
                              <td className="py-3 px-3">
                                <span className={`font-bold px-2 py-0.5 rounded text-3xs ${p.is_gst_bill ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {p.is_gst_bill ? 'Pakka (GST)' : 'Kaccha (Cash)'}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-800">{p.invoice_number}</td>
                              <td className="py-3 px-3 font-semibold text-slate-800">{p.supplier_name}</td>
                              <td className="py-3 px-3 text-slate-500">{p.invoice_date}</td>
                              <td className="py-3 px-3">
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-3xs font-semibold">
                                  {p.items ? p.items.length : 1} items
                                </span>
                              </td>
                              <td className="py-3 px-3">₹{Number(p.taxable_value || 0).toFixed(2)}</td>
                              <td className="py-3 px-3">₹{Number((p.cgst_amount || 0) + (p.sgst_amount || 0) + (p.igst_amount || 0)).toFixed(2)}</td>
                              <td className="py-3 px-3 font-bold text-emerald-800">₹{Number(p.grand_total || 0).toFixed(2)}</td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    onClick={() => setViewInvoice(p)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="View Full Bill & Line Items"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditInvoice({ ...p, items: p.items ? p.items.map(it => ({ ...it })) : [] })}
                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                    title="Edit Full Invoice & Items"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteInvoice(p.id)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                    title="Delete Invoice"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'inventory' && (
              <div className="space-y-5">
                {/* Header & Filter */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Facility & Rack Storage Hierarchy</h3>
                    <p className="text-xs text-slate-500">Every rack and shelf section mapped to prevent misplaced products</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-500">Filter Location:</span>
                    <select 
                      value={inventoryLocationFilter}
                      onChange={(e) => setInventoryLocationFilter(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                    >
                      <option value="ALL">All 3 Facilities</option>
                      <option value="loc-main">Main Shop (10-12 Racks)</option>
                      <option value="loc-second">Second Shop (Expiry/Buffer)</option>
                      <option value="loc-godown">Back Godown (Bulk Cartons)</option>
                    </select>
                  </div>
                </div>

                {/* Locations Display */}
                <div className="space-y-6">
                  {locations
                    .filter(loc => inventoryLocationFilter === 'ALL' || loc.id === inventoryLocationFilter)
                    .map(loc => (
                      <div key={loc.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-emerald-700" />
                            <h4 className="font-bold text-slate-800 text-sm">{loc.name}</h4>
                            <span className="text-2xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              {loc.type}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">{loc.racks?.length || 0} Registered Racks</span>
                        </div>

                        {/* Racks Grid */}
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {loc.racks?.map(rack => (
                            <div key={rack.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50 hover:bg-white hover:border-emerald-400 transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-800 text-xs">{rack.rack_code}</span>
                                <span className="text-2xs text-slate-400">{rack.sections?.length || 0} Sections</span>
                              </div>
                              <p className="text-2xs text-slate-500 mb-2">{rack.description}</p>
                              
                              <div className="space-y-1">
                                {rack.sections?.map(sec => (
                                  <div key={sec.id} className="text-2xs bg-white border border-slate-200 rounded px-2 py-1 flex justify-between text-slate-600">
                                    <span>{sec.section_code}</span>
                                    <span className="text-slate-400">{sec.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: EXPIRY MANAGEMENT & SUPPLIER RETURNS               */}
            {/* ========================================================= */}
            {activeTab === 'expiry' && (
              <div className="space-y-5">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Expiry Tracking & Supplier Return Workflow</h3>
                    <p className="text-xs text-slate-500">Every batch tracked to its original supplier, contact number, and return deadline</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-2.5 py-1 bg-red-100 text-red-800 font-bold rounded-lg">
                      Expired: {expiryAlerts.filter(a => a.urgency === 'EXPIRED').length}
                    </span>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg">
                      Expiring Soon: {expiryAlerts.filter(a => a.urgency !== 'EXPIRED').length}
                    </span>
                  </div>
                </div>

                {/* Expiry Items Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                        <tr>
                          <th className="py-3 px-3">Product & Batch</th>
                          <th className="py-3 px-3">Current Location</th>
                          <th className="py-3 px-3">Expiry Date</th>
                          <th className="py-3 px-3">Quantity & Value</th>
                          <th className="py-3 px-3">Supplier & Contact</th>
                          <th className="py-3 px-3">Return Policy</th>
                          <th className="py-3 px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {expiryAlerts.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="py-8 text-center text-slate-400">
                              No near-expiry products currently detected.
                            </td>
                          </tr>
                        ) : (
                          expiryAlerts.map(alertItem => {
                            const isExpired = alertItem.urgency === 'EXPIRED';
                            return (
                              <tr key={alertItem.batch_id} className={`hover:bg-slate-50 ${isExpired ? 'bg-red-50/30' : ''}`}>
                                <td className="py-3 px-3">
                                  <div className="font-bold text-slate-800">{alertItem.product_name}</div>
                                  <div className="text-2xs text-slate-400 font-mono">Batch: {alertItem.batch_number}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-slate-700">{alertItem.location_name}</div>
                                  <div className="text-2xs text-slate-400">{alertItem.rack_code || 'Shelf'}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded font-bold ${
                                    isExpired ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {alertItem.expiry_date}
                                  </span>
                                  {isExpired && <div className="text-2xs text-red-600 font-semibold mt-0.5">EXPIRED</div>}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-bold text-slate-800">{alertItem.quantity_remaining} Units</div>
                                  <div className="text-2xs text-slate-500">₹{(alertItem.quantity_remaining * alertItem.purchase_price).toFixed(2)} cost</div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-slate-800">{alertItem.supplier_name}</div>
                                  <a href={`tel:${alertItem.supplier_phone}`} className="text-2xs text-emerald-700 hover:underline flex items-center mt-0.5">
                                    <Phone className="w-2.5 h-2.5 mr-1" /> {alertItem.supplier_phone}
                                  </a>
                                </td>
                                <td className="py-3 px-3 max-w-xs">
                                  <p className="text-2xs text-slate-600 line-clamp-2">{alertItem.return_policy || 'No policy logged'}</p>
                                  <span className="text-2xs text-slate-400">Deadline: {alertItem.return_deadline_days} days before exp</span>
                                </td>
                                <td className="py-3 px-3">
                                  <button
                                    onClick={async () => {
                                      await axios.post('/api/expiry/returns', {
                                        batch_id: alertItem.batch_id,
                                        quantity: alertItem.quantity_remaining,
                                        status: 'SUPPLIER_CONTACTED',
                                        notes: 'Supplier contacted via phone for credit note processing.'
                                      });
                                      alert('Expiry return initiated & status updated to SUPPLIER_CONTACTED');
                                      fetchAllData();
                                    }}
                                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-2.5 py-1 rounded shadow-xs"
                                  >
                                    Initiate Return
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5: SMART REORDER & SPACE PLANNING                     */}
            {/* ========================================================= */}
            {activeTab === 'reorder' && (
              <div className="space-y-5">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Intelligent Reorder & Godown Transfer Engine</h3>
                    <p className="text-xs text-slate-500">Checks Back Godown before recommending purchasing to save working capital and storage space</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reorders.map(item => {
                    const isTransfer = item.action === 'TRANSFER_FROM_GODOWN';
                    const isReorder = item.action === 'REORDER_FROM_SUPPLIER';
                    const isOverstock = item.action === 'OVERSTOCKED_ALERT';

                    return (
                      <div 
                        key={item.id} 
                        className={`bg-white rounded-xl border p-4 shadow-sm flex flex-col justify-between ${
                          isTransfer ? 'border-amber-300 ring-2 ring-amber-100' : isReorder ? 'border-blue-300' : 'border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <span className={`text-2xs font-bold px-2 py-0.5 rounded-full uppercase ${
                              isTransfer ? 'bg-amber-100 text-amber-800' : isReorder ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.action.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-bold text-slate-700">Priority: {item.priority}</span>
                          </div>

                          <h4 className="font-bold text-slate-800 text-sm mt-2">{item.name}</h4>
                          <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {item.reason}
                          </p>

                          <div className="mt-3 grid grid-cols-3 gap-2 text-2xs text-center border-t border-slate-100 pt-2">
                            <div className="bg-slate-50 p-1.5 rounded">
                              <span className="text-slate-400 block">Main Shop</span>
                              <span className="font-bold text-slate-800">{item.main_shop_stock}</span>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded">
                              <span className="text-slate-400 block">Godown</span>
                              <span className="font-bold text-emerald-700">{item.godown_stock}</span>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded">
                              <span className="text-slate-400 block">Reorder Pt</span>
                              <span className="font-bold text-slate-800">{item.reorder_point}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-2xs text-slate-400 block">Suggested Qty</span>
                            <span className="font-black text-sm text-slate-800">{item.suggestedQuantity} {item.base_unit}</span>
                          </div>

                          {isTransfer ? (
                            <button
                              onClick={() => {
                                setTransferBatch({
                                  product_name: item.name,
                                  product_id: item.id,
                                  from_name: 'Back Godown',
                                  quantity_remaining: item.godown_stock
                                });
                                setShowTransferModal(true);
                              }}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                            >
                              Shift from Godown
                            </button>
                          ) : isReorder ? (
                            <button
                              onClick={() => alert(`Purchase order draft generated for ${item.supplier_name || 'Supplier'}`)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                            >
                              Create PO
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">Healthy</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 6: GST & ACCOUNTING REGISTERS                         */}
            {/* ========================================================= */}
            {activeTab === 'gst' && gstData && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">GST Registers & Quarterly Reconciliation</h3>
                    <p className="text-xs text-slate-500">Strict separation of GST Tax Invoices from Non-GST records, prepared for GSTR-1 & GSTR-3B</p>
                  </div>
                  <button 
                    onClick={() => alert('Exporting GSTR Quarterly Audit Excel Summary...')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow"
                  >
                    📥 Export Quarterly GST Summary
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">GST Sales Register</span>
                    <div className="text-xl font-black text-emerald-800 mt-1">
                      ₹{gstData.gstSales.total_sales.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Taxable Amount:</span>
                        <span className="font-semibold">₹{gstData.gstSales.total_taxable.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CGST (50%):</span>
                        <span className="font-semibold">₹{gstData.gstSales.total_cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST (50%):</span>
                        <span className="font-semibold">₹{gstData.gstSales.total_sgst.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Other / Retail Sales Register</span>
                    <div className="text-xl font-black text-blue-800 mt-1">
                      ₹{gstData.otherSales.total_sales.toFixed(2)}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {gstData.otherSales.total_bills} Retail counter transactions kept distinct from B2B GST register.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">GST Purchases (ITC)</span>
                    <div className="text-xl font-black text-purple-800 mt-1">
                      ₹{gstData.gstPurchases.total_purchases.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Total Taxable:</span>
                        <span className="font-semibold">₹{gstData.gstPurchases.total_taxable.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Input CGST + SGST:</span>
                        <span className="font-semibold">₹{(gstData.gstPurchases.total_cgst + gstData.gstPurchases.total_sgst).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate-Wise Tax Slabs Table */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Rate-Wise GST Slabs Analysis (Sales)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">GST Slab Rate</th>
                          <th className="py-2.5 px-3">Taxable Value</th>
                          <th className="py-2.5 px-3">CGST Amount</th>
                          <th className="py-2.5 px-3">SGST Amount</th>
                          <th className="py-2.5 px-3">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {gstData.rateWiseSales?.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-4 text-center text-slate-400">
                              No GST-tagged sales recorded yet in this quarter.
                            </td>
                          </tr>
                        ) : (
                          gstData.rateWiseSales?.map(slab => (
                            <tr key={slab.gst_rate} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-800">{slab.gst_rate}% Slab</td>
                              <td className="py-2.5 px-3">₹{slab.taxable_amount.toFixed(2)}</td>
                              <td className="py-2.5 px-3">₹{slab.cgst_amount.toFixed(2)}</td>
                              <td className="py-2.5 px-3">₹{slab.sgst_amount.toFixed(2)}</td>
                              <td className="py-2.5 px-3 font-bold text-emerald-700">₹{slab.total_amount.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 7: STAFF TASKS & DAILY SOPS                           */}
            {/* ========================================================= */}
            {activeTab === 'tasks' && (
              <div className="space-y-5">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Standard Operating Procedures & Daily Task Log</h3>
                    <p className="text-xs text-slate-500">Accountability for billing, shelf stocking, expiry inspection, and closing SOPs</p>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    Current Role: {userRole}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.map(t => {
                    const isDone = t.status === 'COMPLETED';
                    const isUrgent = t.priority === 'URGENT';
                    return (
                      <div 
                        key={t.id} 
                        className={`bg-white rounded-xl border p-4 shadow-sm flex items-start space-x-3 transition ${
                          isDone ? 'border-emerald-200 bg-emerald-50/20 opacity-80' : isUrgent ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleTaskStatus(t.id, t.status)}
                          className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {t.assigned_to}
                            </span>
                            <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${
                              isUrgent ? 'bg-red-100 text-red-700' : 'text-slate-400'
                            }`}>
                              {t.priority}
                            </span>
                          </div>

                          <h4 className={`font-bold text-sm mt-1.5 ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {t.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{t.description}</p>

                          <div className="mt-3 flex items-center justify-between text-2xs text-slate-400 pt-2 border-t border-slate-100">
                            <span>Due: {t.due_date}</span>
                            <span>{isDone ? `Verified by: ${t.verified_by || 'Owner'}` : 'Pending Action'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 8: SUPPLIER DIRECTORY                                 */}
            {/* ========================================================= */}
            {activeTab === 'suppliers' && (
              <div className="space-y-5">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Centralized Supplier Database</h3>
                    <p className="text-xs text-slate-500">Contact details, GSTIN, credit terms, and return policies for each distributor</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suppliers.map(s => (
                    <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{s.business_name}</h4>
                        <p className="text-xs text-slate-500">Contact: {s.name}</p>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a href={`tel:${s.phone}`} className="hover:underline font-semibold">{s.phone}</a>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{s.address}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 font-mono text-2xs">
                          <span className="font-bold text-slate-500">GSTIN:</span>
                          <span>{s.gstin || 'Unregistered'}</span>
                        </div>
                      </div>

                      <div className="text-2xs text-slate-600 border-t border-slate-100 pt-2 space-y-1">
                        <div><strong className="text-slate-700">Return Policy:</strong> {s.return_policy}</div>
                        <div><strong className="text-slate-700">Credit Terms:</strong> {s.credit_terms_days} Days</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: THERMAL RECEIPT PREVIEW (POS BILL)               */}
      {/* ========================================================= */}
      {showReceipt && lastBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h3 className="font-black text-lg text-slate-900 tracking-tight">HARI OM TRADERS</h3>
              <p className="text-2xs text-slate-500">Main Market, Delhi • Ph: +91 98110 00000</p>
              <div className="text-2xs text-slate-400 mt-1 font-mono">Bill No: {lastBill.billNumber}</div>
              <div className="text-2xs text-slate-400 font-mono">{lastBill.date}</div>
            </div>

            <div className="text-2xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <span className="font-semibold">{lastBill.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Mode:</span>
                <span className="font-semibold uppercase">{lastBill.paymentMode}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-slate-300 py-2 divide-y divide-slate-100 text-xs">
              {lastBill.items?.map(it => (
                <div key={it.product_id} className="py-1 flex justify-between">
                  <span className="truncate max-w-[180px]">{it.name} x {it.quantity}</span>
                  <span className="font-semibold">₹{(it.quantity * it.selling_price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Taxable Amount:</span>
                <span>₹{lastBill.totalTaxable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>CGST + SGST:</span>
                <span>₹{(lastBill.totalCgst + lastBill.totalSgst).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-base text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL PAID:</span>
                <span className="text-emerald-700">₹{lastBill.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-2xs text-slate-400 pt-2 border-t border-dashed border-slate-300">
              Thank you for shopping at Hari Om Traders!
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Bill</span>
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: GODOWN-TO-SHOP INTERNAL TRANSFER                 */}
      {/* ========================================================= */}
      {showTransferModal && transferBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-800">
              <ArrowRightLeft className="w-5 h-5" />
              <h3 className="font-bold text-base">Internal Stock Transfer</h3>
            </div>
            
            <p className="text-xs text-slate-600">
              Transfer <strong>{transferBatch.product_name}</strong> from Back Godown to Main Shop without generating new accounting purchase.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Destination Location</label>
                <select 
                  value={transferToLoc}
                  onChange={(e) => setTransferToLoc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
                >
                  <option value="loc-main">Main Shop (Front Shelf Rack)</option>
                  <option value="loc-second">Second Shop (Expiry/Buffer)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Quantity to Shift (Max: {transferBatch.quantity_remaining})</label>
                <input 
                  type="number"
                  min="1"
                  max={transferBatch.quantity_remaining}
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-bold text-sm"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-3">
              <button
                onClick={handleTransferSubmit}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Confirm Stock Relocation
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: VIEW INVOICE MODAL                               */}
      {/* ========================================================= */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  {viewInvoice.verification_status || 'VERIFIED'}
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">Invoice #{viewInvoice.invoice_number}</h3>
              </div>
              <button 
                onClick={() => setViewInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs border border-slate-200">
              <div>
                <span className="text-slate-400 block text-2xs uppercase font-bold">Supplier</span>
                <span className="font-bold text-slate-800">{viewInvoice.supplier_name}</span>
                {viewInvoice.supplier_gstin && (
                  <span className="block font-mono text-2xs text-slate-500 mt-0.5">GSTIN: {viewInvoice.supplier_gstin}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-2xs uppercase font-bold">Invoice Date</span>
                <span className="font-bold text-slate-800">{viewInvoice.invoice_date}</span>
              </div>
            </div>

            {/* Line items if available */}
            {viewInvoice.items && viewInvoice.items.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Item Breakdown ({viewInvoice.items.length} items)</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {viewInvoice.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center bg-white hover:bg-slate-50">
                      <div>
                        <span className="font-semibold text-slate-800 block">{it.product_name || it.name}</span>
                        <span className="text-2xs text-slate-400">{it.quantity} {it.unit || 'UNIT'} @ ₹{it.rate || it.purchase_price} (GST {it.gst_rate}%)</span>
                      </div>
                      <span className="font-bold text-slate-800">₹{Number(it.total_amount || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tax & Total Summary */}
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Value:</span>
                <span className="font-mono">₹{Number(viewInvoice.taxable_value || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST + SGST:</span>
                <span className="font-mono">₹{Number((viewInvoice.cgst_amount || 0) + (viewInvoice.sgst_amount || 0) + (viewInvoice.igst_amount || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-base text-slate-900 pt-2 border-t border-emerald-200">
                <span>Grand Total:</span>
                <span className="text-emerald-800">₹{Number(viewInvoice.grand_total || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewInvoice(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: GEMINI VISION AI CONFIGURATION MODAL              */}
      {/* ========================================================= */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-slate-800 text-base">Gemini Vision AI Configuration</h4>
              </div>
              <button 
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Connect your free <strong>Google AI Studio Gemini API Key</strong> to enable 100% automated OCR & multi-line item extraction for any invoice layout (Marg ERP, Busy, Tally, photo or PDF).
              </p>
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-2xs text-amber-800">
                ⚡ <strong>Free Tier:</strong> Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold text-blue-700">aistudio.google.com</a>. The key is securely stored in your local browser only.
              </div>
            </div>

            <div>
              <label className="text-2xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Gemini API Key
              </label>
              <input 
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs bg-slate-50 focus:bg-white focus:border-emerald-600 outline-none"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs shadow transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save API Key</span>
              </button>
              {geminiApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('hariom_gemini_api_key');
                    setGeminiApiKey('');
                    setTempApiKey('');
                    alert('API Key cleared. Switched back to Standard/Manual Mode.');
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2.5 rounded-xl text-xs border border-rose-200 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: COMPLETE ITEM-LEVEL INVOICE & CASH MEMO EDITOR    */}
      {/* ========================================================= */}
      {editInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className={`text-3xs font-bold px-2 py-0.5 rounded-full uppercase ${editInvoice.is_gst_bill ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {editInvoice.is_gst_bill ? 'Pakka (GST) Tax Invoice' : 'Kaccha (Non-GST) Cash Memo'}
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">
                  Edit Invoice #{editInvoice.invoice_number || 'New'}
                </h3>
              </div>
              <button 
                onClick={() => setEditInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Header Fields & Bill Type Switch */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="sm:col-span-1">
                <label className="font-semibold text-slate-700 block mb-1">Invoice Number</label>
                <input 
                  type="text"
                  value={editInvoice.invoice_number || ''}
                  onChange={(e) => setEditInvoice({ ...editInvoice, invoice_number: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold bg-white text-xs"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="font-semibold text-slate-700 block mb-1">Supplier Name</label>
                <input 
                  type="text"
                  value={editInvoice.supplier_name || ''}
                  onChange={(e) => setEditInvoice({ ...editInvoice, supplier_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold bg-white text-xs"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="font-semibold text-slate-700 block mb-1">Invoice Date</label>
                <input 
                  type="date"
                  value={editInvoice.invoice_date || ''}
                  onChange={(e) => setEditInvoice({ ...editInvoice, invoice_date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="font-semibold text-slate-700 block mb-1">Bill Type</label>
                <select
                  value={editInvoice.is_gst_bill ? '1' : '0'}
                  onChange={(e) => {
                    const isGst = e.target.value === '1';
                    setEditInvoice({ ...editInvoice, is_gst_bill: isGst });
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold bg-white text-xs"
                >
                  <option value="1">🏛️ GST (Pakka)</option>
                  <option value="0">📝 Non-GST (Kaccha)</option>
                </select>
              </div>
            </div>

            {/* Line Items Editor Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-slate-800 text-xs">
                  Line Items & Quantities ({editInvoice.items ? editInvoice.items.length : 0})
                </label>
                <button
                  type="button"
                  onClick={addEditInvoiceItem}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-2xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product Row</span>
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(!editInvoice.items || editInvoice.items.length === 0) ? (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                    No items attached to this invoice yet. Click "+ Add Product Row" above to add products.
                  </div>
                ) : (
                  editInvoice.items.map((it, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center gap-2">
                      <div className="flex-1 min-w-[140px]">
                        <span className="text-3xs text-slate-400 block font-semibold uppercase">Product Name</span>
                        <input
                          type="text"
                          value={it.product_name || it.name || ''}
                          onChange={(e) => updateEditInvoiceItem(idx, 'product_name', e.target.value)}
                          className="w-full p-1 border border-slate-300 rounded bg-white font-semibold text-xs"
                        />
                      </div>

                      <div className="w-16">
                        <span className="text-3xs text-slate-400 block font-semibold uppercase">Qty</span>
                        <input
                          type="number"
                          step="1"
                          value={it.quantity || 1}
                          onChange={(e) => updateEditInvoiceItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full p-1 border border-slate-300 rounded bg-white font-bold text-center text-xs"
                        />
                      </div>

                      <div className="w-18">
                        <span className="text-3xs text-slate-400 block font-semibold uppercase">Unit</span>
                        <select
                          value={it.unit || 'UNIT'}
                          onChange={(e) => updateEditInvoiceItem(idx, 'unit', e.target.value)}
                          className="w-full p-1 border border-slate-300 rounded bg-white text-3xs font-semibold"
                        >
                          <option value="UNIT">UNIT</option>
                          <option value="PCS">PCS</option>
                          <option value="BOX">BOX</option>
                          <option value="CASE">CASE</option>
                          <option value="BAG">BAG</option>
                        </select>
                      </div>

                      <div className="w-20">
                        <span className="text-3xs text-slate-400 block font-semibold uppercase">Rate (₹)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={it.rate || 0}
                          onChange={(e) => updateEditInvoiceItem(idx, 'rate', Number(e.target.value))}
                          className="w-full p-1 border border-slate-300 rounded bg-white text-xs font-mono"
                        />
                      </div>

                      {editInvoice.is_gst_bill && (
                        <div className="w-18">
                          <span className="text-3xs text-slate-400 block font-semibold uppercase">GST %</span>
                          <select
                            value={it.gst_rate !== undefined ? it.gst_rate : 5}
                            onChange={(e) => updateEditInvoiceItem(idx, 'gst_rate', Number(e.target.value))}
                            className="w-full p-1 border border-slate-300 rounded bg-white text-3xs font-semibold"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </div>
                      )}

                      <div className="w-20 text-right">
                        <span className="text-3xs text-slate-400 block font-semibold uppercase">Total (₹)</span>
                        <span className="font-bold text-slate-800 text-xs block pt-1">
                          ₹{Number(it.total_amount || 0).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeEditInvoiceItem(idx)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Delete this item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Recalculated Summary Bar */}
            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex space-x-4 text-slate-600">
                <span>Taxable Value: <strong className="font-mono">₹{Number(editInvoice.taxable_value || 0).toFixed(2)}</strong></span>
                {editInvoice.is_gst_bill && (
                  <span>GST Total: <strong className="font-mono">₹{Number((editInvoice.cgst_amount || 0) + (editInvoice.sgst_amount || 0)).toFixed(2)}</strong></span>
                )}
              </div>
              <div className="text-sm font-black text-emerald-900">
                Grand Total: ₹{Number(editInvoice.grand_total || 0).toFixed(2)}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleSaveEditedInvoice}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-xs shadow transition flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save All Changes to Invoice & Stock</span>
              </button>
              <button
                onClick={() => setEditInvoice(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
