// Mock Data — Sharma Kirana & General Store
export const BUSINESS = {
  name: "Sharma Kirana Store",
  fullName: "Sharma Kirana & General Store",
  location: "Sonipat, Haryana",
  owner: "Rajesh Sharma",
  type: "Kirana",
  gst: "06AAAFH0100R1ZN",
  phone: "+91-98100-12345",
  peakHours: ["10:00 AM–12:00 PM", "6:00 PM–8:00 PM"],
};

export const PRODUCTS = [
  { id: 1, name: "Aata 10kg", category: "Staples", price: 380, stock: 4, unit: "bags", minStock: 10, lastSold: "2 hrs ago", soldToday: 12, supplierId: 1, barcode: "8901030012345" },
  { id: 2, name: "Toor Dal 1kg", category: "Staples", price: 120, stock: 22, unit: "kg", minStock: 10, lastSold: "45 min ago", soldToday: 18, supplierId: 1, barcode: "8901030012346" },
  { id: 3, name: "Sugar 1kg", category: "Staples", price: 45, stock: 31, unit: "kg", minStock: 10, lastSold: "1 hr ago", soldToday: 8, supplierId: 1, barcode: "8901030012347" },
  { id: 4, name: "Mustard Oil 1L", category: "Cooking Oil", price: 140, stock: 2, unit: "bottles", minStock: 8, lastSold: "3 hrs ago", soldToday: 5, supplierId: 1, barcode: "8901030012348" },
  { id: 5, name: "Rice Basmati 5kg", category: "Staples", price: 320, stock: 8, unit: "bags", minStock: 5, lastSold: "4 hrs ago", soldToday: 4, supplierId: 1, barcode: "8901030012349" },
  { id: 6, name: "Parle-G Biscuits (40 pcs)", category: "Snacks", price: 200, stock: 1, unit: "box", minStock: 5, lastSold: "30 min ago", soldToday: 22, supplierId: 2, barcode: "8901030012350" },
  { id: 7, name: "Bisleri 500ml", category: "Beverages", price: 20, stock: 24, unit: "bottles", minStock: 12, lastSold: "15 min ago", soldToday: 45, supplierId: 2, barcode: "8901030012351" },
  { id: 8, name: "Bisleri 1L", category: "Beverages", price: 40, stock: 18, unit: "bottles", minStock: 10, lastSold: "1 hr ago", soldToday: 20, supplierId: 2, barcode: "8901030012352" },
  { id: 9, name: "Surf Excel 1kg", category: "Household", price: 95, stock: 14, unit: "packs", minStock: 6, lastSold: "5 hrs ago", soldToday: 3, supplierId: 1, barcode: "8901030012353" },
  { id: 10, name: "Maggi 12-pack", category: "Snacks", price: 130, stock: 6, unit: "packs", minStock: 5, lastSold: "2 hrs ago", soldToday: 7, supplierId: 2, barcode: "8901030012354" },
];

export const SUPPLIERS = [
  { id: 1, name: "Aggarwal Whole Sellers", phone: "+91-98765-43210", items: "Aata, Dal, Sugar, Oil", location: "Sonipat, Haryana", categories: ["Staples", "Cooking Oil", "Household"], source: "demo" },
  { id: 2, name: "Shakti Beverages", phone: "+91-87654-32109", items: "Bisleri, Drinks, Snacks", location: "Sonipat, Haryana", categories: ["Beverages", "Snacks"], source: "demo" },
];

export const TODAY_STATS = {
  grossSales: 14650,
  cashSales: 8200,
  upiSales: 6450,
  creditSales: 0,
  expenses: 3200,
  netProfit: 2847,
  profitMargin: 19.4,
  profitGoal: 4000,
  billsToday: 34,
  previousDayProfit: 2507,
};

export const RECENT_BILLS = [
  { id: "247", time: "6:48 PM", items: [{ name: "Aata 10kg", qty: 1, price: 380 }, { name: "Toor Dal 1kg", qty: 2, price: 120 }], total: 620, payment: "UPI", status: "done" },
  { id: "246", time: "6:41 PM", items: [{ name: "Bisleri 500ml", qty: 3, price: 20 }, { name: "Parle-G Biscuits (40 pcs)", qty: 1, price: 200 }], total: 260, payment: "Cash", status: "done" },
  { id: "245", time: "6:35 PM", items: [{ name: "Sugar 1kg", qty: 2, price: 45 }, { name: "Mustard Oil 1L", qty: 1, price: 140 }], total: 230, payment: "UPI", status: "done" },
  { id: "244", time: "6:28 PM", items: [{ name: "Maggi 12-pack", qty: 1, price: 130 }], total: 130, payment: "Cash", status: "pending" },
  { id: "243", time: "6:20 PM", items: [{ name: "Rice Basmati 5kg", qty: 1, price: 320 }, { name: "Surf Excel 1kg", qty: 1, price: 95 }], total: 415, payment: "UPI", status: "pending" },
];

export const PENDING_UPI = [
  { id: "U1", amount: 620, time: "6:48 PM", description: "Bill #247 — Aata + Dal", ref: "UPI8374628" },
  { id: "U2", amount: 415, time: "6:20 PM", description: "Bill #243 — Rice + Surf Excel", ref: "UPI9283741" },
];

export const MANUAL_ENTRIES_TODAY = [
  { id: "M1", type: "Sale", amount: 850, description: "Morning chai supplies", time: "9:30 AM" },
  { id: "M2", type: "Expense", amount: 200, description: "Auto fare to market", time: "11:00 AM" },
  { id: "M3", type: "Stock added", amount: 150, description: "Nimbu (2 dozen)", time: "2:00 PM" },
];

export const TOP_SELLERS_TODAY = [
  { rank: 1, name: "Aata 10kg", units: 12, revenue: 4560 },
  { rank: 2, name: "Toor Dal 1kg", units: 18, revenue: 2160 },
  { rank: 3, name: "Bisleri 500ml", units: 45, revenue: 900 },
  { rank: 4, name: "Parle-G Biscuits", units: 22, revenue: 4400 },
  { rank: 5, name: "Maggi 12-pack", units: 7, revenue: 910 },
];

// Quick add items for billing screen (frequently used)
export const QUICK_ITEMS = [1, 2, 3, 4, 7, 6]; // product IDs
