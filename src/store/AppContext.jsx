import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, TODAY_STATS, RECENT_BILLS, PENDING_UPI, BUSINESS, SUPPLIERS } from '../data/mockData';
import {
  deleteManualEntryFromCloud,
  loadStoreDataFromCloud,
  syncBillToCloud,
  syncBusinessToCloud,
  syncCustomerToCloud,
  syncDailyStatsToCloud,
  syncKhataCreditToCloud,
  syncManualEntryToCloud,
  syncProductToCloud,
  syncStockToCloud,
  syncSupplierToCloud,
} from '../services/dbSync';
import { normalizeProduct } from '../utils/inventory';

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    // Navigation
    'nav.bills': 'Bills',
    'nav.inventory': 'Inventory',
    'nav.insights': 'Insights',
    'nav.khata': 'Khata',
    'nav.settings': 'Settings',
    // POS / Billing
    'pos.new_bill': 'New Bill',
    'pos.rush_mode': '⚡ Rush',
    'pos.generate_bill': 'Generate Bill',
    'pos.add_items': 'Add Items',
    'pos.search_placeholder': 'Search or scan barcode...',
    'pos.quick_items': 'Frequently Used',
    'pos.cart': 'Current Bill',
    'pos.total': 'Total',
    'pos.empty_cart': 'Cart is empty — tap items to add',
    'pos.clear_cart': 'Clear Cart',
    'pos.customer_optional': 'Add customer (optional)',
    'pos.customer_placeholder': 'Customer name / phone',
    'pos.payment_cash': 'Cash',
    'pos.payment_upi': 'UPI',
    'pos.payment_khata': 'Khata (Credit)',
    'pos.bill_created': 'Bill Created!',
    'pos.new_bill_btn': 'New Bill',
    'pos.stock_updated': 'Stock updated automatically',
    'pos.staff_mode_banner': '🔒 Staff Mode — tap to unlock',
    // Khata
    'khata.title': 'Customer Khata',
    'khata.outstanding': 'Total Outstanding',
    'khata.receive': 'Receive Payment',
    'khata.settled': 'Settled ✓',
    'khata.no_customers': 'No customers found',
    'khata.add_customer': '+ Add Customer',
    'khata.due': 'Due',
    'khata.call': 'Call',
    'khata.cancel': 'Cancel',
    'khata.record_payment': 'Record Payment',
    'khata.name_required': 'Customer Name',
    'khata.phone_optional': 'Phone (optional)',
    'khata.save': 'Save Customer',
    // Inventory
    'inventory.title': 'Stock & Inventory',
    'inventory.add_stock': 'Add Stock',
    'inventory.save_stock': 'Save & Update Stock',
    'inventory.low_stock': 'Low Stock',
    'inventory.critical': '🔴 Critical',
    'inventory.low': '🟡 Low',
    'inventory.sold_today': 'Sold today',
    // Reports
    'reports.title': 'Aaj ka Hisaab',
    'reports.generate_summary': '📊 Generate Today\'s Summary',
    'reports.today': 'Today',
    'reports.week': 'This Week',
    'reports.month': 'This Month',
    'reports.net_profit': 'Net Profit',
    'reports.gross_sales': 'Gross Sales',
    'reports.bills': 'Bills',
    'reports.expenses': 'Expenses',
    'reports.margin': 'Margin',
    'reports.payment_breakdown': 'Payment Breakdown',
    'reports.top_sellers': 'Top Selling Items',
    'reports.pending_upi': 'Pending UPI',
    'reports.all_verified': 'All UPI payments verified!',
    'reports.mark_verified': 'Mark Verified',
    'reports.bill_history': 'Today\'s Bills',
    // Settings
    'settings.title': 'Settings & Profile',
    'settings.lock_app': '🔒 Lock App (Staff Mode)',
    'settings.language': 'Language',
    'settings.save': 'Save Changes',
    'settings.edit_profile': 'Edit',
    'settings.low_stock_alerts': 'Low Stock Alerts',
    'settings.eod_reminder': 'End-of-day Reminder',
    'settings.auto_rush': 'Auto Rush Mode',
    'settings.data_backup': 'Data & Backup',
    'settings.account': 'Account',
    'settings.export_pdf': "Export Today's Data as PDF",
    'settings.whatsapp_backup': 'WhatsApp backup to myself',
    'settings.reset_data': 'Reset All Data',
    'settings.log_out': 'Log Out',
    'settings.reset_confirm': 'Reset all data? This cannot be undone.',
    'settings.logout_confirm': 'Are you sure you want to log out?',
    // Tour
    'tour.step0.title': 'Scan or Search',
    'tour.step0.body': 'Scan barcode or type item name to add to bill.',
    'tour.step1.title': 'Quick Items',
    'tour.step1.body': 'Tap your top-selling items to add them instantly.',
    'tour.step2.title': 'Generate Bill',
    'tour.step2.body': 'Cash, UPI, or Khata — finalise and print in 1 tap.',
    'tour.next': 'Next',
    'tour.go': "Let's Go! 🚀",
    // General
    'general.cancel': 'Cancel',
    'general.save': 'Save',
    'general.close': 'Close',
  },
  hi: {
    'nav.bills': 'बिल',
    'nav.inventory': 'स्टॉक',
    'nav.insights': 'हिसाब',
    'nav.khata': 'खाता',
    'nav.settings': 'सेटिंग्स',
    'pos.new_bill': 'नया बिल',
    'pos.rush_mode': '⚡ रश',
    'pos.generate_bill': 'बिल बनाएं',
    'pos.add_items': 'सामान जोड़ें',
    'pos.search_placeholder': 'सामान खोजें या स्कैन करें...',
    'pos.quick_items': 'जल्दी जोड़ें',
    'pos.cart': 'बिल',
    'pos.total': 'कुल राशि',
    'pos.empty_cart': 'कार्ट खाली है — सामान जोड़ें',
    'pos.clear_cart': 'कार्ट साफ करें',
    'pos.customer_optional': 'ग्राहक जोड़ें (वैकल्पिक)',
    'pos.customer_placeholder': 'ग्राहक का नाम / फ़ोन',
    'pos.payment_cash': 'नकद',
    'pos.payment_upi': 'यूपीआई',
    'pos.payment_khata': 'खाता (उधार)',
    'pos.bill_created': 'बिल बना!',
    'pos.new_bill_btn': 'नया बिल',
    'pos.stock_updated': 'स्टॉक अपडेट हो गया',
    'pos.staff_mode_banner': '🔒 स्टाफ मोड — अनलॉक करें',
    'khata.title': 'ग्राहक खाता',
    'khata.outstanding': 'कुल बकाया',
    'khata.receive': 'पैसे लें',
    'khata.settled': 'चुकता ✓',
    'khata.no_customers': 'कोई ग्राहक नहीं',
    'khata.add_customer': '+ ग्राहक जोड़ें',
    'khata.due': 'बकाया',
    'khata.call': 'कॉल',
    'khata.cancel': 'रद्द करें',
    'khata.record_payment': 'भुगतान दर्ज करें',
    'khata.name_required': 'ग्राहक का नाम',
    'khata.phone_optional': 'फ़ोन (वैकल्पिक)',
    'khata.save': 'ग्राहक सेव करें',
    'inventory.title': 'स्टॉक और माल',
    'inventory.add_stock': 'स्टॉक जोड़ें',
    'inventory.save_stock': 'सेव करें',
    'inventory.low_stock': 'कम स्टॉक',
    'inventory.critical': '🔴 खत्म होने वाला',
    'inventory.low': '🟡 कम',
    'inventory.sold_today': 'आज बिका',
    'reports.title': 'आज का हिसाब',
    'reports.generate_summary': '📊 आज की रिपोर्ट बनाएं',
    'reports.today': 'आज',
    'reports.week': 'इस हफ्ते',
    'reports.month': 'इस महीने',
    'reports.net_profit': 'शुद्ध लाभ',
    'reports.gross_sales': 'कुल बिक्री',
    'reports.bills': 'बिल',
    'reports.expenses': 'खर्चे',
    'reports.margin': 'मार्जिन',
    'reports.payment_breakdown': 'भुगतान विवरण',
    'reports.top_sellers': 'सबसे ज्यादा बिकने वाले',
    'reports.pending_upi': 'UPI बाकी',
    'reports.all_verified': 'सभी UPI भुगतान सत्यापित!',
    'reports.mark_verified': 'सत्यापित करें',
    'reports.bill_history': 'आज के बिल',
    'settings.title': 'सेटिंग्स और प्रोफाइल',
    'settings.lock_app': '🔒 लॉक करें (स्टाफ मोड)',
    'settings.language': 'भाषा',
    'settings.save': 'बदलाव सेव करें',
    'settings.edit_profile': 'बदलें',
    'settings.low_stock_alerts': 'कम स्टॉक अलर्ट',
    'settings.eod_reminder': 'दिन के अंत की याद',
    'settings.auto_rush': 'ऑटो रश मोड',
    'tour.step0.title': 'स्कैन या खोजें',
    'tour.step0.body': 'बारकोड स्कैन करें या सामान का नाम टाइप करें।',
    'tour.step1.title': 'जल्दी जोड़ें',
    'tour.step1.body': 'अपने सबसे ज्यादा बिकने वाले सामान तुरंत जोड़ें।',
    'tour.step2.title': 'बिल बनाएं',
    'tour.step2.body': 'नकद, UPI या खाता — 1 टैप में बिल बनाएं।',
    'tour.next': 'अगला',
    'tour.go': 'चलिए! 🚀',
    'general.cancel': 'रद्द करें',
    'general.save': 'सेव करें',
    'general.close': 'बंद करें',
  },
  mix: {
    'nav.bills': 'Bills (बिल)',
    'nav.inventory': 'Inventory (स्टॉक)',
    'nav.insights': 'Hisaab (हिसाब)',
    'nav.khata': 'Khata (खाता)',
    'nav.settings': 'Settings',
    'pos.new_bill': 'New Bill (नया बिल)',
    'pos.rush_mode': '⚡ Rush',
    'pos.generate_bill': 'Create Bill (बिल बनाएं)',
    'pos.add_items': 'Add Items (जोड़ें)',
    'pos.search_placeholder': 'Search / Scan (खोजें)...',
    'pos.quick_items': 'Quick Items (जल्दी जोड़ें)',
    'pos.cart': 'Bill (बिल)',
    'pos.total': 'Total (कुल)',
    'pos.empty_cart': 'Cart empty — koi item add karo',
    'pos.clear_cart': 'Clear Bill',
    'pos.customer_optional': 'Customer add karo (optional)',
    'pos.customer_placeholder': 'Customer name / phone',
    'pos.payment_cash': '💵 Cash (नकद)',
    'pos.payment_upi': '📱 UPI',
    'pos.payment_khata': '📒 Khata (उधार)',
    'pos.bill_created': 'Bill Ban Gaya! ✓',
    'pos.new_bill_btn': 'New Bill',
    'pos.stock_updated': 'Stock update ho gaya ✓',
    'pos.staff_mode_banner': '🔒 Staff Mode — Unlock karo',
    'khata.title': 'Customer Khata (खाता)',
    'khata.outstanding': 'Total Baaki (बकाया)',
    'khata.receive': 'Paise Lo',
    'khata.settled': 'Settled ✓',
    'khata.no_customers': 'Koi customer nahi mila',
    'khata.add_customer': '+ Customer Add Karo',
    'khata.due': 'Baaki',
    'khata.call': 'Call',
    'khata.cancel': 'Cancel',
    'khata.record_payment': 'Record Payment',
    'khata.name_required': 'Customer ka Naam',
    'khata.phone_optional': 'Phone (optional)',
    'khata.save': 'Customer Save Karo',
    'inventory.title': 'Stock & Inventory',
    'inventory.add_stock': 'Stock Add Karo',
    'inventory.save_stock': 'Save & Update Stock',
    'inventory.low_stock': 'Low Stock',
    'inventory.critical': '🔴 Critical',
    'inventory.low': '🟡 Low',
    'inventory.sold_today': 'Aaj bika',
    'reports.title': 'Aaj ka Hisaab',
    'reports.generate_summary': '📊 Aaj ki Summary Banao',
    'reports.today': 'Aaj',
    'reports.week': 'Is Hafte',
    'reports.month': 'Is Mahine',
    'reports.net_profit': 'Net Profit (फायदा)',
    'reports.gross_sales': 'Gross Sales (बिक्री)',
    'reports.bills': 'Bills (बिल)',
    'reports.expenses': 'Expenses (खर्चे)',
    'reports.margin': 'Margin',
    'reports.payment_breakdown': 'Payment Breakdown',
    'reports.top_sellers': 'Top Sellers (सबसे ज्यादा बिका)',
    'reports.pending_upi': 'Pending UPI',
    'reports.all_verified': 'Sab UPI verify ho gaya! ✓',
    'reports.mark_verified': 'Verify Karo',
    'reports.bill_history': 'Aaj ke Bills',
    'settings.title': 'Settings & Profile',
    'settings.lock_app': '🔒 Lock Karo (Staff Mode)',
    'settings.language': 'Bhasha / Language',
    'settings.save': 'Save Karo',
    'settings.edit_profile': 'Edit Karo',
    'settings.low_stock_alerts': 'Low Stock Alerts',
    'settings.eod_reminder': 'Din ke ant ki yaad',
    'settings.auto_rush': 'Auto Rush Mode',
    'tour.step0.title': 'Scan or Search Karo',
    'tour.step0.body': 'Barcode scan karo ya naam type karo — item bill mein aa jayega.',
    'tour.step1.title': 'Quick Items Tap Karo',
    'tour.step1.body': 'Apne sabse zyada bikne waale saamaan ek tap mein add karo.',
    'tour.step2.title': 'Bill Banao',
    'tour.step2.body': 'Cash, UPI, ya Khata — ek tap mein bill ready!',
    'tour.next': 'Aage (Next)',
    'tour.go': "Chalo! 🚀",
    'general.cancel': 'Cancel',
    'general.save': 'Save Karo',
    'general.close': 'Band Karo',
  }
};

