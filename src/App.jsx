import { useState, useEffect } from 'react';
import { Receipt, Package, BarChart2, Settings, BookOpen, Zap } from 'lucide-react';
import RushModeScreen from './screens/RushModeScreen';
import BillingScreen from './screens/BillingScreen';
import InventoryScreen from './screens/InventoryScreen';
import ReportsScreen from './screens/ReportsScreen';
import ManualBridgeScreen from './screens/ManualBridgeScreen';
import SettingsScreen from './screens/SettingsScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';
import KhataScreen from './screens/KhataScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import { AppProvider, useAppContext } from './store/AppContext';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

const AUTH_SESSION_KEY = 'flowops_auth_session';
const WELCOME_SEEN_KEY = 'flowops_welcome_seen';

function StartupSplash() {
  return (
    <div
      className="phone-frame relative overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #2B4F89 0%, #1E3F78 100%)',
      }}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 72% 28%, rgba(255,255,255,0.10), transparent 42%)' }} />
      <div className="startup-logo-beat w-24 h-24 rounded-full border border-white/30 bg-white/12 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-black/20">
        <Zap size={38} className="text-white" strokeWidth={2.2} />
      </div>

      <h1 className="mt-8 text-white text-5xl tracking-tight font-semibold">OneFlow</h1>
      <p className="mt-2 text-white/70 text-lg font-medium">Streamlining Operations</p>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[88px] h-2 rounded-full bg-white/22 overflow-hidden">
        <div className="startup-progress-fill h-full rounded-full bg-white/85" />
      </div>
      <p className="absolute bottom-11 text-white/70 text-sm font-medium">v 2.4.1</p>
    </div>
  );
}

// ─── Nav Tab Config ─────────────────────────────────────────────────────────
const NAV_TABS = [
  { id: 'billing', labelKey: 'nav.bills', Icon: Receipt },
  { id: 'khata', labelKey: 'nav.khata', Icon: BookOpen },
  { id: 'inventory', labelKey: 'nav.inventory', Icon: Package },
  { id: 'reports', labelKey: 'nav.insights', Icon: BarChart2 },
  { id: 'settings', labelKey: 'nav.settings', Icon: Settings },
];

