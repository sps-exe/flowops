import { useState } from 'react';
import { ArrowLeft, Search, Filter, Plus, X, MessageCircle, Download } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { hapticFeedback } from '../utils/haptics';
import { exportToCSV } from '../utils/csvUtils';
import { getStockBarPercent, getStockStatus, normalizeProduct } from '../utils/inventory';

function StockBar({ stock, minStock }) {
  const pct = getStockBarPercent(stock, minStock);
  const status = getStockStatus({ stock, minStock });
  const colorClass = status === 'critical' ? 'bg-rose' : status === 'low' ? 'bg-amber' : 'bg-emerald';
  return (
    <div className="w-full bg-surface-100 rounded-full h-1.5 mt-2 overflow-hidden">
      <div
        className={`h-1.5 rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function AddSupplierModal({ onClose, onSave, defaultLocation = '' }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    items: '',
    location: defaultLocation,
  });

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      phone: form.phone.trim(),
      items: form.items.trim(),
      location: form.location.trim(),
    });
  };

  return (
    <div className="absolute inset-0 z-[60] bg-navy/65 backdrop-blur-sm flex items-end">
      <div className="bg-white w-full rounded-t-[32px] px-6 pt-6 pb-10 shadow-2xl animate-slide-in">
        <div className="w-12 h-1.5 bg-surface-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-navy text-[22px] tracking-tight">Add Supplier</h3>
          <button onClick={onClose} className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center active:scale-95 transition-transform text-slate-500 border border-surface-200">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Supplier Name</label>
            <input
              className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
              placeholder="e.g. Gupta Traders"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Phone</label>
            <input
              className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
              placeholder="+91-98..."
              value={form.phone}
              onChange={e => setField('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Items They Supply</label>
            <input
              className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
              placeholder="Aata, rice, oil"
              value={form.items}
              onChange={e => setField('items', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Location</label>
            <input
              className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
              placeholder="City / area"
              value={form.location}
              onChange={e => setField('location', e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-7 bg-navy text-white rounded-[24px] py-4.5 font-black text-[17px] active:scale-[0.98] transition-all shadow-xl shadow-navy/20"
        >
          Save Supplier
        </button>
      </div>
    </div>
  );
}

function AddStockModal({ product, suppliers, businessLocation, onClose, onSave, onAddSupplier }) {
  const [qty, setQty] = useState('');
  const [supplier, setSupplier] = useState(String(product.supplierId || suppliers[0]?.id || ''));
  const [purchasePrice, setPurchasePrice] = useState('');
  const [date] = useState(new Date().toLocaleDateString('en-IN'));
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  const handleSave = () => {
    if (!qty) return;
    onSave({ productId: product.id, qty: parseInt(qty), supplier: supplier || null, purchasePrice: parseFloat(purchasePrice) || 0 });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-end">
      {showAddSupplierModal && (
        <AddSupplierModal
          defaultLocation={businessLocation}
          onClose={() => setShowAddSupplierModal(false)}
          onSave={(supplierData) => {
            const newSupplier = onAddSupplier(supplierData);
            setSupplier(String(newSupplier.id));
            setShowAddSupplierModal(false);
          }}
        />
      )}
      <div className="bg-white w-full rounded-t-[32px] px-6 pt-6 pb-10 shadow-2xl animate-slide-in">
        <div className="w-12 h-1.5 bg-surface-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-navy text-[22px] tracking-tight">Add Stock</h3>
          <button onClick={onClose} className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center active:scale-95 transition-transform text-slate-500 border border-surface-200">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="bg-surface-50 rounded-[24px] p-4 mb-6 border border-surface-200">
          <p className="text-navy font-bold text-[17px] mb-1">{product.name}</p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium bg-white px-2.5 py-1 rounded-[8px] shadow-sm border border-surface-200">{product.category}</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Current: {product.stock} {product.unit}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Quantity Added</label>
            <input
              type="number"
              className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-black text-xl focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
              placeholder={`Enter ${product.unit}`}
              value={qty}
              onChange={e => setQty(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Purchase Price / unit (₹)</label>
            <input
              type="number"
              className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
              placeholder="Leave blank if unknown"
              value={purchasePrice}
              onChange={e => setPurchasePrice(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Supplier</label>
            <select
              className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all appearance-none"
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}{s.location ? ` • ${s.location}` : ''}</option>
              ))}
            </select>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-[11px] text-slate-400 font-semibold">
                {businessLocation ? `Base area: ${businessLocation}` : 'Save your real wholesalers here'}
              </p>
              <button
                type="button"
                onClick={() => setShowAddSupplierModal(true)}
                className="text-[12px] font-black text-navy"
              >
                + Add Supplier
              </button>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Date of Purchase</label>
            <input
              className="w-full mt-1.5 bg-surface-50 border border-surface-200 rounded-[24px] px-5 py-4 text-slate-500 font-medium focus:outline-none"
              value={date}
              readOnly
            />
          </div>
        </div>

        <p className="text-slate-400 text-[13px] font-medium mt-6 mb-6 text-center">This will sync with your billing records</p>

        <button
          onClick={handleSave}
          className="w-full bg-navy text-white rounded-[24px] py-4.5 font-black text-[17px] active:scale-[0.98] transition-all shadow-xl shadow-navy/20"
        >
          Save & Update Stock
        </button>
      </div>
    </div>
  );
}

function AddItemModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    category: 'General',
    costPrice: '',
    price: '',
    stock: '',
    unit: 'pcs',
    minStock: '5',
  });

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (!form.price || Number(form.price) < 0) return;

    onSave({
      name: form.name.trim(),
      category: form.category.trim() || 'General',
      costPrice: Number(form.costPrice || 0),
      price: Number(form.price),
      stock: Number(form.stock || 0),
      unit: form.unit.trim() || 'pcs',
      minStock: Math.max(0, Number(form.minStock || 0)),
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-end">
      <div className="bg-white w-full rounded-t-[32px] px-6 pt-6 pb-10 shadow-2xl animate-slide-in">
        <div className="w-12 h-1.5 bg-surface-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-navy text-[22px] tracking-tight">Create Inventory Item</h3>
          <button onClick={onClose} className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center active:scale-95 transition-transform text-slate-500 border border-surface-200">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Item Name</label>
            <input
              className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
              placeholder="e.g. Chana Dal 1kg"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Category</label>
              <input
                className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
                placeholder="Staples"
                value={form.category}
                onChange={e => setField('category', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Unit</label>
              <input
                className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
                placeholder="pcs / kg / box"
                value={form.unit}
                onChange={e => setField('unit', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Buying Price (₹)</label>
              <input
                type="number"
                min="0"
                className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-4 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
                placeholder="0"
                value={form.costPrice}
                onChange={e => setField('costPrice', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Selling Price (₹)</label>
              <input
                type="number"
                min="0"
                className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-4 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
                placeholder="0"
                value={form.price}
                onChange={e => setField('price', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Stock</label>
              <input
                type="number"
                min="0"
                className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-4 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
                placeholder="0"
                value={form.stock}
                onChange={e => setField('stock', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Min Stock</label>
              <input
                type="number"
                min="0"
                className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-4 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
                placeholder="5"
                value={form.minStock}
                onChange={e => setField('minStock', e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-7 bg-navy text-white rounded-[24px] py-4.5 font-black text-[17px] active:scale-[0.98] transition-all shadow-xl shadow-navy/20"
        >
          Save Item
        </button>
      </div>
    </div>
  );
}

export default function InventoryScreen({ onBack, initialFilter }) {
  const { state, updateStock, addProduct, addSupplier } = useAppContext();
  const { products, suppliers = [], business } = state;
  const [filter, setFilter] = useState(initialFilter || 'all');
  const [search, setSearch] = useState('');
  const [addStockModal, setAddStockModal] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [shakingId, setShakingId] = useState(null);

  const handleExport = () => {
    hapticFeedback.light();
    exportToCSV(products, 'flowops_inventory.csv');
  };

  const handleCreateItem = (itemData) => {
    const maxNumericId = products.reduce((max, p) => {
      const n = Number(p.id);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);

    const newItem = normalizeProduct({
      id: maxNumericId + 1,
      name: itemData.name,
      category: itemData.category,
      costPrice: itemData.costPrice,
      price: itemData.price,
      stock: itemData.stock,
      unit: itemData.unit,
      minStock: itemData.minStock,
      lastSold: '-',
      soldToday: 0,
      supplierId: suppliers[0]?.id || null,
      barcode: String(Date.now()),
    });

    addProduct(newItem);
    hapticFeedback.success();
  };

  const filtered = products.filter(p => {
    const matchSearch = search.length < 2 || p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all'
      ? true
      : filter === 'low'
      ? getStockStatus(p) !== 'ok'
      : filter === 'fast'
      ? p.soldToday >= 10
      : p.soldToday < 5;
    return matchSearch && matchFilter;
  });

  const lowCount = products.filter(p => getStockStatus(p) !== 'ok').length;
  const outCount = products.filter(p => p.stock === 0).length;

  const handleAddStock = ({ productId, qty, purchasePrice, supplier }) => {
    hapticFeedback.success();
    updateStock(productId, qty, purchasePrice, supplier);
    setShakingId(productId);
    setTimeout(() => setShakingId(null), 500);
  };

  const handleWhatsAppReorder = (supplier, item) => {
    const msg = `Namaste! Mujhe ${item.name} ki stock chahiye — ${item.stock <= 2 ? 'urgent' : ''}. Please confirm availability. — Rajesh Sharma, Sharma Kirana Store, Sonipat`;
    alert(`WhatsApp to ${supplier.name} (+${supplier.phone}):\n\n"${msg}"`);
  };

  return (
    <div className="flex flex-col h-full bg-surface-50 screen-enter">
      {addStockModal && (
        <AddStockModal
          product={products.find(p => p.id === addStockModal)}
          suppliers={suppliers}
          businessLocation={business?.location || ''}
          onClose={() => setAddStockModal(null)}
          onSave={handleAddStock}
          onAddSupplier={addSupplier}
        />
      )}
      {showAddItemModal && (
        <AddItemModal
          onClose={() => setShowAddItemModal(false)}
          onSave={handleCreateItem}
        />
      )}

      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border-b border-surface-200 relative z-10 rounded-b-[32px]">
        <div className="flex items-center gap-3 mb-6 mt-2">
          <button onClick={onBack} className="w-10 h-10 bg-surface-50 border border-surface-200 rounded-[16px] flex items-center justify-center active:scale-95 transition-transform text-navy shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-navy font-black text-[24px] flex-1 tracking-tight">Stock & Inventory</h1>
          
          <button onClick={() => setShowAddItemModal(true)} className="w-10 h-10 bg-surface-50 border border-surface-200 rounded-[16px] flex items-center justify-center text-navy active:scale-95 transition-transform shadow-sm">
            <Plus size={18} strokeWidth={2.5} />
          </button>
          <button onClick={handleExport} className="w-10 h-10 bg-navy rounded-[16px] flex items-center justify-center text-white active:scale-95 transition-transform shadow-md shadow-navy/20">
            <Download size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Summary Row */}
        <div className="flex gap-2.5 mb-5">
          {[
            { label: 'Total Items', value: products.length, color: 'text-navy', bg: 'bg-surface-50 border border-surface-200' },
            { label: 'Low Stock', value: lowCount, color: 'text-amber', bg: 'bg-amber/10 border border-amber/20' },
            { label: 'Out of Stock', value: outCount, color: 'text-rose', bg: 'bg-rose/10 border border-rose/20' },
          ].map(s => (
            <div key={s.label} className={`flex-1 rounded-[24px] p-4 text-center ${s.bg}`}>
              <p className={`font-black text-[24px] tracking-tight ${s.color}`}>{s.value}</p>
              <p className={`text-[11px] font-black uppercase tracking-wider mt-1 ${s.color} opacity-80`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full bg-white border border-surface-200 rounded-[24px] pl-11 pr-4 py-4 text-[15px] font-medium text-navy focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all placeholder:text-slate-400"
            placeholder="Search inventory..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2.5 overflow-x-auto scroll-hidden pb-1 -mx-2 px-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'low', label: `Low Stock 🔴 (${lowCount})` },
            { id: 'fast', label: 'Fast Moving ⚡' },
            { id: 'slow', label: 'Slow Moving 🐢' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-[16px] text-[14px] font-bold transition-all active:scale-95 ${
                filter === f.id
                  ? 'bg-navy text-white shadow-md shadow-navy/20 border border-navy'
                  : 'bg-white text-slate-500 shadow-sm border border-surface-200 hover:bg-surface-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto scroll-hidden px-5 py-4 space-y-3 pb-24">
        {products.length === 0 && (
          <div className="bg-white border border-surface-200 rounded-[24px] p-5 shadow-sm">
            <p className="text-navy font-black text-[18px] tracking-tight mb-1">Let&apos;s set up your inventory</p>
            <p className="text-slate-500 text-[14px] font-medium leading-relaxed mb-4">
              Start by adding items so billing and quick items can work properly.
            </p>
            <div className="space-y-2 mb-4 text-[13px] text-slate-600 font-medium">
              <p>1. Create your first inventory item</p>
              <p>2. Update stock using Add Stock</p>
              <p>3. Start billing from Bills tab</p>
            </div>
            <button
              onClick={() => setShowAddItemModal(true)}
              className="w-full bg-navy text-white rounded-[16px] py-3 font-bold text-[14px] active:scale-[0.98] transition-transform shadow-md shadow-navy/20"
            >
              Create First Item
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-5xl mb-3">📦</p>
            <p className="font-semibold text-lg text-slate-500">{products.length === 0 ? 'No inventory items yet' : 'No items found'}</p>
          </div>
        )}

        {filtered.map(product => {
          const status = getStockStatus(product);
          const supplier = suppliers.find(s => String(s.id) === String(product.supplierId));
          const statusColorClass = status === 'critical' ? 'text-rose' : status === 'low' ? 'text-amber' : 'text-emerald';
          const statusBgClass = status === 'critical' ? 'bg-rose/10 text-rose' : status === 'low' ? 'bg-amber/10 text-amber' : 'bg-emerald/10 text-emerald';

          return (
            <div
              key={product.id}
              className={`bg-white rounded-[24px] p-5 shadow-sm border border-surface-200 relative overflow-hidden ${shakingId === product.id ? 'shake' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-navy text-[17px] truncate tracking-tight">{product.name}</p>
                    {status !== 'ok' && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${statusBgClass}`}>
                        {status === 'critical' ? '🔴 Critical' : '🟡 Low'}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[13px] font-medium mb-3">{product.category} • Last sold: {product.lastSold}</p>

                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className={`font-black text-3xl tracking-tight ${statusColorClass}`}>
                      {product.stock}
                    </span>
                    <span className="text-slate-500 text-[13px] font-semibold">{product.unit} remaining</span>
                  </div>
                  <StockBar stock={product.stock} minStock={product.minStock} />

                  {status !== 'ok' && supplier && (
                    <button
                      onClick={() => handleWhatsAppReorder(supplier, product)}
                      className="mt-4 flex items-center gap-1.5 text-[13px] font-bold text-emerald border border-emerald/20 bg-emerald/5 rounded-[16px] px-3 py-2.5 active:scale-95 transition-transform"
                    >
                      <MessageCircle size={14} strokeWidth={2.5} />
                      WhatsApp {supplier.name.split(' ')[0]}
                    </button>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 justify-between h-full pt-1">
                  <div className="text-right">
                     <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">Sold today</p>
                     <p className="text-navy font-black text-2xl tracking-tight">{product.soldToday}</p>
                  </div>
                  <button
                    onClick={() => setAddStockModal(product.id)}
                    className="flex items-center gap-1.5 bg-navy text-white text-[13px] px-4 py-2.5 rounded-[16px] font-bold active:scale-[0.96] transition-transform shadow-md shadow-navy/20 mt-4"
                  >
                    <Plus size={14} strokeWidth={3} />
                    Add Stock
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
