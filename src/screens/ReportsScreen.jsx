import { useMemo, useRef, useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

function SummaryCard({ onClose, stats, t, business, reportLabel }) {
  const storeName = business?.fullName || business?.name || 'My Store';

  const shareToWhatsApp = () => {
    let text = `*${storeName} — ${reportLabel}*\n`;
    text += `${reportLabel}\n\n`;
    text += `💰 Gross Sales: ₹${stats.grossSales.toLocaleString('en-IN')}\n`;
    text += `💵 Cash: ₹${stats.cashSales.toLocaleString('en-IN')}\n`;
    text += `📱 UPI: ₹${stats.upiSales.toLocaleString('en-IN')}\n`;
    text += `📒 Khata: ₹${(stats.khataSales || 0).toLocaleString('en-IN')}\n`;
    text += `📤 Expenses: ₹${stats.expenses.toLocaleString('en-IN')}\n\n`;
    text += `*Net Profit: ₹${Math.round(stats.netProfit).toLocaleString('en-IN')}* (${Number.isFinite(stats.profitMargin) ? stats.profitMargin : 0}%)\n\n`;
    text += `📊 Powered by OneFlow`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="absolute inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full rounded-[32px] p-6 shadow-2xl animate-scale-pop border border-white/20">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-navy/20">
            <span className="text-white font-black text-xl">📊</span>
          </div>
          <h2 className="font-black text-navy text-[22px] tracking-tight">{storeName}</h2>
          <p className="text-slate-400 text-[13px] font-medium mt-1">{reportLabel}</p>
        </div>

        <div className="space-y-2.5 mb-6 bg-surface-50 rounded-[24px] p-5 border border-slate-100/50">
          {[
            { label: 'Gross Sales', value: `₹${stats.grossSales.toLocaleString('en-IN')}`, color: 'text-navy font-black text-[17px]' },
            { label: 'Cash', value: `₹${stats.cashSales.toLocaleString('en-IN')}`, color: 'text-slate-700 font-bold' },
            { label: 'UPI', value: `₹${stats.upiSales.toLocaleString('en-IN')}`, color: 'text-amber font-bold' },
            { label: 'Khata (Credit)', value: `₹${(stats.khataSales || 0).toLocaleString('en-IN')}`, color: 'text-rose font-bold' },
            { label: 'Expenses', value: `₹${stats.expenses.toLocaleString('en-IN')}`, color: 'text-rose font-bold' },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-1 border-b border-white last:border-0">
              <span className="text-slate-500 text-[13px] font-semibold">{item.label}</span>
              <span className={item.color}>{item.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-emerald/10 border border-emerald/20 rounded-[24px] p-5 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-20 rounded-full blur-[20px] -translate-y-10 translate-x-10" />
          <p className="text-emerald text-[11px] font-bold uppercase tracking-wider mb-1">{t('reports.net_profit')}</p>
          <p className="text-emerald font-black text-[32px] tracking-tight leading-none">₹{Math.round(stats.netProfit).toLocaleString('en-IN')}</p>
          <p className="text-emerald/80 text-[13px] font-semibold mt-2 drop-shadow-sm">Margin: {Number.isFinite(stats.profitMargin) ? stats.profitMargin : 0}%</p>
        </div>

        <p className="text-center text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-5">📸 Screenshot this to save your record</p>

        <div className="flex gap-3">
          <button
            onClick={shareToWhatsApp}
            className="flex-1 bg-white border border-emerald text-emerald rounded-2xl py-3.5 font-bold text-[15px] active:scale-[0.98] transition-transform shadow-sm flex items-center justify-center gap-2"
          >
            WhatsApp
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-navy rounded-2xl py-3.5 text-white font-black text-[15px] active:scale-[0.98] transition-transform shadow-lg shadow-navy/20"
          >
            {t('general.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getStartOfWeek = (date) => {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

const getStartOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ReportsScreen({ onNavigate }) {
  const { state, verifyUPI, t, language } = useAppContext();
  const { recentBills, business, manualEntries = [] } = state;
  const [period, setPeriod] = useState('today');
  const [showSummary, setShowSummary] = useState(false);
  const [showBillHistory, setShowBillHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dateInputRef = useRef(null);

  const reportLocale = language === 'hi' ? 'hi-IN' : 'en-IN';

  const dateRange = useMemo(() => {
    const anchor = startOfDay(selectedDate);

    if (period === 'today') {
      return { start: anchor, end: addDays(anchor, 1) };
    }

    if (period === 'week') {
      const start = getStartOfWeek(selectedDate);
      return { start, end: addDays(start, 7) };
    }

    const start = getStartOfMonth(selectedDate);
    return { start, end: new Date(start.getFullYear(), start.getMonth() + 1, 1) };
  }, [period, selectedDate]);

  const selectedDateLabel = useMemo(() => {
    if (period === 'today') {
      return selectedDate.toLocaleDateString(reportLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }

    if (period === 'week') {
      const startLabel = dateRange.start.toLocaleDateString(reportLocale, {
        day: 'numeric',
        month: 'short',
      });
      const endLabel = addDays(dateRange.end, -1).toLocaleDateString(reportLocale, {
        day: 'numeric',
        month: 'short',
      });
      return `${startLabel} - ${endLabel}`;
    }

    return selectedDate.toLocaleDateString(reportLocale, {
      month: 'long',
      year: 'numeric',
    });
  }, [dateRange.end, dateRange.start, period, reportLocale, selectedDate]);

  const reportLabel = useMemo(() => {
    if (period === 'today') {
      return selectedDate.toLocaleDateString(reportLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

    if (period === 'week') {
      return `Week of ${dateRange.start.toLocaleDateString(reportLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`;
    }

    return selectedDate.toLocaleDateString(reportLocale, {
      month: 'long',
      year: 'numeric',
    });
  }, [dateRange.start, period, reportLocale, selectedDate]);

  const parseBillDate = (bill) => {
    const raw = bill.createdAt || (bill.dateKey ? `${bill.dateKey}T12:00:00` : null);
    const parsed = raw ? new Date(raw) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : startOfDay(selectedDate);
  };

  const parseEntryDate = (entry) => {
    const raw = entry.createdAt || (entry.dateKey ? `${entry.dateKey}T12:00:00` : null);
    const parsed = raw ? new Date(raw) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : startOfDay(selectedDate);
  };

  const inPeriod = (date) => date >= dateRange.start && date < dateRange.end;

  const billsForPeriod = recentBills.filter(bill => inPeriod(parseBillDate(bill)));
  const manualForPeriod = manualEntries.filter(entry => inPeriod(parseEntryDate(entry)));

  const billGrossSales = billsForPeriod.reduce((sum, bill) => sum + Number(bill.total || 0), 0);
  const billCashSales = billsForPeriod.filter(b => b.payment === 'Cash').reduce((sum, bill) => sum + Number(bill.total || 0), 0);
  const billUpiSales = billsForPeriod.filter(b => b.payment === 'UPI').reduce((sum, bill) => sum + Number(bill.total || 0), 0);
  const billKhataSales = billsForPeriod.filter(b => b.payment === 'Khata').reduce((sum, bill) => sum + Number(bill.total || 0), 0);

  const manualSales = manualForPeriod.filter(e => e.type === 'Sale').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const expenses = manualForPeriod.filter(e => e.type === 'Expense').reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const billProfit = billsForPeriod.reduce((sum, bill) => {
    const explicitProfit = Number(bill.profit);
    if (Number.isFinite(explicitProfit)) return sum + explicitProfit;
    return sum + (Number(bill.total || 0) * 0.2);
  }, 0);

  const manualProfit = manualSales * 0.2 - expenses;
  const grossSales = billGrossSales + manualSales;
  const netProfit = billProfit + manualProfit;

  const periodStats = {
    grossSales: Math.round(grossSales),
    cashSales: Math.round(billCashSales + manualSales),
    upiSales: Math.round(billUpiSales),
    khataSales: Math.round(billKhataSales),
    expenses: Math.round(expenses),
    netProfit: Math.round(netProfit),
    billsToday: billsForPeriod.length,
    profitMargin: grossSales > 0 ? Math.round((netProfit / grossSales) * 100) : 0,
  };

  const totalPayments = periodStats.cashSales + periodStats.upiSales + periodStats.khataSales;
  const cashPct = totalPayments > 0 ? Math.round((periodStats.cashSales / totalPayments) * 100) : 0;
  const upiPct = totalPayments > 0 ? Math.round((periodStats.upiSales / totalPayments) * 100) : 0;
  const khataPct = totalPayments > 0 ? Math.round((periodStats.khataSales / totalPayments) * 100) : 0;

  const itemCounts = {};
  billsForPeriod.forEach(bill => {
    (bill.items || []).forEach(item => {
      if (!itemCounts[item.name]) itemCounts[item.name] = { units: 0, revenue: 0 };
      itemCounts[item.name].units += Math.round(item.qty || 0);
      itemCounts[item.name].revenue += Math.round((item.qty || 0) * (item.price || 0));
    });
  });

  const topSellers = Object.entries(itemCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const pendingUpi = billsForPeriod.filter(b => b.payment === 'UPI' && b.status === 'pending');
  const dailyGoal = 4000;
  const profitPct = Math.min(100, Math.round((periodStats.netProfit / dailyGoal) * 100));
  const periodLabel = period === 'today' ? t('reports.today') : period === 'week' ? t('reports.week') : t('reports.month');

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.click();
  };

  const handleDateChange = (value) => {
    if (!value) return;
    const nextDate = new Date(`${value}T12:00:00`);
    if (Number.isNaN(nextDate.getTime())) return;
    setSelectedDate(nextDate);
  };

  return (
    <div className="flex flex-col h-full bg-surface-50">
      {showSummary && (
        <SummaryCard
          onClose={() => setShowSummary(false)}
          stats={periodStats}
          t={t}
          business={business}
          reportLabel={reportLabel}
        />
      )}

      <div className="bg-white px-5 pt-10 pb-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-b-[32px] relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-navy font-black text-[28px] tracking-tight">{t('reports.title')}</h1>
            <p className="text-slate-400 text-[13px] font-medium mt-1">{selectedDateLabel}</p>
          </div>
          <div>
            <button
              onClick={openDatePicker}
              className="flex items-center gap-1.5 bg-surface-50 border border-slate-100 rounded-xl px-3 py-2"
            >
              <Calendar size={14} className="text-slate-600" />
              <ChevronDown size={14} className="text-slate-600" />
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={toDateInputValue(selectedDate)}
              max={toDateInputValue(new Date())}
              onChange={e => handleDateChange(e.target.value)}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="flex bg-surface-50 rounded-[20px] p-1.5 border border-surface-200 shadow-sm">
          {['today', 'week', 'month'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2.5 rounded-[16px] text-[13px] font-bold transition-all ${
                period === p ? 'bg-white text-navy shadow-sm ring-1 ring-slate-100' : 'text-slate-400'
              }`}
            >
              {p === 'today' ? t('reports.today') : p === 'week' ? t('reports.week') : t('reports.month')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hidden px-5 py-5 space-y-4 pb-24">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-surface-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">{t('reports.net_profit')}</p>
            <div className="flex items-center gap-1.5 bg-amber/10 px-2 py-0.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-amber rounded-full live-glow" />
              <span className="text-amber text-[10px] font-black uppercase">LIVE</span>
            </div>
          </div>
          <p className="text-emerald font-black text-[40px] tracking-tighter leading-none mb-1 number-anim">
            ₹{periodStats.netProfit.toLocaleString('en-IN')}
          </p>
          <p className="text-slate-400 text-[13px] font-semibold">{reportLabel}</p>

          {period === 'today' && (
            <div className="mt-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Towards ₹{dailyGoal.toLocaleString('en-IN')} goal</span>
                <span className="text-emerald text-[13px] font-black bg-emerald/10 px-2 py-0.5 rounded-lg">{profitPct}%</span>
              </div>
              <div className="w-full bg-surface-100 h-3 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-3 rounded-full progress-animate"
                  style={{ width: `${profitPct}%`, background: profitPct >= 100 ? '#10B981' : '#0F2D44' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-surface-200">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-4">{periodLabel} ka Summary</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t('reports.gross_sales'), value: `₹${periodStats.grossSales.toLocaleString('en-IN')}`, color: 'text-navy' },
              { label: t('reports.bills'), value: periodStats.billsToday, color: 'text-navy' },
              { label: t('reports.expenses'), value: `₹${periodStats.expenses.toLocaleString('en-IN')}`, color: 'text-rose' },
              { label: t('reports.margin'), value: `${periodStats.profitMargin}%`, color: 'text-emerald' },
            ].map(s => (
              <div key={s.label} className="bg-surface-50 rounded-[20px] p-3.5 border border-slate-100/50">
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`font-black text-[22px] tracking-tight ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-surface-200">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-4">{t('reports.payment_breakdown')}</p>
          <div className="space-y-4">
            {[
              { label: 'Cash', pct: cashPct, amount: periodStats.cashSales, color: '#0F2D44' },
              { label: 'UPI', pct: upiPct, amount: periodStats.upiSales, color: '#F59E0B' },
              { label: 'Khata (Credit)', pct: khataPct, amount: periodStats.khataSales, color: '#EF4444' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-700 text-[13px] font-bold">{item.label}</span>
                  <span className="text-[13px] font-black" style={{ color: item.pct > 0 ? item.color : '#9CA3AF' }}>
                    {item.pct}% {item.amount > 0 ? `(₹${item.amount.toLocaleString('en-IN')})` : '—'}
                  </span>
                </div>
                <div className="w-full bg-surface-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-2.5 rounded-full progress-animate"
                    style={{ width: `${item.pct}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {topSellers.length > 0 && (
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-surface-200">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-4">{t('reports.top_sellers')}</p>
            <div className="space-y-4">
              {topSellers.map((item, i) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black flex-shrink-0 shadow-sm ${
                    i === 0 ? 'bg-amber text-white' : i === 1 ? 'bg-slate-200 text-slate-700' : 'bg-surface-100 text-slate-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy text-[15px] truncate tracking-tight">{item.name}</p>
                    <p className="text-slate-400 text-[11px] font-semibold mt-0.5">{item.units} units sold</p>
                  </div>
                  <p className="font-black text-navy text-[17px] tracking-tight">₹{item.revenue.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowSummary(true)}
          className="w-full bg-amber rounded-2xl py-4.5 text-white font-black text-[17px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-amber/20 mt-2 mb-2"
        >
          {t('reports.generate_summary')}
        </button>

        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-surface-200">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-4">
            {t('reports.pending_upi')} ({pendingUpi.length})
          </p>
          {pendingUpi.length === 0 ? (
            <p className="text-center text-[13px] font-semibold text-emerald bg-emerald/10 py-3 rounded-[16px]">✓ {t('reports.all_verified')}</p>
          ) : (
            <div className="space-y-3">
              {pendingUpi.map(upi => (
                <div key={upi.id} className="bg-amber/5 border border-amber/20 rounded-[20px] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-navy text-[17px] tracking-tight">₹{upi.total.toLocaleString('en-IN')}</p>
                      <p className="text-slate-500 text-[11px] font-bold mt-1 truncate">
                        Bill #{upi.id} • {upi.items?.slice(0, 2).map(i => i.name).join(', ')}
                      </p>
                      {upi.customerName && (
                        <p className="text-navy/70 text-[11px] font-bold mt-0.5">
                          👤 {upi.customerName}
                        </p>
                      )}
                      <p className="text-slate-400 text-[10px] uppercase font-bold mt-0.5">{upi.time}</p>
                    </div>
                    <button
                      onClick={() => verifyUPI(upi.id)}
                      className="bg-emerald text-white text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-[16px] font-black active:scale-95 transition-transform shadow-md shadow-emerald/20 flex-shrink-0"
                    >
                      {t('reports.mark_verified')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-surface-200 overflow-hidden">
          <button
            onClick={() => setShowBillHistory(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 active:bg-surface-50 transition-colors"
          >
            <p className="text-navy font-bold text-[15px]">{t('reports.bill_history')} ({billsForPeriod.length})</p>
            {showBillHistory ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </button>

          {showBillHistory && (
            <div className="border-t border-slate-50 px-5 py-3 space-y-3 max-h-72 overflow-y-auto scroll-hidden bg-surface-50/50">
              {billsForPeriod.map(bill => (
                <div key={bill.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-navy text-[13px] font-bold">Bill #{bill.id}</p>
                    <p className="text-slate-400 text-[11px] font-semibold mt-0.5">{bill.time} • {bill.payment}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-navy text-[15px] tracking-tight">₹{bill.total.toLocaleString('en-IN')}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-black ${
                      bill.status === 'done' ? 'bg-emerald/10 text-emerald' : 'bg-amber/10 text-amber'
                    }`}>
                      {bill.status === 'done' ? '✓' : 'Wait'}
                    </span>
                  </div>
                </div>
              ))}
              {billsForPeriod.length === 0 && (
                <p className="text-center text-slate-400 text-[13px] font-semibold py-6">No bills in this period</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => onNavigate('manual')}
          className="w-full bg-white border border-surface-200 rounded-[24px] p-5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface-50 rounded-[16px] flex items-center justify-center border border-surface-200">
              <span className="text-xl">📓</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-navy text-[15px]">Sync Manual Records</p>
              <p className="text-slate-400 text-[13px] font-medium mt-0.5">Register mein jo likha tha woh add karo</p>
            </div>
          </div>
          <span className="text-slate-300 text-2xl font-light">›</span>
        </button>
      </div>
    </div>
  );
}
