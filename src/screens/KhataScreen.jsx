import { useState } from 'react';
import { ArrowLeft, Search, Plus, Phone, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { hapticFeedback } from '../utils/haptics';

// ─── Add Customer Modal ────────────────────────────────────────────────────
function AddCustomerModal({ onClose, onSave, t }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    hapticFeedback.success();
    onSave({ name: name.trim(), phone: phone.trim() });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[100] bg-navy/60 backdrop-blur-sm flex flex-col overflow-y-auto">
      <div className="mt-auto bg-white w-full rounded-t-[32px] px-6 pt-6 pb-28 shadow-2xl animate-slide-in">
        <div className="w-12 h-1.5 bg-surface-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-navy text-[24px] tracking-tight">{t('khata.add_customer')}</h3>
          <button onClick={onClose} className="w-10 h-10 bg-surface-100 border border-surface-200 rounded-[16px] flex items-center justify-center text-slate-500 active:scale-95 transition-transform">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">{t('khata.name_required')} *</label>
            <input
              autoFocus
              className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-bold text-[17px] focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all placeholder:text-slate-400"
              placeholder="e.g. Ramesh Ji"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">{t('khata.phone_optional')}</label>
            <input
              type="tel"
              inputMode="numeric"
              className="w-full mt-1.5 bg-white border border-surface-200 rounded-[24px] px-5 py-4 text-navy font-semibold focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all placeholder:text-slate-400"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-surface-100/50 border border-surface-200 rounded-[24px] py-4.5 font-bold text-slate-600 active:scale-[0.98] transition-transform">
            {t('general.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className={`flex-[2] rounded-[24px] py-4.5 font-black text-[17px] transition-all duration-300 active:scale-[0.98] ${
              name.trim() ? 'bg-navy text-white shadow-xl shadow-navy/20' : 'bg-surface-50 text-slate-400 border border-surface-200'
            }`}
          >
            {t('khata.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Settle Modal ──────────────────────────────────────────────────────────
function SettleModal({ customer, onClose, onSettle, t }) {
  const [amount, setAmount] = useState('');

  const handleSettle = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    onSettle(Number(amount));
  };

  const quickAmounts = [100, 200, 500].filter(a => a <= customer.due);

  return (
    <div className="absolute inset-0 z-[100] bg-navy/60 backdrop-blur-sm flex flex-col overflow-y-auto">
      <div className="mt-auto bg-white w-full rounded-t-[32px] px-6 pt-6 pb-28 shadow-2xl animate-slide-in">
        <div className="w-12 h-1.5 bg-surface-200 rounded-full mx-auto mb-6" />
        <h3 className="font-black text-navy text-[24px] mb-4 tracking-tight">{t('khata.receive')}</h3>
        <div className="bg-surface-50 rounded-[24px] px-5 py-5 mb-6 border border-surface-200 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-navy font-bold text-[17px]">{customer.name}</p>
            <p className="text-slate-500 font-medium text-[13px] mt-0.5">{t('khata.due')}: <span className="text-rose font-bold block sm:inline">₹{customer.due.toLocaleString('en-IN')}</span></p>
          </div>
          <button
            onClick={() => setAmount(customer.due.toString())}
            className="bg-emerald border border-emerald/20 text-white shadow-md shadow-emerald/20 text-[11px] font-black uppercase tracking-wider px-4 py-3 rounded-[16px] active:scale-95 transition-transform"
          >
            Full Amt
          </button>
        </div>

        {/* Quick amount chips */}
        {quickAmounts.length > 0 && (
          <div className="flex gap-2.5 mb-5">
            {quickAmounts.map(a => (
              <button
                key={a}
                onClick={() => setAmount(a.toString())}
                className={`flex-1 py-3.5 rounded-[20px] text-[15px] font-bold transition-all active:scale-95 shadow-sm border ${
                  amount === a.toString() ? 'bg-navy text-white border-navy shadow-navy/20 shadow-md' : 'bg-white border-surface-200 text-slate-500 hover:bg-surface-50'
                }`}
              >
                ₹{a}
              </button>
            ))}
          </div>
        )}

        <label className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">Amount Received (₹)</label>
        <input
          type="number"
          inputMode="numeric"
          className="w-full mt-1.5 mb-8 bg-white border border-surface-200 shadow-sm rounded-[24px] px-5 py-4 text-navy font-black text-3xl focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-slate-300"
          placeholder="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-surface-100/50 border border-surface-200 rounded-[24px] py-4.5 font-bold text-slate-600 active:scale-[0.98] transition-transform">
            {t('general.cancel')}
          </button>
          <button
            onClick={handleSettle}
            disabled={!amount || Number(amount) <= 0}
            className={`flex-[2] flex items-center justify-center gap-2.5 rounded-[24px] py-4.5 font-black transition-all duration-300 active:scale-[0.98] text-[17px] ${
              amount && Number(amount) > 0 ? 'bg-emerald text-white shadow-xl shadow-emerald/20' : 'bg-surface-50 text-slate-400 border border-surface-200'
            }`}
          >
            <Check size={20} strokeWidth={3} />
            {t('khata.record_payment')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Customer Card ─────────────────────────────────────────────────────────
function CustomerCard({ c, t, onSettle }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-surface-200 overflow-hidden relative">
      <div className="p-5 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-navy text-[17px] truncate tracking-tight">{c.name}</p>
          <div className="flex items-center gap-3 mt-1">
            {c.phone ? (
              <a
                href={`tel:${c.phone}`}
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-navy text-[13px] font-semibold"
              >
                <Phone size={13} strokeWidth={2.5} /> {c.phone}
              </a>
            ) : (
              <span className="text-slate-500 text-[13px] font-medium">No phone</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {c.due > 0 ? (
            <div className="text-right">
              <p className="text-rose font-black text-[22px] tracking-tight">₹{c.due.toLocaleString('en-IN')}</p>
              <button
                onClick={() => onSettle(c)}
                className="mt-1.5 bg-emerald/10 text-emerald text-[11px] uppercase tracking-wider font-black px-4 py-2 rounded-[16px] active:scale-95 transition-transform"
              >
                {t('khata.receive')}
              </button>
            </div>
          ) : (
             <div className="text-right">
               <p className="text-emerald font-black text-[15px] tracking-tight">{t('khata.settled')}</p>
               <p className="text-slate-400 text-[11px] font-bold uppercase mt-0.5 tracking-wider">All clear</p>
             </div>
          )}

          {c.transactions?.length > 0 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="w-10 h-10 bg-surface-50 border border-surface-200 rounded-[16px] flex items-center justify-center active:scale-95 transition-transform shadow-sm"
            >
              {expanded ? <ChevronUp size={20} className="text-navy" strokeWidth={2.5}/> : <ChevronDown size={20} className="text-navy" strokeWidth={2.5}/>}
            </button>
          )}
        </div>
      </div>

      {/* Transaction History */}
      {expanded && c.transactions?.length > 0 && (
        <div className="border-t border-surface-200 bg-surface-50 px-5 py-4 space-y-3">
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider mb-3">Transaction History</p>
          {c.transactions.slice(0, 5).map((tx, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-navy text-[13px] font-bold">{tx.note}</p>
                <p className="text-slate-500 text-[12px] font-medium">{tx.date}</p>
              </div>
              <span className={`font-black text-[15px] ${tx.type === 'payment' ? 'text-emerald' : 'text-rose'}`}>
                {tx.type === 'payment' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main KhataScreen ──────────────────────────────────────────────────────
export default function KhataScreen({ onBack }) {
  const { state, settleKhata, addCustomer, t } = useAppContext();
  const { customers = [] } = state;
  const [search, setSearch] = useState('');
  const [settleModal, setSettleModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredCustomers = customers
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search)
    )
    .sort((a, b) => b.due - a.due);

  const totalDue = customers.reduce((sum, c) => sum + (c.due || 0), 0);

  const handleSettle = (amount) => {
    hapticFeedback.success();
    settleKhata(settleModal.id, amount);
    setSettleModal(null);
  };

  const handleAddCustomer = (data) => {
    addCustomer(data);
  };

  return (
    <div className="flex flex-col h-full bg-surface-50 screen-enter relative">

      {/* Modals */}
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCustomer}
          t={t}
        />
      )}
      {settleModal && (
        <SettleModal
          customer={settleModal}
          onClose={() => setSettleModal(null)}
          onSettle={handleSettle}
          t={t}
        />
      )}

      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border-b border-surface-200 relative z-10 rounded-b-[32px]">
        <div className="flex items-center gap-3 mb-6 mt-2">
          <button onClick={onBack} className="w-10 h-10 bg-surface-50 border border-surface-200 rounded-[16px] flex items-center justify-center active:scale-95 transition-transform text-navy shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-navy font-black text-[24px] flex-1 tracking-tight">{t('khata.title')}</h1>
        </div>

        {/* Outstanding summary */}
        <div className="bg-rose rounded-[24px] p-5 text-white shadow-xl shadow-rose/20 mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-[20px] -translate-y-10 translate-x-10" />
          <p className="text-rose-100 text-[11px] font-black uppercase tracking-widest">{t('khata.outstanding')}</p>
          <p className="font-black text-[32px] tracking-tight mt-1 leading-none">₹{totalDue.toLocaleString('en-IN')}</p>
          <p className="text-rose-100 text-[13px] font-medium mt-2 opacity-90">
            from {customers.filter(c => c.due > 0).length} customers
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full bg-white border border-surface-200 rounded-[24px] pl-11 pr-4 py-4 text-[15px] font-medium text-navy placeholder:text-slate-400 focus:outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 shadow-sm transition-all"
            placeholder="Search customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customer list */}
      <div className="flex-1 overflow-y-auto scroll-hidden px-5 py-4 space-y-3 pb-24">
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-5xl mb-3">📓</p>
            <p className="font-bold text-lg text-slate-600 mb-1">{t('khata.no_customers')}</p>
            <p className="text-[13px] text-slate-400">Tap + to add your first customer</p>
          </div>
        )}

        {filteredCustomers.map(c => (
          <CustomerCard
            key={c.id}
            c={c}
            t={t}
            onSettle={setSettleModal}
          />
        ))}
      </div>

      {/* Bottom-right action area — FAB + AI placeholder */}
      <div className="absolute bottom-6 right-5 flex flex-col items-center gap-3 z-10">
        {/* AI placeholder — reserved for future AI integration */}
        <button
          disabled
          className="w-12 h-12 rounded-full bg-white border border-surface-200 shadow-md flex items-center justify-center opacity-40"
          title="AI insights — coming soon"
        >
          <span className="text-[18px]">✦</span>
        </button>

        {/* Primary add button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-14 h-14 bg-navy rounded-full shadow-xl shadow-navy/30 flex items-center justify-center active:scale-90 transition-transform border border-white/10"
        >
          <Plus size={26} className="text-white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
