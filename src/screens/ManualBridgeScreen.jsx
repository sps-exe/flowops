import { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { hapticFeedback } from '../utils/haptics';

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatEntryTime = (timeValue) => {
  if (!timeValue) return '';
  const [rawHour, rawMinute] = timeValue.split(':');
  const hour = Number(rawHour);
  const minute = rawMinute || '00';
  if (!Number.isFinite(hour)) return timeValue;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const twelveHour = hour % 12 || 12;
  return `${twelveHour}:${minute} ${suffix}`;
};

const parseEntryDate = (entry) => {
  const raw = entry.createdAt || (entry.dateKey ? `${entry.dateKey}T12:00:00` : null);
  const parsed = raw ? new Date(raw) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
};

export default function ManualBridgeScreen({ onBack }) {
  const { state, addManualEntry, removeManualEntry } = useAppContext();
  const entries = state.manualEntries;
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [entryType, setEntryType] = useState('Sale');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [success, setSuccess] = useState(false);

  const selectedDateKey = toDateInputValue(selectedDate);
  const entriesForSelectedDate = entries.filter(entry => {
    const entryDate = parseEntryDate(entry);
    return toDateInputValue(entryDate) === selectedDateKey;
  });

  const totalManual = entriesForSelectedDate
    .filter(e => e.type === 'Sale')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const selectedDateLabel = selectedDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleAdd = () => {
    if (!amount) return;
    hapticFeedback.success();
    const createdAt = new Date(`${selectedDateKey}T${time || '12:00'}`);
    const newEntry = {
      type: entryType,
      amount: parseInt(amount),
      description: description || 'No description',
      time: formatEntryTime(time),
      createdAt: createdAt.toISOString(),
      dateKey: selectedDateKey,
    };
    addManualEntry(newEntry);
    setAmount('');
    setDescription('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const removeEntry = (id) => {
    hapticFeedback.medium();
    removeManualEntry(id);
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F6F8] screen-enter">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center active:scale-95">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-[#1A5276] font-black text-xl">Sync Manual Records</h1>
            <p className="text-gray-400 text-xs">Capture register entries for any day you want to review</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hidden px-4 py-4 space-y-4">
        {/* Quick Entry Form */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">New Entry</p>

          {/* Type selector */}
          <div className="flex gap-2 mb-4">
            {['Sale', 'Expense', 'Stock added'].map(type => (
              <button
                key={type}
                onClick={() => setEntryType(type)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  entryType === type
                    ? type === 'Sale' ? 'bg-[#27AE60] text-white' : type === 'Expense' ? 'bg-[#E74C3C] text-white' : 'bg-[#1A5276] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {type === 'Sale' ? '💰 Sale' : type === 'Expense' ? '📤 Expense' : '📦 Stock'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount (₹)</label>
            <div className="flex items-center mt-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#1A5276] transition-colors">
              <span className="text-3xl font-black text-gray-300 mr-2">₹</span>
              <input
                type="number"
                inputMode="numeric"
                className="flex-1 bg-transparent text-3xl font-black text-[#1A5276] placeholder-gray-300 focus:outline-none"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Description (optional)</label>
            <input
              className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1A5276]"
              placeholder="e.g. Morning chai supplies"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Time */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</label>
            <input
              type="date"
              className="w-full mt-1 mb-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#1A5276]"
              value={selectedDateKey}
              max={toDateInputValue(new Date())}
              onChange={e => setSelectedDate(new Date(`${e.target.value}T12:00:00`))}
            />
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Time</label>
            <input
              type="time"
              className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#1A5276]"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>

          {success && (
            <div className="bg-[#E9F7EF] border border-[#27AE60]/20 rounded-xl px-4 py-2.5 mb-3 text-center">
              <p className="text-[#27AE60] text-sm font-bold">✓ Entry added to {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!amount}
            className={`w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 flex items-center justify-center gap-2 ${
              amount ? 'bg-[#1A5276] text-white shadow-md' : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Plus size={18} strokeWidth={3} />
            Add to Record
          </button>
        </div>

        {/* Totals */}
        <div className="bg-[#EBF5FB] border border-[#1A5276]/10 rounded-2xl p-4 shadow-sm">
          <p className="text-[#1A5276] text-xs font-semibold uppercase tracking-wide mb-2">{selectedDateLabel}</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[#1A5276] font-black text-3xl">₹{totalManual.toLocaleString('en-IN')}</p>
              <p className="text-[#1A5276]/60 text-xs">{entriesForSelectedDate.length} entries logged manually</p>
            </div>
            <div className="text-4xl">📓</div>
          </div>
        </div>

        {/* Reassuring message */}
        <div className="bg-gray-100 rounded-2xl p-4 text-center">
          <p className="text-gray-500 text-sm leading-relaxed">
            <span className="font-semibold">Your manual records are just as important.</span><br />
            We'll never delete your register habit — we just help you capture it digitally too. 🤝
          </p>
        </div>

        {/* Today's Entries */}
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Manual Entries for {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
          <div className="space-y-2">
            {entriesForSelectedDate.map(entry => {
              const typeColor = entry.type === 'Sale' ? '#27AE60' : entry.type === 'Expense' ? '#E74C3C' : '#1A5276';
              const typeBg = entry.type === 'Sale' ? '#E9F7EF' : entry.type === 'Expense' ? '#FDEDEC' : '#EBF5FB';
              return (
                <div key={entry.id} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: typeBg }}>
                    <span className="text-sm">{entry.type === 'Sale' ? '💰' : entry.type === 'Expense' ? '📤' : '📦'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{entry.description}</p>
                    <p className="text-gray-400 text-xs">{entry.type} • {entry.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base" style={{ color: typeColor }}>
                      {entry.type === 'Expense' ? '-' : '+'}₹{entry.amount.toLocaleString('en-IN')}
                    </span>
                    <button onClick={() => removeEntry(entry.id)} className="text-gray-300">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {entriesForSelectedDate.length === 0 && (
              <div className="bg-white rounded-2xl px-4 py-6 text-center shadow-sm border border-gray-100">
                <p className="text-gray-400 text-sm font-semibold">No manual entries for this date yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
