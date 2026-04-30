import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Plus, Minus, Zap, Clock, Check } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { hapticFeedback } from '../utils/haptics';
import { isLowStock } from '../utils/inventory';

// ─── Quick Bill Overlay ────────────────────────────────────────────────────
function QuickBillOverlay({ products, onComplete, onClose }) {
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState('Cash');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Top');

  // Top 6 by soldToday (always in stock)
  const quickItems = [...products]
    .filter(p => p.stock > 0)
    .sort((a, b) => (b.soldToday || 0) - (a.soldToday || 0))
    .slice(0, 6);

  // All unique categories from inventory
  const categories = ['Top', ...Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()];

  // Items to display based on search or category
  const isSearching = search.trim().length > 0;
  const displayItems = isSearching
    ? products.filter(p =>
        p.stock > 0 &&
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : activeCategory === 'Top'
      ? quickItems
      : products.filter(p => p.stock > 0 && p.category === activeCategory);

  const addItem = (product) => {
    hapticFeedback.light();
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    hapticFeedback.light();
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleCharge = () => {
    if (cart.length === 0) return;
    hapticFeedback.success();
    onComplete(cart, total, payment);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: '#0A1929' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2">
        <div>
          <p className="text-amber text-[10px] font-black uppercase tracking-widest">Quick Bill</p>
          <h2 className="text-white font-black text-[20px] tracking-tight leading-tight">Add Items</h2>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-90 transition-transform border border-white/10"
        >
          <X size={18} className="text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="px-5 mb-2">
        <div className="flex items-center bg-white/10 border border-white/10 rounded-[16px] px-3 py-2.5 gap-2.5 focus-within:border-amber/40 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/30 flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="flex-1 bg-transparent text-white text-[14px] font-medium placeholder-white/25 focus:outline-none"
            placeholder="Search any item..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveCategory('Top'); }}
          />
          {search.length > 0 && (
            <button onClick={() => setSearch('')} className="text-white/30 active:text-white/60">
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* ── Category Chips ── */}
      {!isSearching && (
        <div className="px-5 mb-2">
          <div className="flex gap-1.5 overflow-x-auto scroll-hidden pb-0.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                  activeCategory === cat
                    ? 'bg-amber text-white shadow-lg shadow-amber/20'
                    : 'bg-white/10 text-white/50 border border-white/10'
                }`}
              >
                {cat === 'Top' ? '⚡ Top' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Scrollable Product Area ── */}
      <div className="px-5 flex-1 overflow-y-auto scroll-hidden pb-4">

        {/* Section label */}
        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">
          {isSearching
            ? `${displayItems.length} result${displayItems.length !== 1 ? 's' : ''} for "${search}"`
            : activeCategory === 'Top'
              ? '⚡ Top Selling'
              : activeCategory}
        </p>

        {/* Product grid */}
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-white/20">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-[13px] font-bold">No items found</p>
            <p className="text-[11px] mt-1">Try a different search</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {displayItems.map(p => {
              const inCart = cart.find(i => i.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => addItem(p)}
                  className={`rounded-[20px] p-3.5 flex flex-col items-start active:scale-95 transition-all border relative ${
                    inCart
                      ? 'bg-amber/20 border-amber/40'
                      : 'bg-white/8 border-white/10'
                  }`}
                >
                  {inCart && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-[10px] font-black">{inCart.qty}</span>
                    </div>
                  )}
                  <p className="text-white font-bold text-[12px] leading-tight line-clamp-2 mb-2">{p.name}</p>
                  <p className="text-white/30 text-[10px] font-semibold mb-1">{p.stock} {p.unit} left</p>
                  <p className="text-amber font-black text-[15px]">₹{p.price}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Cart — In Bill ── */}
        {cart.length > 0 && (
          <div className="mt-5">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">
              In Bill ({itemCount} items)
            </p>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="bg-white/8 rounded-[16px] px-4 py-3 flex items-center justify-between border border-white/10">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-[14px] truncate">{item.name}</p>
                    <p className="text-amber font-black text-[13px]">₹{item.price * item.qty}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-full p-1 ml-3">
                    <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform">
                      <Minus size={12} className="text-white" strokeWidth={3} />
                    </button>
                    <span className="text-white font-black text-[13px] w-5 text-center">{item.qty}</span>
                    <button onClick={() => addItem(item)} className="w-7 h-7 rounded-full bg-amber flex items-center justify-center active:scale-90 transition-transform">
                      <Plus size={12} className="text-white" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4 border-t border-white/10">
        {/* Payment toggle */}
        <div className="flex gap-2 mb-4">
          {['Cash', 'UPI'].map(p => (
            <button
              key={p}
              onClick={() => setPayment(p)}
              className={`flex-1 py-3 rounded-[16px] font-bold text-[14px] transition-all active:scale-95 ${
                payment === p ? 'bg-amber text-white shadow-lg shadow-amber/20' : 'bg-white/10 text-white/60 border border-white/10'
              }`}
            >
              {p === 'Cash' ? '💵 Cash' : '📱 UPI'}
            </button>
          ))}
        </div>

        <button
          onClick={handleCharge}
          disabled={cart.length === 0}
          className={`w-full py-4 rounded-[24px] font-black text-[18px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            cart.length > 0
              ? 'bg-amber text-white shadow-xl shadow-amber/30'
              : 'bg-white/10 text-white/30'
          }`}
        >
          {cart.length > 0 ? (
            <>
              <Check size={20} strokeWidth={3} />
              Charge ₹{total.toLocaleString('en-IN')} · {itemCount} items
            </>
          ) : 'Add items above'}
        </button>
      </div>
    </div>
  );
}

// ─── Bill Success Flash ────────────────────────────────────────────────────
function BillSuccess({ total, onDismiss }) {
  // Use a ref so the timeout is set ONCE on mount and never reset
  // by the 1-second elapsed timer re-renders in the parent
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    const t = setTimeout(() => dismissRef.current(), 2500);
    return () => clearTimeout(t);
  }, []); // empty deps — fires once on mount only

  return (
    <div className="absolute inset-0 z-50 bg-emerald/90 backdrop-blur-sm flex flex-col items-center justify-center animate-scale-pop">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-5 shadow-2xl">
        <Check size={44} className="text-white" strokeWidth={3} />
      </div>
      <p className="text-white font-black text-[32px] tracking-tight">₹{total.toLocaleString('en-IN')}</p>
      <p className="text-white/80 font-bold text-[16px] mt-1">Bill Done! ✓</p>
    </div>
  );
}

// ─── Main RushModeScreen ───────────────────────────────────────────────────
export default function RushModeScreen({ onExit, rushModeStart }) {
  const { state, addBill } = useAppContext();
  const { recentBills, products, stats } = state;

  const [elapsed, setElapsed] = useState(0);
  const [showQuickBill, setShowQuickBill] = useState(false);
  const [lastBillTotal, setLastBillTotal] = useState(null);
  const [criticalAlert, setCriticalAlert] = useState(null);

  // Timer
  useEffect(() => {
    const startTime = rushModeStart || Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [rushModeStart]);

  const formatElapsed = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  // Low stock items
  const lowStockItems = [...products]
    .filter(isLowStock)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 4);

  const handleBillComplete = (cart, total, payment) => {
    setShowQuickBill(false);

    // Add bill first so stock is updated in state
    addBill(cart, total, payment, null, '');

    // Check critical stock AFTER bill (uses cart qty vs current stock)
    const criticalItem = products.find(p => {
      const inCart = cart.find(c => c.id === p.id);
      if (inCart) return (p.stock - inCart.qty) <= 2;
      return false;
    });
    if (criticalItem) {
      const remaining = criticalItem.stock - (cart.find(c => c.id === criticalItem.id)?.qty || 0);
      setCriticalAlert({ item: criticalItem.name, left: remaining });
      setTimeout(() => setCriticalAlert(null), 4000);
    }

    // Show success flash — BillSuccess manages its own 2.5s dismiss
    setLastBillTotal(total);
  };

  // Today's rush session revenue — bills created since Rush Mode started
  const sessionStart = rushModeStart || 0;
  const sessionBills = recentBills.filter(b => {
    const ts = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ts >= sessionStart;
  });
  const sessionSales = sessionBills.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const recentRush = sessionBills.slice(0, 6);

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden" style={{ background: 'linear-gradient(160deg, #0B1C2E 0%, #0F2D44 60%, #0B1C2E 100%)' }}>

      {/* Critical Alert */}
      {criticalAlert && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-rose rounded-[20px] p-4 shadow-2xl shadow-rose/30 flex items-center gap-3 animate-slide-in">
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <p className="text-white font-black text-[14px]">Critical Stock Alert!</p>
            <p className="text-white/80 text-[12px] font-medium">{criticalAlert.item} — only {criticalAlert.left} left</p>
          </div>
          <button onClick={() => setCriticalAlert(null)} className="text-white/60 active:scale-90 transition-transform">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Quick Bill Overlay */}
      {showQuickBill && (
        <QuickBillOverlay
          products={products}
          onComplete={handleBillComplete}
          onClose={() => setShowQuickBill(false)}
        />
      )}

      {/* Bill Success Flash */}
      {lastBillTotal !== null && (
        <BillSuccess total={lastBillTotal} onDismiss={() => setLastBillTotal(null)} />
      )}

      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-rose rounded-full rush-pulse" />
            <span className="text-white font-black text-[13px] tracking-widest uppercase">Rush Mode</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 border border-white/10">
            <Clock size={11} className="text-amber" />
            <span className="text-amber text-xs font-black font-mono">{formatElapsed(elapsed)}</span>
          </div>
        </div>
        <p className="text-white/40 text-[12px] font-medium">Peak hour mode — simplified for speed</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="flex gap-3 px-5 mb-4">
        <div className="flex-1 bg-white/8 rounded-[20px] px-4 py-3 border border-white/10">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Bills Today</p>
          <p className="text-white font-black text-[22px] tracking-tight">{stats?.billsToday || 0}</p>
        </div>
        <div className="flex-1 bg-amber/15 rounded-[20px] px-4 py-3 border border-amber/20">
          <p className="text-amber/60 text-[10px] font-black uppercase tracking-widest">Today's Sales</p>
          <p className="text-amber font-black text-[22px] tracking-tight">₹{(sessionSales || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* ── BIG TAP BUTTON ── */}
      <div className="px-5 mb-4">
        <button
          onClick={() => { hapticFeedback.medium(); setShowQuickBill(true); }}
          className="w-full bg-amber rounded-[28px] flex flex-col items-center justify-center active:scale-[0.97] transition-all shadow-2xl shadow-amber/25 border border-amber/30"
          style={{ height: '140px' }}
        >
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2">
            <Plus size={32} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-white font-black text-[20px] tracking-tight">New Quick Bill</span>
          <span className="text-white/70 text-[12px] font-medium mt-0.5">Tap to add items & charge</span>
        </button>
      </div>

      {/* ── Low Stock Chips ── */}
      {lowStockItems.length > 0 && (
        <div className="mx-5 mb-4 bg-white/5 rounded-[20px] px-4 py-3 border border-white/8">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2.5">Low Stock Alert</p>
          <div className="flex gap-2 flex-wrap">
            {lowStockItems.map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                  item.stock <= 3
                    ? 'bg-rose/20 border border-rose/30 text-rose'
                    : 'bg-amber/15 border border-amber/20 text-amber'
                }`}
              >
                {item.stock <= 3 ? '🔴' : '🟡'} {item.name}: {item.stock} left
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Bills ── */}
      <div className="flex-1 px-5 overflow-y-auto scroll-hidden pb-4">
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Recent Bills</p>
        <div className="space-y-2">
          {recentRush.length === 0 ? (
            <div className="text-center py-6 text-white/20 font-medium text-[14px]">No bills yet today</div>
          ) : recentRush.map(bill => (
            <div key={bill.id + bill.time} className="bg-white/6 rounded-[18px] px-4 py-3 flex items-center justify-between border border-white/8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white/30 text-[11px] font-bold">#{bill.id}</span>
                  <span className="text-white/40 text-[11px]">{bill.time}</span>
                </div>
                <p className="text-white font-semibold text-[13px] truncate">
                  {bill.items?.map(i => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}`).join(', ') || 'Quick Sale'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                <span className="text-amber font-black text-[15px]">₹{bill.total?.toLocaleString('en-IN')}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    bill.payment === 'UPI' ? 'bg-amber/20 text-amber' :
                    bill.payment === 'Cash' ? 'bg-emerald/20 text-emerald' :
                    'bg-white/10 text-white/50'
                  }`}>{bill.payment}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    bill.status === 'done' ? 'bg-emerald/20 text-emerald' : 'bg-rose/20 text-rose'
                  }`}>{bill.status === 'done' ? '✓ Done' : 'Pending'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Exit ── */}
      <div className="px-5 py-4 border-t border-white/8">
        <button
          onClick={onExit}
          className="w-full bg-white/8 border border-white/12 rounded-[20px] py-3.5 text-white/60 text-[14px] font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Zap size={14} className="text-white/40" />
          Exit Rush Mode
        </button>
      </div>
    </div>
  );
}