const AppContext = createContext();
const LAST_RESET_BACKUP_KEY = 'flowops_last_reset_backup';

const isSandboxUser = (user) => !user?.uid || String(user.uid).startsWith('sandbox-');

const getTodayDateKey = () => new Date().toISOString().split('T')[0];

const normalizeManualEntry = (entry) => {
  const createdAt = entry?.createdAt || (entry?.dateKey ? `${entry.dateKey}T12:00:00.000Z` : new Date().toISOString());
  const parsedDate = new Date(createdAt);
  const safeCreatedAt = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

  return {
    ...entry,
    id: String(entry?.id ?? `M${Date.now()}`),
    amount: Number(entry?.amount || 0),
    createdAt: safeCreatedAt,
    dateKey: entry?.dateKey || safeCreatedAt.split('T')[0],
    time: entry?.time || new Date(safeCreatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    description: entry?.description || 'No description',
  };
};

const normalizeSupplier = (supplier) => ({
  ...supplier,
  id: String(supplier?.id ?? `S${Date.now()}`),
  name: supplier?.name?.trim() || 'Unnamed Supplier',
  phone: supplier?.phone?.trim() || '',
  items: supplier?.items?.trim() || '',
  location: supplier?.location?.trim() || '',
  categories: Array.isArray(supplier?.categories) ? supplier.categories : [],
  source: supplier?.source || 'custom',
});

const buildInitialBusiness = (user) => {
  const storeName = user?.storeName?.trim() || 'My Store';
  const ownerFromEmail = user?.email ? user.email.split('@')[0] : 'Owner';
  return {
    ...BUSINESS,
    name: storeName,
    fullName: storeName,
    owner: ownerFromEmail,
    location: '',
    gst: '',
    phone: '',
    peakHours: [],
  };
};

const buildDefaultState = (user) => {
  if (isSandboxUser(user)) {
    return {
      products: PRODUCTS.map(p => normalizeProduct({
        ...p,
        costPrice: Number.isFinite(p.costPrice) ? p.costPrice : Math.round((p.price || 0) * 0.75),
      })),
      stats: TODAY_STATS,
      recentBills: RECENT_BILLS,
      pendingUPI: PENDING_UPI,
      manualEntries: [],
      suppliers: SUPPLIERS.map(normalizeSupplier),
      business: BUSINESS,
      customers: [],
      billCounter: 248,
    };
  }

  return {
    products: [],
    stats: {
      ...TODAY_STATS,
      grossSales: 0,
      cashSales: 0,
      upiSales: 0,
      creditSales: 0,
      expenses: 0,
      netProfit: 0,
      profitMargin: 0,
      billsToday: 0,
      previousDayProfit: 0,
    },
    recentBills: [],
    pendingUPI: [],
    manualEntries: [],
    suppliers: [],
    business: buildInitialBusiness(user),
    customers: [],
    billCounter: 0,
  };
};

const isLegacySeedState = (parsed) => {
  return (
    parsed?.billCounter === 248 &&
    parsed?.business?.fullName === BUSINESS.fullName &&
    parsed?.recentBills?.length === RECENT_BILLS.length
  );
};

const isUntouchedStarterSeedState = (parsed) => {
  if (!parsed) return false;

  const hasNoActivity =
    (parsed.billCounter ?? 0) === 0 &&
    (parsed.recentBills?.length ?? 0) === 0 &&
    (parsed.manualEntries?.length ?? 0) === 0 &&
    (parsed.customers?.length ?? 0) === 0;

  const looksLikeSeededProducts =
    Array.isArray(parsed.products) &&
    parsed.products.length === PRODUCTS.length &&
    parsed.products.every(p => Number(p.soldToday || 0) === 0);

  return hasNoActivity && looksLikeSeededProducts;
};

export function AppProvider({ children, user }) {
  const storageKey = user ? `flowops_state_${user.uid}` : 'flowops_state';

  // ─── Role (owner / staff) ─────────────────────────────────────────────────
  const [role, setRole] = useState('owner');

  // ─── Language (persisted to localStorage) ────────────────────────────────
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('flowops_lang') || 'mix';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('flowops_lang', lang);
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  };

  // ─── Core State ───────────────────────────────────────────────────────────
  const [state, setState] = useState(() => {
    const defaults = buildDefaultState(user);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);

        if (!isSandboxUser(user) && isLegacySeedState(parsed)) {
          return defaults;
        }

        if (!isSandboxUser(user) && isUntouchedStarterSeedState(parsed)) {
          return defaults;
        }

        // Merge: saved data wins, but defaults fill missing fields
        const mergedState = {
          ...defaults,
          ...parsed,
          business: { ...defaults.business, ...(parsed.business || {}) },
        };

        return {
          ...mergedState,
          products: Array.isArray(mergedState.products)
            ? mergedState.products.map(normalizeProduct)
            : defaults.products,
          manualEntries: Array.isArray(mergedState.manualEntries)
            ? mergedState.manualEntries.map(normalizeManualEntry)
            : defaults.manualEntries,
          suppliers: Array.isArray(mergedState.suppliers)
            ? mergedState.suppliers.map(normalizeSupplier)
            : defaults.suppliers,
        };
      }
    } catch (e) {
      console.warn('Could not load state', e);
    }
    return defaults;
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  // Hydrate from Firestore when a real authenticated user is available.
  useEffect(() => {
    let isCancelled = false;

    const hydrateFromCloud = async () => {
      if (!user?.uid) return;

      const cloudData = await loadStoreDataFromCloud(user.uid);
      if (!cloudData || isCancelled) return;

      setState(prev => ({
        ...prev,
        ...(cloudData.products?.length ? { products: cloudData.products.map(normalizeProduct) } : {}),
        ...(cloudData.customers?.length ? { customers: cloudData.customers } : {}),
        ...(cloudData.suppliers?.length ? { suppliers: cloudData.suppliers.map(normalizeSupplier) } : {}),
        ...(cloudData.recentBills?.length ? { recentBills: cloudData.recentBills } : {}),
        ...(cloudData.manualEntries?.length ? { manualEntries: cloudData.manualEntries.map(normalizeManualEntry) } : {}),
        ...(cloudData.stats ? { stats: { ...prev.stats, ...cloudData.stats } } : {}),
        ...(cloudData.business ? { business: { ...prev.business, ...cloudData.business } } : {}),
        ...(Number.isFinite(cloudData.billCounter) ? { billCounter: cloudData.billCounter } : {}),
      }));
    };

    void hydrateFromCloud();

    return () => {
      isCancelled = true;
    };
  }, [user?.uid]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  // FIX: proper 4th parameter instead of arguments[3]
  const addBill = (billItems, total, paymentMethod, customerId = null, customerName = '') => {
    setState(prev => {
      const computedCogs = billItems.reduce((sum, item) => {
        const product = prev.products.find(p => String(p.id) === String(item.id));
        const costPrice = Number(product?.costPrice);
        const safeCost = Number.isFinite(costPrice) && costPrice >= 0
          ? costPrice
          : Number(item.price || 0) * 0.8;
        return sum + safeCost * Number(item.qty || 0);
      }, 0);
      const billProfit = total - computedCogs;
      const createdAt = new Date().toISOString();

      // 1. Reduce stock + increment soldToday
      const newProducts = prev.products.map(product => {
        const itemInBill = billItems.find(i => i.id === product.id);
        if (itemInBill) {
          return {
            ...product,
            stock: Math.max(0, product.stock - itemInBill.qty),
            soldToday: (product.soldToday || 0) + itemInBill.qty, // FIX: increment soldToday
          };
        }
        return product;
      });

      // 2. Handle Khata — attribute debt to correct customer
      let newCustomers = prev.customers || [];
      if (paymentMethod === 'Khata' && customerId) {
        newCustomers = newCustomers.map(c =>
          c.id === customerId
            ? {
                ...c,
                due: c.due + total,
                transactions: [
                  { type: 'credit', amount: total, date: new Date().toLocaleDateString('en-IN'), note: `Bill #${prev.billCounter + 1}` },
                  ...(c.transactions || []),
                ],
              }
            : c
        );
      }

      // 3. Add bill to history
      const newBill = {
        id: (prev.billCounter + 1).toString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt,
        dateKey: createdAt.split('T')[0],
        items: billItems,
        total,
        cogs: Math.round(computedCogs),
        profit: Math.round(billProfit),
        payment: paymentMethod,
        status: paymentMethod === 'UPI' ? 'pending' : 'done',
        customerName: customerName || '',
        customerId: customerId || null,
      };

      // 4. Update stats
      const nextGrossSales = prev.stats.grossSales + total;
      const nextNetProfit = prev.stats.netProfit + billProfit;
      const newStats = {
        ...prev.stats,
        billsToday: prev.stats.billsToday + 1,
        grossSales: nextGrossSales,
        netProfit: nextNetProfit,
        profitMargin: nextGrossSales > 0 ? Math.round((nextNetProfit / nextGrossSales) * 100) : 0,
      };
      if (paymentMethod === 'UPI') newStats.upiSales = (newStats.upiSales || 0) + total;
      else if (paymentMethod === 'Cash') newStats.cashSales = (newStats.cashSales || 0) + total;
      else if (paymentMethod === 'Khata') newStats.khataSales = (newStats.khataSales || 0) + total;

      const storeId = user?.uid;
      if (storeId) {
        const productsToReduce = newProducts.filter(product =>
          billItems.some(item => item.id === product.id)
        );
        void syncBillToCloud(storeId, newBill, productsToReduce);
        void syncDailyStatsToCloud(storeId, newStats);

        if (paymentMethod === 'Khata' && customerId) {
          const updatedCustomer = newCustomers.find(c => c.id === customerId);
          const latestTransaction = updatedCustomer?.transactions?.[0] || null;
          if (updatedCustomer) {
            void syncKhataCreditToCloud(storeId, customerId, updatedCustomer.due, latestTransaction);
          }
        }
      }

      return {
        ...prev,
        products: newProducts,
        customers: newCustomers,
        recentBills: [newBill, ...prev.recentBills],
        stats: newStats,
        billCounter: prev.billCounter + 1,
      };
    });
  };

  const updateStock = (productId, amountToAdd, purchasePrice = null, supplierId = null) => {
    setState(prev => {
      const parsedPurchasePrice = Number(purchasePrice);
      const nextProducts = prev.products.map(p =>
        p.id === productId
          ? (() => {
              const oldStock = Number(p.stock || 0);
              const nextStock = oldStock + amountToAdd;
              const oldCost = Number.isFinite(Number(p.costPrice)) ? Number(p.costPrice) : 0;

              let nextCostPrice = oldCost;
              if (amountToAdd > 0 && Number.isFinite(parsedPurchasePrice) && parsedPurchasePrice > 0) {
                nextCostPrice = nextStock > 0
                  ? (((oldCost * oldStock) + (parsedPurchasePrice * amountToAdd)) / nextStock)
                  : parsedPurchasePrice;
              }

              return normalizeProduct({
                ...p,
                stock: nextStock,
                costPrice: Number(nextCostPrice.toFixed(2)),
                supplierId: supplierId ?? p.supplierId,
              });
            })()
          : p
      );

      if (user?.uid) {
        const updatedProduct = nextProducts.find(p => p.id === productId);
        if (updatedProduct) {
          void syncStockToCloud(user.uid, productId, updatedProduct.stock, updatedProduct.costPrice, updatedProduct.supplierId);
        }
      }

      return {
        ...prev,
        products: nextProducts,
      };
    });
  };

  const verifyUPI = (billId) => {
    setState(prev => ({
      ...prev,
      recentBills: prev.recentBills.map(b =>
        b.id === billId ? { ...b, status: 'done' } : b
      ),
    }));
  };

  const addManualEntry = (entry) => {
    setState(prev => {
      const newEntry = normalizeManualEntry({
        id: 'M' + Math.floor(Math.random() * 1000),
        ...entry,
      });
      const newStats = { ...prev.stats };
      const affectsToday = newEntry.dateKey === getTodayDateKey();

      if (affectsToday && newEntry.type === 'Sale') {
        newStats.grossSales += newEntry.amount;
        newStats.cashSales += newEntry.amount;
        newStats.netProfit += newEntry.amount * 0.2;
      } else if (affectsToday && newEntry.type === 'Expense') {
        newStats.expenses = (newStats.expenses || 0) + newEntry.amount;
        newStats.netProfit -= newEntry.amount;
      }

      if (user?.uid) {
        void syncManualEntryToCloud(user.uid, newEntry);
        if (affectsToday) {
          void syncDailyStatsToCloud(user.uid, newStats);
        }
      }

      return {
        ...prev,
        manualEntries: [newEntry, ...prev.manualEntries],
        stats: newStats,
      };
    });
  };

  const removeManualEntry = (id) => {
    setState(prev => {
      const entryToRemove = prev.manualEntries.find(e => e.id === id);
      if (!entryToRemove) return prev;
      const newStats = { ...prev.stats };
      const affectsToday = entryToRemove.dateKey === getTodayDateKey();

      if (affectsToday && entryToRemove.type === 'Sale') {
        newStats.grossSales -= entryToRemove.amount;
        newStats.cashSales -= entryToRemove.amount;
        newStats.netProfit -= entryToRemove.amount * 0.2;
      } else if (affectsToday && entryToRemove.type === 'Expense') {
        newStats.expenses -= entryToRemove.amount;
        newStats.netProfit += entryToRemove.amount;
      }

      if (user?.uid) {
        void deleteManualEntryFromCloud(user.uid, entryToRemove.id);
        if (affectsToday) {
          void syncDailyStatsToCloud(user.uid, newStats);
        }
      }

      return {
        ...prev,
        manualEntries: prev.manualEntries.filter(e => e.id !== id),
        stats: newStats,
      };
    });
  };

  const importProducts = (newProducts) => {
    setState(prev => ({
      ...prev,
      products: newProducts.map(normalizeProduct),
    }));
  };

  const addProduct = (product) => {
    const normalizedProduct = normalizeProduct(product);

    setState(prev => ({
      ...prev,
      products: [normalizedProduct, ...prev.products],
    }));

    if (user?.uid) {
      void syncProductToCloud(user.uid, normalizedProduct);
    }
  };

  const addSupplier = (supplier) => {
    const normalizedSupplier = normalizeSupplier({
      id: `S${Date.now()}`,
      ...supplier,
    });

    setState(prev => ({
      ...prev,
      suppliers: [normalizedSupplier, ...prev.suppliers],
    }));

    if (user?.uid) {
      void syncSupplierToCloud(user.uid, normalizedSupplier);
    }

    return normalizedSupplier;
  };

  const addCustomer = (customer) => {
    setState(prev => {
      const newCustomer = { id: Date.now().toString(), due: 0, transactions: [], ...customer };

      if (user?.uid) {
        void syncCustomerToCloud(user.uid, newCustomer);
      }

      return {
        ...prev,
        customers: [
          newCustomer,
          ...(prev.customers || []),
        ],
      };
    });
  };

  const settleKhata = (customerId, amount) => {
    setState(prev => {
      const newStats = {
        ...prev.stats,
        cashSales: (prev.stats.cashSales || 0) + amount,
      };
      const newCustomers = prev.customers.map(c =>
        c.id === customerId
          ? {
              ...c,
              due: Math.max(0, c.due - amount),
              transactions: [
                {
                  type: 'payment',
                  amount,
                  date: new Date().toLocaleDateString('en-IN'),
                  note: 'Payment received',
                },
                ...(c.transactions || []),
              ],
            }
          : c
      );
      const newEntry = {
        id: 'S' + Math.floor(Math.random() * 1000),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        dateKey: new Date().toISOString().split('T')[0],
        description: 'Khata Settlement',
        amount,
        type: 'Sale',
      };

      if (user?.uid) {
        const updatedCustomer = newCustomers.find(c => c.id === customerId);
        const latestTransaction = updatedCustomer?.transactions?.[0] || null;
        if (updatedCustomer) {
          void syncKhataCreditToCloud(user.uid, customerId, updatedCustomer.due, latestTransaction);
        }
        void syncDailyStatsToCloud(user.uid, newStats);
      }

      return {
        ...prev,
        stats: newStats,
        customers: newCustomers,
        manualEntries: [newEntry, ...prev.manualEntries],
      };
    });
  };

  const updateBusiness = (data) => {
    setState(prev => ({
      ...prev,
      business: { ...prev.business, ...data },
    }));

    if (user?.uid) {
      void syncBusinessToCloud(user.uid, { ...state.business, ...data });
    }
  };

  const resetData = () => {
    try {
      localStorage.setItem(LAST_RESET_BACKUP_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Could not store reset backup', err);
    }

    const defaults = buildDefaultState(user);
    const nextState = isSandboxUser(user)
      ? defaults
      : {
          ...defaults,
          business: state.business || defaults.business,
        };

    setState(nextState);
    localStorage.setItem(storageKey, JSON.stringify(nextState));
    localStorage.removeItem('flowops_tour_done');
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addBill,
        updateStock,
        verifyUPI,
        addManualEntry,
        removeManualEntry,
        importProducts,
        addProduct,
        addSupplier,
        addCustomer,
        settleKhata,
        updateBusiness,
        resetData,
        role,
        setRole,
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
