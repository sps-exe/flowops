import { useState } from 'react';
import { ArrowLeft, Bell, Wifi, Globe, Shield, Info, X, Check } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-colors duration-200 relative shadow-inner ${value ? 'bg-emerald' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${value ? 'left-[26px]' : 'left-[2px]'}`} />
    </button>
  );
}

// ─── Lock Confirmation Modal ───────────────────────────────────────────────
function LockConfirmModal({ onConfirm, onClose, t }) {
  return (
    <div className="absolute inset-0 z-[100] bg-navy/60 backdrop-blur-sm flex flex-col overflow-y-auto">
      <div className="mt-auto bg-white w-full rounded-t-[32px] px-6 pt-4 pb-28 shadow-2xl animate-slide-in border-t border-white/30">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose/30">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="font-black text-navy text-xl tracking-tight">{t('settings.lock_app').split('(')[0]}</h3>
          <p className="text-slate-600 text-[13px] mt-2 font-semibold leading-relaxed px-4">
            Reports and Settings will lock down.<br />
            Owner PIN (1234) required to reopen.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-navy border border-navy rounded-[24px] py-4 text-white font-black text-[15px] active:scale-95 transition-transform shadow-lg shadow-navy/15"
          >
            {t('general.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-rose to-red-600 rounded-[24px] py-4 text-white font-black text-[15px] active:scale-95 transition-transform shadow-xl shadow-rose/30 border border-rose/40 flex items-center justify-center gap-2"
          >
            🔒 Lock App
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Business Profile Modal ───────────────────────────────────────────
function EditProfileModal({ business, onSave, onClose, t }) {
  const [form, setForm] = useState({
    fullName: business?.fullName || '',
    owner: business?.owner || '',
    location: business?.location || '',
    phone: business?.phone || '',
    gst: business?.gst || '',
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[100] bg-navy/60 backdrop-blur-sm flex flex-col overflow-y-auto">
      <div className="mt-auto bg-white w-full rounded-t-[32px] px-6 pt-4 pb-28 shadow-2xl animate-slide-in border-t border-white/20">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-navy text-xl tracking-tight">{t('settings.edit_profile')}</h3>
          <button onClick={onClose} className="w-8 h-8 bg-surface-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-95 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {[
            { key: 'fullName', label: 'Store Name', placeholder: 'e.g. Sharma Kirana Store' },
            { key: 'owner', label: 'Owner Name', placeholder: 'e.g. Rajesh Sharma' },
            { key: 'location', label: 'Location', placeholder: 'e.g. Sonipat, Haryana' },
            { key: 'phone', label: 'Phone', placeholder: 'e.g. 9876543210' },
            { key: 'gst', label: 'GST Number (optional)', placeholder: 'e.g. 06AXXPS1234H1ZE' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">{field.label}</label>
              <input
                className="w-full bg-surface-50 border border-slate-100 focus:border-navy focus:ring-1 focus:ring-navy rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-navy placeholder:text-slate-300 transition-all outline-none"
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => update(field.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-navy rounded-2xl py-4.5 text-white font-black text-[17px] active:scale-[0.98] transition-transform shadow-xl shadow-navy/20 flex items-center justify-center gap-2"
        >
          <Check size={20} />
          {t('settings.save')}
        </button>
      </div>
    </div>
  );
}

// ─── Main SettingsScreen ───────────────────────────────────────────────────
export default function SettingsScreen({ onBack, onLogout }) {
  const { setRole, language, setLanguage, state, updateBusiness, resetData, t } = useAppContext();
  const business = state.business;

  const [prefs, setPrefs] = useState({
    lowStockAlerts: true,
    eodReminder: true,
    autoRushMode: true,
    eodTime: '21:00',
    rushStart: '10:00',
  });
  const [showLockModal, setShowLockModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const updatePref = (key, val) => setPrefs(prev => ({ ...prev, [key]: val }));

  const handleLock = () => {
    setRole('staff');
    setShowLockModal(false);
    onBack();
  };

  const handleSaveProfile = (data) => {
    updateBusiness(data);
  };

  return (
    <div className="flex flex-col h-full bg-surface-50">
      {/* Modals */}
      {showLockModal && (
        <LockConfirmModal
          onConfirm={handleLock}
          onClose={() => setShowLockModal(false)}
          t={t}
        />
      )}
      {showEditProfile && (
        <EditProfileModal
          business={business}
          onSave={handleSaveProfile}
          onClose={() => setShowEditProfile(false)}
          t={t}
        />
      )}

      {/* Header */}
      <div className="bg-white px-5 pt-10 pb-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-b-[32px] relative z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-surface-50 border border-slate-100 rounded-2xl flex items-center justify-center active:scale-95 transition-transform text-slate-600">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-navy font-black text-[28px] tracking-tight">{t('settings.title')}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hidden px-5 py-5 space-y-4 pb-24">
        {/* Business Profile */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-50">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-md shadow-navy/20">
              <span className="text-white font-black text-[22px]">
                {(business?.fullName || 'MS').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-navy text-[17px] tracking-tight truncate">{business?.fullName || 'My Store'}</h2>
              <p className="text-slate-500 text-[13px] font-medium mt-0.5 truncate">👤 {business?.owner || 'Owner'}</p>
            </div>
            <button
              onClick={() => setShowEditProfile(true)}
              className="bg-surface-50 border border-slate-100 text-navy text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl active:scale-95 transition-transform flex-shrink-0"
            >
              {t('settings.edit_profile')}
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Business Type', value: business?.type || 'Kirana / General Store' },
              { label: 'Location', value: business?.location || 'Not set' },
              { label: 'Phone', value: business?.phone || 'Not set' },
              { label: 'GST Number', value: business?.gst || 'Not added' },
            ].map(item => (
              <div key={item.label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-400 text-[13px] font-semibold">{item.label}</span>
                <span className="text-navy text-[13px] font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Access Control */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-50">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center">
              <Shield size={16} className="text-navy" />
            </div>
            <p className="text-navy font-black text-[15px]">Access Control (Owner)</p>
          </div>
          <p className="text-slate-400 text-[13px] font-medium mb-4 ml-[42px]">
            Lock the app to limit access to Billing and Inventory only. Unlock PIN: 1234.
          </p>
          <button
            onClick={() => setShowLockModal(true)}
            className="w-full bg-rose/5 border border-rose/10 rounded-2xl py-3.5 text-rose font-bold text-[15px] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            {t('settings.lock_app')}
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-50">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center">
              <Bell size={16} className="text-navy" />
            </div>
            <p className="text-navy font-black text-[15px]">{t('settings.notifications') || 'Notification Preferences'}</p>
          </div>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-700 text-[15px] font-bold tracking-tight">{t('settings.low_stock_alerts') || 'Low Stock Alerts'}</p>
                <p className="text-slate-400 text-[13px] font-medium mt-0.5">{t('settings.alert_desc') || 'Alert when items go below threshold'}</p>
              </div>
              <Toggle value={prefs.lowStockAlerts} onChange={v => updatePref('lowStockAlerts', v)} />
            </div>
            <div className="w-full h-px bg-slate-50" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-700 text-[15px] font-bold tracking-tight">{t('settings.eod_reminder') || 'End-of-day Reminder'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-400 text-[13px] font-medium">{t('settings.time') || 'Time:'}</p>
                  <input
                    type="time"
                    value={prefs.eodTime}
                    onChange={e => updatePref('eodTime', e.target.value)}
                    className="text-[13px] text-navy font-black bg-surface-50 border border-slate-100 rounded-xl px-2.5 py-1 focus:outline-none focus:border-navy"
                  />
                </div>
              </div>
              <Toggle value={prefs.eodReminder} onChange={v => updatePref('eodReminder', v)} />
            </div>
            <div className="w-full h-px bg-slate-50" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-700 text-[15px] font-bold tracking-tight">{t('settings.auto_rush')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-400 text-[13px] font-medium">Activate at:</p>
                  <input
                    type="time"
                    value={prefs.rushStart}
                    onChange={e => updatePref('rushStart', e.target.value)}
                    className="text-[13px] text-rose font-black bg-surface-50 border border-slate-100 rounded-xl px-2.5 py-1 focus:outline-none focus:border-rose"
                  />
                </div>
              </div>
              <Toggle value={prefs.autoRushMode} onChange={v => updatePref('autoRushMode', v)} />
            </div>
          </div>
        </div>

        {/* Offline Mode */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-50">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center">
              <Wifi size={16} className="text-navy" />
            </div>
            <p className="text-navy font-black text-[15px]">Offline Mode Status</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald/5 border border-emerald/10 rounded-2xl px-4 py-3 mb-3">
            <div className="w-2.5 h-2.5 bg-emerald rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-emerald text-[13px] font-black uppercase tracking-wider">Offline Mode: Active</span>
            <span className="text-emerald/60 text-[11px] font-bold ml-auto">synced 4 min ago</span>
          </div>
          <p className="text-slate-400 text-[13px] font-medium leading-relaxed">
            Your data saves locally even without internet. Works on 2G too.
          </p>
        </div>

        {/* Language */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-50">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center">
              <Globe size={16} className="text-navy" />
            </div>
            <p className="text-navy font-black text-[15px]">{t('settings.language')}</p>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिंदी' },
              { id: 'mix', label: '⭐ Mix' },
            ].map(lang => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`flex-1 py-3.5 rounded-[18px] text-[13px] font-bold transition-all active:scale-[0.97] ${
                  language === lang.id ? 'bg-navy text-white shadow-lg shadow-navy/20' : 'bg-surface-50 text-slate-500 border border-slate-100 hover:bg-slate-50'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-3 text-center">{t('settings.lang_hint') || 'Mix recommended — English + Hindi labels'}</p>
        </div>

        {/* Data */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-50 mb-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center">
              <Shield size={16} className="text-navy" />
            </div>
            <p className="text-navy font-black text-[15px]">{t('settings.data_backup') || 'Data & Backup'}</p>
          </div>
          <div className="space-y-2.5">
            <button 
              onClick={() => window.print()}
              className="w-full bg-surface-50 border border-slate-100 rounded-2xl py-3.5 text-navy font-bold text-[13px] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <span className="text-lg">📄</span> {t('settings.export_pdf')}
            </button>
            <button 
              onClick={() => {
                const text = `*OneFlow Backup*\nDate: ${new Date().toLocaleDateString()}\n--- \nPlease check the app for full details.`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="w-full bg-emerald/5 border border-emerald/10 rounded-2xl py-3.5 text-emerald font-bold text-[13px] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <span className="text-lg">📱</span> {t('settings.whatsapp_backup')}
            </button>
            <button
              onClick={() => {
                if (window.confirm(t('settings.reset_confirm'))) {
                  resetData();
                }
              }}
              className="w-full bg-rose/5 border border-rose/10 rounded-2xl py-3.5 text-rose font-bold text-[13px] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <span className="text-lg">🗑️</span> {t('settings.reset_data')}
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-50 mb-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center">
              <span className="text-lg">🚪</span>
            </div>
            <p className="text-navy font-black text-[15px]">{t('settings.account') || 'Account'}</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm(t('settings.logout_confirm'))) {
                if (onLogout) onLogout();
              }
            }}
            className="w-full bg-rose border border-rose/20 rounded-2xl py-3.5 text-white font-bold text-[15px] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-rose/20"
          >
            {t('settings.log_out')}
          </button>
        </div>

        {/* Peak hours */}
        <div className="bg-navy rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0_45_68_0.2)]">
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider mb-2">Peak Hours</p>
          <p className="text-white font-black text-lg mb-1 tracking-tight">
            {business?.peakHours?.join(' | ') || '10 AM – 1 PM | 6 PM – 9 PM'}
          </p>
          <p className="text-white/80 text-[13px] font-medium mt-1">Rush Mode auto-activates at these times</p>
        </div>

        {/* Credits */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-50 text-center">
          <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-navy/20">
            <Info size={20} className="text-white" />
          </div>
          <p className="text-navy font-black text-[17px] tracking-tight">OneFlow</p>
          <p className="text-amber text-[11px] font-black uppercase tracking-wider mt-1">v1.0.0 — Prototype</p>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <p className="text-slate-500 text-[13px] font-bold">Group 44 • Principles of Design</p>
            <p className="text-slate-400 text-[11px] font-medium mt-1">Design School Prototype</p>
          </div>
        </div>

      </div>
    </div>
  );
}