// ─── Bottom Navigation ──────────────────────────────────────────────────────
function BottomNav({ active, onNavigate }) {
  const { role, t } = useAppContext();

  const visibleTabs = NAV_TABS.filter(tab => {
    if (role === 'staff' && (tab.id === 'reports' || tab.id === 'settings')) return false;
    return true;
  });

  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl flex items-center px-4 pb-safe z-40"
      style={{ height: '72px', boxShadow: '0 -4px 32px rgba(15, 45, 68, 0.05)' }}
    >
      {visibleTabs.map(({ id, labelKey, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2 active:scale-95 transition-all relative`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isActive ? 'bg-navy text-white' : 'bg-transparent text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Icon
                size={isActive ? 20 : 22}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            </div>
            <span
              className={`text-[10px] font-semibold tracking-wide ${
                isActive ? 'text-navy' : 'text-slate-400'
              }`}
            >
              {t(labelKey)}
            </span>
            {isActive && (
              <div className="absolute top-0 w-8 h-[3px] bg-amber rounded-b-full shadow-[0_2px_8px_rgba(245,158,11,0.4)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Toast Component ──────────────────────────────────────────────────────
function Toast({ message, visible, bottom }) {
  return (
    <div
      className={`absolute left-4 right-4 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{ bottom }}
    >
      <div className="bg-navy rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-2xl border border-white/10">
        <div className="w-5 h-5 bg-emerald rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-black">✓</span>
        </div>
        <span className="text-white text-sm font-semibold">{message}</span>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [activeScreen, setActiveScreen] = useState('billing');
  const [screenParams, setScreenParams] = useState({});
  const [rushModeActive, setRushModeActive] = useState(false);
  const [rushModeStart, setRushModeStart] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [screenHistory, setScreenHistory] = useState(['billing']);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showStartupSplash, setShowStartupSplash] = useState(true);
  const [onboarded, setOnboarded] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    return localStorage.getItem(WELCOME_SEEN_KEY) === 'true';
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowStartupSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Firebase auth listener
  useEffect(() => {
    if (!auth) {
      try {
        const raw = localStorage.getItem(AUTH_SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setUser(parsed);
          const hasOnboarded = localStorage.getItem(`flowops_onboarded_${parsed.uid}`);
          setOnboarded(!!hasOnboarded);
        }
      } catch (err) {
        console.warn('Could not restore local auth session', err);
      } finally {
        setAuthLoading(false);
      }

      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(prev => {
          // Prevent race condition on registration where updateProfile hasn't finished
          const currentStoreName = prev?.storeName && prev.storeName !== 'My OneFlow Store' ? prev.storeName : null;
          const newStoreName = currentUser.displayName || currentStoreName || 'My OneFlow Store';
          
          const nextUser = {
            uid: currentUser.uid,
            storeName: newStoreName,
            email: currentUser.email,
          };
          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(nextUser));
          return nextUser;
        });
        
        const hasOnboarded = localStorage.getItem(`flowops_onboarded_${currentUser.uid}`);
        setOnboarded(!!hasOnboarded);
      } else {
        setUser(null);
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(nextUser));
    const hasOnboarded = localStorage.getItem(`flowops_onboarded_${nextUser.uid}`);
    setOnboarded(!!hasOnboarded);
  };

  const handleLogout = async () => {
    // Sign out of Firebase if configured
    if (auth) {
      try { await signOut(auth); } catch (e) { console.warn('signOut error', e); }
    }
    // Always clear local session
    localStorage.removeItem(AUTH_SESSION_KEY);
    setUser(null);
    setOnboarded(true); // reset so next user gets onboarding check fresh
  };

  const handleWelcomeContinue = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setHasSeenWelcome(true);
  };

  const showToast = (message, duration = 2500) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), duration);
  };

  const navigateTo = (screen, params = {}) => {
    setActiveScreen(screen);
    setScreenParams(params);
    setScreenHistory(prev => [...prev, screen]);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = screenHistory.slice(0, -1);
      setScreenHistory(newHistory);
      setActiveScreen(newHistory[newHistory.length - 1]);
    } else {
      setActiveScreen('billing');
    }
  };

  const activateRushMode = () => {
    setRushModeActive(true);
    setRushModeStart(Date.now());
  };

  const deactivateRushMode = () => {
    setRushModeActive(false);
    showToast('Rush Mode deactivated');
  };

  const navTabScreens = ['billing', 'khata', 'inventory', 'reports', 'settings'];
  const isNavVisible = !rushModeActive && navTabScreens.includes(activeScreen);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`flowops_onboarded_${user.uid}`, 'true');
    }
    setOnboarded(true);
  };

  // ─── Auth Loading ─────────────────────────────────────────────────────────
  if (showStartupSplash || authLoading) {
    return <StartupSplash />;
  }

  // ─── First-time Welcome (before login) ───────────────────────────────────
  if (!hasSeenWelcome) {
    return (
      <div className="phone-frame relative">
        <WelcomeScreen onContinue={handleWelcomeContinue} />
      </div>
    );
  }

  // ─── Auth Screen ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="phone-frame relative">
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // ─── Onboarding ───────────────────────────────────────────────────────────
  if (!onboarded) {
    return (
      <div className="phone-frame relative">
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // ─── Main App ──────────────────────────────────────────────────
  return (
    <div
      className="phone-frame relative"
      style={{ background: rushModeActive ? '#0B1C2E' : '#F4F6F8' }}
    >
      <AppProvider user={user}>
        {/* Rush Mode Overlay */}
        {rushModeActive && (
          <RushModeScreen onExit={deactivateRushMode} rushModeStart={rushModeStart} />
        )}

        {/* Main Screen Content */}
        {!rushModeActive && (
          <div
            key={activeScreen}
            className="absolute inset-0 overflow-hidden screen-enter"
            style={{ paddingBottom: isNavVisible ? '76px' : 0 }}
          >
            {activeScreen === 'billing' && (
              <div className="h-full overflow-hidden flex flex-col">
                <BillingScreen
                  onNavigate={navigateTo}
                  onRushMode={activateRushMode}
                  showToast={showToast}
                />
              </div>
            )}

            {activeScreen === 'inventory' && (
              <div className="h-full overflow-hidden flex flex-col">
                <InventoryScreen onBack={goBack} initialFilter={screenParams.filter} />
              </div>
            )}

            {activeScreen === 'reports' && (
              <div className="h-full overflow-hidden flex flex-col">
                <ReportsScreen onNavigate={navigateTo} />
              </div>
            )}

            {activeScreen === 'manual' && (
              <div className="h-full overflow-y-auto scroll-hidden screen-content">
                <ManualBridgeScreen onBack={goBack} />
              </div>
            )}

            {activeScreen === 'settings' && (
              <div className="h-full overflow-hidden flex flex-col">
                <SettingsScreen onBack={goBack} onLogout={handleLogout} />
              </div>
            )}

            {activeScreen === 'khata' && (
              <div className="h-full overflow-hidden flex flex-col">
                <KhataScreen onBack={goBack} />
              </div>
            )}
          </div>
        )}

        {/* Bottom Navigation */}
        {isNavVisible && (
          <BottomNav
            active={activeScreen}
            onNavigate={(screen) => {
              setScreenHistory([screen]);
              setActiveScreen(screen);
              setScreenParams({});
            }}
          />
        )}

        {/* Toast */}
        <Toast message={toast.message} visible={toast.visible} bottom={isNavVisible ? '84px' : '24px'} />
      </AppProvider>
    </div>
  );
}
