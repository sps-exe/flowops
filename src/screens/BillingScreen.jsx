import { useState, useRef } from 'react';
import { Search, Plus, Minus, X, Check, Zap, Trash2, UserPlus, ChevronRight } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { QUICK_ITEMS } from '../data/mockData';
import { hapticFeedback } from '../utils/haptics';
import useBarcodeScanner from '../hooks/useBarcodeScanner';
import useBluetoothPrinter from '../hooks/useBluetoothPrinter';

// ─── Staff Mode Unlock Modal ───────────────────────────────────────────────
function PinModal({ onClose, onUnlock }) {
  const [pin, setPin] = useState('');
  const CORRECT_PIN = '1234';

  const handleDigit = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      hapticFeedback.light();
      if (next === CORRECT_PIN) {
        hapticFeedback.success();
        onUnlock();
      } else {
        hapticFeedback.heavy();
        setTimeout(() => setPin(''), 500);
      }
    }
  };

  const buttons = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="absolute inset-0 z-50 bg-navy/80 backdrop-blur-md flex items-center justify-center p-5">
      <div className="w-full max-w-[340px] rounded-[30px] bg-[#102B4B] border border-white/15 shadow-2xl p-6">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-5 border border-white/20 mx-auto">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-white font-black text-2xl mb-1 tracking-tight text-center">Owner PIN</h2>
        <p className="text-blue-100 text-[14px] mb-7 font-semibold text-center">Enter PIN to unlock owner access</p>

        <div className="flex justify-center gap-3 mb-8">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-3.5 h-3.5 rounded-full transition-all ${pin.length > i ? 'bg-amber scale-110 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'bg-white/35'}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full">
          {buttons.map((b, i) => (
            b === '' ? <div key={i} /> :
            b === '⌫' ? (
              <button key={i} onClick={() => setPin(p => p.slice(0,-1))} className="h-14 rounded-[18px] bg-white text-navy text-xl font-black hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-black/10 ring-1 ring-white/30">
                ⌫
              </button>
            ) : (
              <button key={i} onClick={() => handleDigit(b)} className="h-14 rounded-[18px] bg-white text-navy text-[26px] font-black hover:bg-slate-100 active:scale-95 transition-all shadow-lg shadow-black/10 ring-1 ring-white/30">
                {b}
              </button>
            )
          ))}
        </div>

        <button onClick={onClose} className="mt-6 w-full h-11 rounded-[14px] bg-white/15 text-white hover:bg-white/25 text-[15px] font-black transition-colors border border-white/20 shadow-lg shadow-black/10">Cancel</button>
      </div>
    </div>
  );
}

