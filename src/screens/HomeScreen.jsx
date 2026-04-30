import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, ShoppingCart, Package, Zap, BarChart2, Clock, X } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { hapticFeedback } from '../utils/haptics';
import { isLowStock } from '../utils/inventory';

// ─── In-app PIN Modal ─────────────────────────────────────────────────────
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
        <p className="text-blue-100 text-[14px] mb-7 font-semibold text-center">Enter PIN to unlock full access</p>
        <div className="flex justify-center gap-3 mb-8">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-3.5 h-3.5 rounded-full transition-all ${pin.length > i ? 'bg-amber scale-110 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'bg-white/35'}`} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 w-full">
          {buttons.map((b, i) => (
            b === '' ? <div key={i} /> :
            b === '⌫' ? (
              <button key={i} onClick={() => setPin(p => p.slice(0,-1))} className="h-14 rounded-[18px] bg-white text-navy text-xl font-black active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-black/10 ring-1 ring-white/30">⌫</button>
            ) : (
              <button key={i} onClick={() => handleDigit(b)} className="h-14 rounded-[18px] bg-white text-navy text-[26px] font-black active:scale-95 transition-all shadow-lg shadow-black/10 ring-1 ring-white/30">{b}</button>
            )
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full h-11 rounded-[14px] bg-white/15 text-white hover:bg-white/25 text-[15px] font-black transition-colors border border-white/20 shadow-lg shadow-black/10">Cancel</button>
      </div>
    </div>
  );
}

function AnimatedNumber({ target, prefix = '', suffix = '', className = '' }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const steps = 50;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return (
    <span className={className}>
      {prefix}{current.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

export default function HomeScreen({ onNavigate, onRushMode }) {
  const { state, verifyUPI, role, setRole } = useAppContext();
  const { products, stats, recentBills, customers = [], business } = state;
  const [showPinModal, setShowPinModal] = useState(false);

  const lowStockItems = products.filter(isLowStock);
  const profitPct = Math.min(100, Math.round((stats.netProfit / stats.profitGoal) * 100));
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
  const totalKhataDue = customers.reduce((sum, c) => sum + c.due, 0);

  // Check if there are pending UPI bills
  const unverifiedUPI = recentBills.filter(b => b.status === 'pending' && b.payment === 'UPI').length;

  const handleVerifyUPI = () => {
    hapticFeedback.success();
    recentBills.forEach(b => {
      if (b.status === 'pending' && b.payment === 'UPI') verifyUPI(b.id);
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F6F8] screen-enter relative">
      {/* PIN Modal overlay */}
      {showPinModal && (
        <PinModal
          onClose={() => setShowPinModal(false)}
          onUnlock={() => { setRole('owner'); setShowPinModal(false); }}
        />
      )}
      {/* Header */}
      <div className="bg-[#1A5276] px-4 pt-10 pb-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">{business?.fullName || business?.name || 'My Store'}</h1>
            <p className="text-blue-200 text-xs flex items-center gap-1 mt-0.5">
              <span>📍</span> {business?.location || 'Set location in Settings'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 bg-[#F39C12]/20 border border-[#F39C12]/40 rounded-full px-2.5 py-1 live-glow">
              <div className="w-2 h-2 bg-[#F39C12] rounded-full animate-pulse"></div>
              <span className="text-[#F39C12] text-xs font-semibold">LIVE</span>
              <span className="text-blue-200 text-xs">{today}</span>
            </div>
            {role === 'staff' && (
            <button
              onClick={() => setShowPinModal(true)}
              className="flex items-center gap-1.5 bg-[#E74C3C]/20 border border-[#E74C3C]/40 rounded-full px-2.5 py-1 active:scale-95 transition-transform"
            >
              <span className="text-white text-xs font-bold">🔒 Staff Locked</span>
            </button>
          )}
            <button
              onClick={onRushMode}
              className="flex items-center gap-1.5 bg-[#E74C3C] rounded-xl px-3 py-1.5 rush-pulse active:scale-95 transition-transform"
            >
              <Zap size={13} className="text-white" fill="white" />
              <span className="text-white text-xs font-bold">RUSH MODE 🔥</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scroll-hidden px-4 py-4 space-y-3">

        {/* Card 1 — Live Profit Meter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm card-hover border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">Today's Profit</p>
            <TrendingUp size={16} className="text-[#27AE60]" />
          </div>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-[#27AE60] font-black number-anim" style={{ fontSize: '44px', lineHeight: 1.1 }}>
              ₹<AnimatedNumber target={stats.netProfit} />
            </span>
          </div>
          <p className="text-[#27AE60] text-sm font-medium mb-3">
            ↑ ₹{(stats.netProfit - stats.previousDayProfit).toLocaleString('en-IN')} vs yesterday
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-[#27AE60] to-[#2ECC71] progress-animate"
              style={{ width: `${profitPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-xs">{profitPct}% of daily goal reached</p>
            <p className="text-gray-400 text-xs">Goal: ₹{stats.profitGoal.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Card 2 — Sales Snapshot */}
        <div className="bg-white rounded-2xl p-4 shadow-sm card-hover border border-gray-100">
          <p className="text-gray-500 text-xs font-medium tracking-wide uppercase mb-3">Sales Snapshot</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Bills Today', value: stats.billsToday, prefix: '', color: '#1A5276' },
              { label: 'Cash', value: stats.cashSales, prefix: '₹', color: '#1A5276' },
              { label: 'UPI', value: stats.upiSales, prefix: '₹', color: '#F39C12' },
            ].map((item) => (
              <div key={item.label} className="bg-[#F4F6F8] rounded-xl p-3 text-center">
                <p className="font-black text-xl" style={{ color: item.color }}>
                  {item.prefix}{item.value.toLocaleString('en-IN')}
                </p>
                <p className="text-gray-500 text-xs mt-0.5 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Khata Market Outstanding */}
        <button
          onClick={() => onNavigate('khata')}
          className="w-full bg-gradient-to-r from-[#E74C3C] to-[#C0392B] rounded-2xl p-4 shadow-sm relative overflow-hidden card-hover text-left flex justify-between items-center active:scale-95 transition-transform"
        >
          <div className="relative z-10">
            <p className="text-red-100 text-xs font-medium uppercase tracking-wide">Market Outstanding</p>
            <p className="text-white font-black text-2xl mt-0.5">₹{totalKhataDue.toLocaleString('en-IN')}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm relative z-10 shadow-inner">
            <span className="text-white text-xs font-black">Khata</span>
          </div>
        </button>

        {/* Card 3 — Stock Alert */}
        {lowStockItems.length > 0 && (
          <button
            onClick={() => onNavigate('inventory', { filter: 'low' })}
            className="w-full bg-[#FEF3CD] border border-[#F39C12]/40 rounded-2xl p-4 flex items-center gap-3 card-hover active:scale-95 transition-transform text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F39C12] flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-[#D68910] text-sm">{lowStockItems.length} items running low</p>
              <p className="text-[#D68910]/70 text-xs mt-0.5">Tap to reorder → {lowStockItems.slice(0,2).map(i => i.name).join(', ')}</p>
            </div>
            <div className="ml-auto text-[#D68910] text-lg">›</div>
          </button>
        )}

        {/* Card 4 — Pending Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">Pending Actions</p>
          {unverifiedUPI > 0 ? (
            <div className="flex items-center justify-between bg-[#EBF5FB] rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#F39C12] rounded-full animate-pulse"></div>
                <p className="text-[#1A5276] text-sm font-medium">{unverifiedUPI} UPI payments unverified</p>
              </div>
              <button
                onClick={handleVerifyUPI}
                className="bg-[#1A5276] text-white text-xs px-3 py-1.5 rounded-lg font-semibold active:scale-95 transition-transform"
              >
                Verify
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#E9F7EF] rounded-xl px-3 py-2.5">
              <CheckCircle size={14} className="text-[#27AE60]" />
              <p className="text-[#27AE60] text-sm font-medium">UPI payments verified ✓</p>
            </div>
          )}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <p className="text-gray-600 text-sm font-medium">End-of-day summary pending</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="bg-[#F39C12] text-white text-xs px-3 py-1.5 rounded-lg font-semibold active:scale-95 transition-transform"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium tracking-wide uppercase mb-3">Quick Actions</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: ShoppingCart, label: 'New Bill', screen: 'billing', color: '#1A5276', bg: '#EBF5FB' },
              { icon: Package, label: 'Add Stock', screen: 'inventory', color: '#27AE60', bg: '#E9F7EF' },
              { icon: Zap, label: 'Rush Mode', screen: null, color: '#E74C3C', bg: '#FDEDEC', action: onRushMode },
              { icon: BarChart2, label: 'Reports', screen: 'reports', color: '#F39C12', bg: '#FEF9E7' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action || (() => onNavigate(item.screen))}
                className="flex flex-col items-center gap-1.5 rounded-xl py-3 active:scale-95 transition-transform"
                style={{ background: item.bg }}
              >
                <item.icon size={22} style={{ color: item.color }} />
                <span className="text-xs font-semibold text-gray-600 text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Top Seller teaser */}
        <div className="bg-gradient-to-r from-[#1A5276] to-[#2471A3] rounded-2xl p-4 shadow-sm">
          <p className="text-blue-200 text-xs font-medium mb-2">🏆 Top Seller Today</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-base">Bisleri 500ml</p>
              <p className="text-blue-200 text-sm">45 units sold today</p>
            </div>
            <div className="text-right">
              <p className="text-[#F39C12] font-black text-xl">₹900</p>
              <p className="text-blue-200 text-xs">revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