// ─── Clear Cart Confirm ────────────────────────────────────────────────────
function ClearCartConfirm({ onConfirm, onClose, t }) {
  return (
    <div className="absolute inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-end">
      <div className="bg-white w-full rounded-t-[32px] p-6 pb-10 animate-slide-in shadow-2xl">
        <div className="w-12 h-1.5 bg-surface-200 rounded-full mx-auto mb-6" />
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose/10 text-rose rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} strokeWidth={2.5} />
          </div>
          <h3 className="font-black text-navy text-[22px] tracking-tight">Clear all items?</h3>
          <p className="text-slate-500 text-[15px] mt-2 font-medium">Bill se saara saamaan hat jaayega</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-surface-100 rounded-[24px] py-4 text-navy font-bold text-[16px] active:scale-95 transition-transform">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-rose rounded-[24px] py-4 text-white font-black text-[16px] active:scale-95 transition-transform shadow-lg shadow-rose/20">
            Clear Bill
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main BillingScreen ────────────────────────────────────────────────────
export default function BillingScreen({ onNavigate, onRushMode, showToast }) {
  const { state, addBill, addCustomer, t, role, setRole } = useAppContext();
  const { products, customers, business } = state;

  // Bill state
  const [customer, setCustomer] = useState('');
  const [showCustomerInput, setShowCustomerInput] = useState(false);
  const [paymentType, setPaymentType] = useState('UPI');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  // FIX: capture the bill number at generation time — billNumber increments after addBill()
  const [generatedBillNum, setGeneratedBillNum] = useState(null);

  const { isConnected, isConnecting, connect, printReceipt } = useBluetoothPrinter();

  // Derive bill number safely
  const validCounter = Number.isFinite(state.billCounter) ? state.billCounter : 248;
  const billNumber = validCounter + 1;

  // ─── Guided Tour ─────────────────────────────────────────────────────────
  const [tourStep, setTourStep] = useState(
    localStorage.getItem('flowops_tour_done') ? -1 : 0
  );
  const nextTourStep = () => {
    if (tourStep >= 2) {
      localStorage.setItem('flowops_tour_done', 'true');
      setTourStep(-1);
    } else {
      setTourStep(prev => prev + 1);
    }
  };

  // ─── Barcode Scanner ─────────────────────────────────────────────────────
  useBarcodeScanner((barcode) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      hapticFeedback.success();
    } else {
      hapticFeedback.medium();
    }
  });

  // ─── Product Lists ────────────────────────────────────────────────────────
  const quickItems = QUICK_ITEMS.map(id => products.find(p => p.id === id)).filter(Boolean);
  const filteredProducts = searchQuery.length > 1
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // Customer suggestions from khata
  const customerSuggestions = customer.length > 0
    ? customers.filter(c => c.name.toLowerCase().includes(customer.toLowerCase())).slice(0, 4)
    : [];

  // ─── Cart Operations ──────────────────────────────────────────────────────
  const addToCart = (product) => {
    hapticFeedback.light();
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setSearchQuery('');
  };

  const updateQty = (id, delta) => {
    hapticFeedback.light();
    setCartItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
          .filter(i => i.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    hapticFeedback.medium();
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    hapticFeedback.medium();
    setCartItems([]);
    setShowClearConfirm(false);
  };

  // ─── Totals ───────────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const gst = gstEnabled ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + gst;

  // ─── Payment auto-expand customer ─────────────────────────────────────────
  const handlePaymentType = (type) => {
    setPaymentType(type);
    if (type === 'Khata') setShowCustomerInput(true);
  };

  // ─── Generate Bill ────────────────────────────────────────────────────────
  const handleGenerateBill = () => {
    if (cartItems.length === 0) return;

    let customerIdToPass = null;
    if (paymentType === 'Khata') {
      if (!customer.trim()) {
        if (showToast) showToast('Customer naam daalo Khata ke liye');
        setShowCustomerInput(true);
        return;
      }
      const existing = customers?.find(c => c.name.toLowerCase() === customer.toLowerCase());
      if (existing) {
        customerIdToPass = existing.id;
      } else {
        customerIdToPass = Date.now().toString();
        addCustomer({ id: customerIdToPass, name: customer.trim(), phone: '', due: 0 });
      }
    }

    hapticFeedback.success();
    // FIX: save current bill number BEFORE addBill increments state.billCounter
    setGeneratedBillNum(billNumber);
    addBill(cartItems, total, paymentType, customerIdToPass, customer.trim());
    setBillGenerated(true);
  };

  // ─── Print ────────────────────────────────────────────────────────────────
  const handlePrint = async () => {
    try {
      if (!isConnected) await connect();
      await printReceipt({ id: billNumber, total, paymentType, cartItems });
      hapticFeedback.success();
      if (showToast) showToast('Printing receipt...');
    } catch (err) {
      hapticFeedback.heavy();
      if (showToast) showToast('Printer connection failed');
    }
  };

  // ─── WhatsApp Share ───────────────────────────────────────────────────────
  const shareToWhatsApp = () => {
    hapticFeedback.light();
    const storeName = business?.fullName || business?.name || 'My Store';
    // FIX: use captured bill number, not the live counter (which already incremented)
    const displayBillNum = generatedBillNum || billNumber;
    let text = `*${storeName}*\n`;
    text += `Bill No: #${displayBillNum}\n`;
    text += `Date: ${new Date().toLocaleString('en-IN')}\n\n`;
    cartItems.forEach(item => {
      text += `• ${item.name} ×${item.qty} — ₹${item.price * item.qty}\n`;
    });
    text += `\n*TOTAL: ₹${total.toLocaleString('en-IN')}*\n`;
    text += paymentType === 'Khata' ? `Khata mein darz kiya\n` : `Paid via: ${paymentType}\n`;
    text += `\nShukria! 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ─── Reset for new bill ───────────────────────────────────────────────────
  const startNewBill = () => {
    setBillGenerated(false);
    setCartItems([]);
    setCustomer('');
    setShowCustomerInput(false);
    setPaymentType('UPI');
    setGstEnabled(false);
    setGeneratedBillNum(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // BILL SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (billGenerated) {
    return (
      <div className="flex flex-col h-full bg-surface-50 screen-enter items-center justify-center p-6 text-center">
        <div className="success-anim w-24 h-24 bg-emerald rounded-full flex items-center justify-center mb-6 shadow-[0_0_0_8px_rgba(16,185,129,0.1)]">
          <Check size={48} className="text-white" strokeWidth={3} />
        </div>
        <h2 className="text-navy font-black text-[28px] mb-1 tracking-tight">{t('pos.bill_created')} #{generatedBillNum || billNumber}</h2>
        <p className="text-slate-500 text-[15px] mb-2 font-medium">{new Date().toLocaleString('en-IN')}</p>
        <p className="text-emerald font-black text-[42px] mb-8 tracking-tighter">₹{total.toLocaleString('en-IN')}</p>

        <div className="w-full bg-white rounded-[32px] p-6 mb-5 shadow-sm border border-surface-200">
          <div className="mb-4 pb-4 border-b border-dashed border-surface-200 text-left">
            <h3 className="font-black text-navy text-lg">{business?.fullName || business?.name || 'My Store'}</h3>
            {customer && (
              <p className="text-slate-500 text-sm mt-1 font-medium">Customer: <span className="text-navy">{customer}</span></p>
            )}
          </div>
          <div className="space-y-3">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center text-[15px]">
                <span className="text-slate-600 font-medium">{item.name} <span className="text-slate-400">×{item.qty}</span></span>
                <span className="font-bold text-navy">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
            {gstEnabled && (
              <div className="flex justify-between items-center text-[15px] pt-1">
                <span className="text-slate-500 font-medium">GST (5%)</span>
                <span className="font-bold text-slate-500">₹{gst}</span>
              </div>
            )}
            <div className="border-t border-dashed border-surface-200 pt-4 mt-2 flex justify-between items-center">
              <span className="text-slate-500 font-bold">{t('pos.total')}</span>
              <span className="font-black text-navy text-xl tracking-tight">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-emerald/10 rounded-[24px] px-5 py-4 mb-6 flex items-center justify-center gap-2">
          <Check size={18} className="text-emerald" strokeWidth={3} />
          <span className="text-emerald font-bold text-[15px]">{t('pos.stock_updated')}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full mb-3">
          <button
            onClick={shareToWhatsApp}
            className="flex-1 bg-white border border-surface-200 rounded-[24px] py-4 text-navy font-bold text-[15px] active:scale-95 transition-transform shadow-sm"
          >
            📱 WhatsApp
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-white border border-surface-200 rounded-[24px] py-4 text-navy font-bold text-[15px] active:scale-95 transition-transform shadow-sm flex items-center justify-center gap-2"
          >
            {isConnecting ? '⏳ Connect...' : isConnected ? '🖨️ Print' : '🔗 Printer'}
          </button>
        </div>

        <button
          onClick={startNewBill}
          className="w-full bg-navy rounded-[24px] py-4.5 flex items-center justify-center gap-2 text-white font-black text-[17px] active:scale-[0.98] transition-all shadow-xl shadow-navy/20 mt-1"
        >
          <Plus size={20} strokeWidth={3} /> {t('pos.new_bill_btn')}
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN POS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-surface-50 screen-enter relative">

      {/* Modals */}
      {showClearConfirm && (
        <ClearCartConfirm
          onConfirm={clearCart}
          onClose={() => setShowClearConfirm(false)}
          t={t}
        />
      )}
      {showPinModal && (
        <PinModal
          onClose={() => setShowPinModal(false)}
          onUnlock={() => { setRole('owner'); setShowPinModal(false); if(showToast) showToast('Owner mode unlocked ✓'); }}
        />
      )}

      {/* Staff Mode Banner */}
      {role === 'staff' && (
        <button
          onClick={() => setShowPinModal(true)}
          className="w-full bg-rose text-white text-xs font-bold py-2 text-center active:opacity-80 transition-opacity"
          style={{ paddingTop: '10px' }}
        >
          {t('pos.staff_mode_banner')}
        </button>
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className={`bg-white px-5 pb-5 rounded-b-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border-b border-surface-200 relative z-20 ${role === 'staff' ? 'pt-2' : 'pt-10'}`}>

        {/* Greeting row */}
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest">
              {(() => {
                const h = new Date().getHours();
                return h < 12 ? '🌤 Good Morning' : h < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';
              })()}
            </p>
            <h1 className="text-navy font-black text-[22px] tracking-tight leading-tight truncate">
              {business?.fullName || business?.name || 'My Store'}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onRushMode}
              className="flex items-center gap-1.5 bg-amber/10 rounded-[16px] px-3 py-2.5 active:scale-95 transition-transform border border-amber/20"
            >
              <Zap size={14} className="text-amber" fill="currentColor" />
              <span className="text-amber font-bold text-[12px]">Rush</span>
            </button>
            <div className="bg-surface-100 rounded-[16px] px-3 py-2.5 border border-surface-200">
              <span className="text-navy font-bold text-[13px] tracking-wide">#{billNumber}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-surface-100 my-4" />

        {/* Customer input — collapsed by default, auto-expands for Khata */}
        {showCustomerInput ? (
          <div className="mb-4 relative">
            <input
              autoFocus
              className="w-full bg-white border border-slate-200/80 rounded-[20px] px-5 py-4 text-[15px] text-navy placeholder-slate-400 font-bold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all"
              placeholder={t('pos.customer_placeholder')}
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customer.trim()) {
                  setShowCustomerInput(false);
                }
              }}
            />
            {/* Autocomplete suggestions */}
            {customerSuggestions.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-30 bg-white border border-surface-200 rounded-[24px] shadow-xl overflow-hidden p-2 space-y-1">
                {customerSuggestions.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCustomer(c.name);
                      setShowCustomerInput(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-[16px] text-left hover:bg-surface-50 active:bg-surface-100 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-navy text-[15px]">{c.name}</p>
                      {c.phone && <p className="text-slate-500 text-[13px] mt-0.5">{c.phone}</p>}
                    </div>
                    {c.due > 0 && (
                      <span className="text-rose font-bold text-[13px] bg-rose/10 px-2 py-1 rounded-[8px]">₹{c.due} due</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-20">
              {customer.trim() && (
                <button
                  onClick={() => setShowCustomerInput(false)}
                  className="w-8 h-8 flex items-center justify-center bg-navy text-white rounded-full hover:bg-navy/90 active:scale-95 transition-all shadow-sm"
                >
                  <Check size={16} strokeWidth={3} />
                </button>
              )}
              {paymentType !== 'Khata' && (
                <button
                  onClick={() => { setShowCustomerInput(false); setCustomer(''); }}
                  className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomerInput(true)}
            className="w-full group flex items-center justify-between bg-white border border-slate-100 rounded-[20px] px-4 py-3.5 mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-navy/5 group-hover:text-navy transition-colors">
                <UserPlus size={18} strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-[15px] text-slate-500 group-hover:text-navy transition-colors">
                {customer ? <span className="text-navy font-black text-[16px]">{customer}</span> : t('pos.customer_optional')}
              </span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>
        )}

        {/* Payment tabs */}
        <div className="bg-slate-50/50 p-1.5 rounded-[22px] border border-slate-100/60 shadow-inner">
          <div className="flex gap-1.5">
            {[
              { id: 'UPI', icon: '📱' },
              { id: 'Cash', icon: '💵' },
              { id: 'Khata', icon: '📘' },
              { id: 'Card', icon: '💳' }
            ].map(type => {
              const labelStr = type.id;
              const isActive = paymentType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => handlePaymentType(type.id)}
                  className={`flex-1 py-3 text-[14px] font-bold rounded-[18px] transition-all flex flex-col items-center justify-center gap-1 ${
                    isActive
                      ? 'bg-white text-navy shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-slate-900/5 scale-[1.02]'
                      : 'text-slate-500 hover:text-navy hover:bg-white/60 active:scale-[0.98]'
                  }`}
                >
                  <span className="text-[18px] mb-0.5 drop-shadow-sm">{type.icon}</span>
                  <span className="tracking-tight">{labelStr}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Scrollable Body ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scroll-hidden px-5 py-4 space-y-4">

        {/* Search bar */}
        <div className={`relative ${tourStep === 0 ? 'z-50 ring-4 ring-amber rounded-[24px] bg-white' : ''}`}>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full bg-white rounded-[24px] pl-12 pr-5 py-4 text-[15px] text-navy font-medium placeholder-slate-400 focus:outline-none shadow-sm border border-surface-200 focus:border-navy/30 focus:ring-4 focus:ring-navy/5 transition-all"
            placeholder={t('pos.search_placeholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Search results dropdown */}
        {filteredProducts.length > 0 && (
          <div className="bg-white rounded-[24px] shadow-lg border border-surface-200 overflow-hidden mt-3 p-2 space-y-1 z-10 relative">
            {filteredProducts.slice(0, 6).map((p, i) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-[16px] hover:bg-surface-50 active:bg-surface-100 transition-colors"
              >
                <div className="text-left">
                  <p className="font-bold text-navy text-[15px]">{p.name}</p>
                  <p className="text-slate-500 text-[13px] mt-0.5">{p.category} • Stock: {p.stock} {p.unit}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-navy font-black text-[17px]">₹{p.price}</span>
                  <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center text-navy shadow-sm">
                    <Plus size={16} strokeWidth={2.5} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Quick Items — horizontal scrolling chips */}
        {searchQuery.length === 0 && (
          <div className={tourStep === 1 ? 'z-50 relative bg-white p-2 rounded-[24px] ring-4 ring-amber' : ''}>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest pl-1 mb-3">{t('pos.quick_items')}</p>
            {quickItems.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto scroll-hidden pb-3 pl-1 pr-4">
                {quickItems.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex-shrink-0 bg-white border border-surface-200 shadow-sm rounded-[24px] p-4 flex flex-col items-start active:scale-[0.98] transition-all min-w-[130px] active:border-navy/30"
                  >
                    <p className="font-bold text-navy text-[15px] leading-tight text-left line-clamp-2">{p.name}</p>
                    <p className="text-slate-400 text-[12px] mt-1 font-medium">{p.stock} {p.unit}</p>
                    <div className="w-full flex items-end justify-between mt-4">
                      <p className="text-emerald font-black text-lg tracking-tight">₹{p.price}</p>
                      <div className="w-7 h-7 bg-surface-100 flex items-center justify-center rounded-full text-navy"><Plus size={14} strokeWidth={3}/></div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-surface-200 rounded-[20px] p-4 mb-2">
                <p className="text-navy font-bold text-[14px] mb-1">Inventory is empty</p>
                <p className="text-slate-500 text-[13px] font-medium mb-3">Add your items in Inventory first to unlock Frequently Used products.</p>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="bg-navy text-white text-[13px] font-bold px-4 py-2.5 rounded-[14px] active:scale-[0.98] transition-transform"
                >
                  Go to Inventory
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {cartItems.length === 0 && searchQuery.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 opacity-60">
            <div className="w-20 h-20 bg-white border border-surface-200 rounded-full flex items-center justify-center mb-5 shadow-sm">
              <span className="text-4xl" style={{ filter: 'grayscale(0.5)' }}>🛒</span>
            </div>
            <p className="font-black text-[17px] text-slate-600 tracking-tight">Cart is empty</p>
            <p className="text-[14px] text-center mt-1 text-slate-400 font-medium">
              {products.length === 0 ? 'Add inventory items first, then start billing.' : 'Search above or tap Quick Items'}
            </p>
          </div>
        )}

        {/* Cart items */}
        {cartItems.length > 0 && (
          <div className="mt-2 pb-6">
            <div className="flex items-center justify-between mb-3 pl-1">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                {t('pos.cart')} ({cartItems.length})
              </p>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 text-rose text-[13px] font-bold bg-rose/10 hover:bg-rose/20 rounded-[12px] px-3 py-1.5 active:scale-95 transition-all"
              >
                <Trash2 size={14} strokeWidth={2.5} />
                {t('pos.clear_cart')}
              </button>
            </div>

            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white rounded-[24px] p-4 flex items-center gap-4 shadow-sm border border-surface-200">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy text-[16px] truncate leading-tight">{item.name}</p>
                    <p className="text-slate-500 text-[13px] mt-1 font-medium bg-surface-50 border border-surface-200 rounded-lg inline-block px-2 py-0.5">₹{item.price}</p>
                  </div>
                  <div className="flex flex-col items-end min-w-[70px]">
                    <span className="font-black text-navy text-[18px] tracking-tight">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface-50 rounded-full p-1 border border-surface-200">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform bg-white shadow-sm text-slate-600"
                    >
                      <Minus size={16} strokeWidth={3} />
                    </button>
                    <span className="font-black text-navy text-[15px] w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-8 h-8 bg-navy rounded-full flex items-center justify-center active:scale-90 transition-transform text-white shadow-[0_2px_8px_rgba(26,35,126,0.25)]"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky Bill Footer ──────────────────────────────── */}
      <div className="bg-white px-5 pt-4 pb-4 shadow-[0_-12px_40px_rgba(0,0,0,0.06)] rounded-t-[32px] relative z-20 border-t border-surface-200">
        {cartItems.length > 0 && (
          <div className="space-y-2.5 mb-4 px-1">
            <div className="flex justify-between items-center text-[15px]">
              <span className="text-slate-500 font-medium">Subtotal <span className="bg-surface-100 text-navy text-[11px] font-black px-2 py-0.5 rounded-full ml-1">{cartItems.reduce((s, i) => s + i.qty, 0)} items</span></span>
              <span className="font-bold text-navy">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-[15px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">GST (5%)</span>
                <button
                  onClick={() => setGstEnabled(v => !v)}
                  className={`w-[44px] h-[24px] rounded-full transition-colors flex items-center px-0.5 ${gstEnabled ? 'bg-emerald' : 'bg-surface-200'}`}
                >
                  <div className={`w-[20px] h-[20px] bg-white rounded-full shadow-sm transition-transform ${gstEnabled ? 'translate-x-[20px]' : ''}`} />
                </button>
              </div>
              <span className="text-slate-500 font-medium tracking-wide">₹{gst}</span>
            </div>
            <div className="flex justify-between items-center font-black text-[22px] border-t border-dashed border-surface-200 pt-3 mt-1">
              <span className="text-navy">{t('pos.total')}</span>
              <span className="text-emerald tracking-tight">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerateBill}
          disabled={cartItems.length === 0}
          id="generate-bill-btn"
          className={`w-full py-4.5 rounded-[24px] font-black text-[17px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            tourStep === 2 ? 'z-50 relative ring-4 ring-amber' : ''
          } ${
            cartItems.length > 0
              ? 'bg-navy text-white shadow-xl shadow-navy/20'
              : 'bg-surface-100 text-slate-400'
          }`}
        >
          {cartItems.length > 0
            ? `${t('pos.generate_bill')} — ₹${total.toLocaleString('en-IN')}`
            : t('pos.generate_bill')}
        </button>
      </div>

      {/* ── Interactive Tour Overlay ───────────────────────── */}
      {tourStep >= 0 && (
        <div
          className="absolute inset-0 z-40 bg-navy/80 backdrop-blur-md flex items-end pointer-events-auto"
          onClick={nextTourStep}
        >
          <div
            className="w-full p-6 text-center float-anim pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white/10 rounded-[32px] p-6 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-white font-black text-[22px] mb-2 tracking-tight">
                {t(`tour.step${tourStep}.title`)}
              </h2>
              <p className="text-blue-100 mb-6 font-medium text-[15px]">
                {t(`tour.step${tourStep}.body`)}
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                {[0,1,2].map(i => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === tourStep ? 'w-8 bg-amber' : 'w-2 bg-white/30'}`} />
                ))}
              </div>
              <button
                onClick={nextTourStep}
                className="bg-amber text-white px-8 py-4 rounded-[24px] font-black text-[16px] active:scale-95 transition-transform shadow-xl shadow-amber/20 w-full"
              >
                {tourStep === 2 ? t('tour.go') : t('tour.next')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
