import { useState } from 'react';
import { Mail, Lock, Store, ArrowRight, Zap } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { hapticFeedback } from '../utils/haptics';

const AUTH_COPY = {
  en: {
    tagline: 'The MSME integration layer.',
    login: 'Login',
    register: 'Register',
    demoBanner: 'Demo mode: Firebase Auth keys are missing. Use Developer Sandbox below.',
    storeName: 'Store Name',
    email: 'Email address',
    password: 'Password',
    authenticating: 'Authenticating...',
    loginBtn: 'Login to Store',
    registerBtn: 'Create Store Account',
    sandbox: 'Developer Sandbox (Skip)',
    sandboxStoreName: 'OneFlow Sandbox',
    sandboxError: 'Firebase Auth is not configured. Use Developer Sandbox or add valid Firebase keys.',
    storeRequired: 'Store Name is required',
    errInvalidCred: 'Invalid email or password.',
    errEmailUsed: 'Email is already registered.',
    errWeakPassword: 'Password should be at least 6 characters.',
    errAuthFail: 'Authentication failed. Check your connection.',
    errOpNotAllowed: 'Email/Password login is disabled in Firebase. Enable it in Authentication > Sign-in method.',
    errInvalidApiKey: 'Invalid Firebase API key. Check your .env.local values.',
    errConfigMissing: 'Firebase Auth backend not ready. Enable Email/Password in Authentication > Sign-in method, then add localhost in Authentication > Settings > Authorized domains.',
    errNetwork: 'Network error. Please check internet and try again.',
    errTooMany: 'Too many attempts. Please wait and try again.',
    errUnauthorizedDomain: 'This domain is not authorized in Firebase Auth. Add localhost in Authorized domains.',
    fallbackStore: 'My Store',
  },
  hi: {
    tagline: 'MSME के लिए इंटीग्रेशन लेयर।',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    demoBanner: 'डेमो मोड: Firebase Auth keys नहीं मिलीं। नीचे Developer Sandbox इस्तेमाल करें।',
    storeName: 'दुकान का नाम',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    authenticating: 'सत्यापित किया जा रहा है...',
    loginBtn: 'स्टोर में लॉगिन करें',
    registerBtn: 'स्टोर अकाउंट बनाएं',
    sandbox: 'डेवलपर सैंडबॉक्स (स्किप)',
    sandboxStoreName: 'OneFlow सैंडबॉक्स',
    sandboxError: 'Firebase Auth configured नहीं है। Developer Sandbox इस्तेमाल करें या सही Firebase keys जोड़ें।',
    storeRequired: 'दुकान का नाम ज़रूरी है',
    errInvalidCred: 'ईमेल या पासवर्ड गलत है।',
    errEmailUsed: 'यह ईमेल पहले से रजिस्टर्ड है।',
    errWeakPassword: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
    errAuthFail: 'ऑथेंटिकेशन फेल हुआ। कनेक्शन जांचें।',
    errOpNotAllowed: 'Firebase में Email/Password login बंद है। Authentication > Sign-in method में इसे चालू करें।',
    errInvalidApiKey: 'Firebase API key गलत है। .env.local की वैल्यू जांचें।',
    errConfigMissing: 'Firebase Auth backend तैयार नहीं है। Authentication > Sign-in method में Email/Password चालू करें, फिर Authentication > Settings > Authorized domains में localhost जोड़ें।',
    errNetwork: 'नेटवर्क एरर। इंटरनेट जांचकर फिर कोशिश करें।',
    errTooMany: 'बहुत ज़्यादा प्रयास हुए। थोड़ा रुककर फिर कोशिश करें।',
    errUnauthorizedDomain: 'यह domain Firebase Auth में allowed नहीं है। Authorized domains में localhost जोड़ें।',
    fallbackStore: 'मेरी दुकान',
  },
  mix: {
    tagline: 'MSME stores ke liye integration layer.',
    login: 'Login',
    register: 'Register',
    demoBanner: 'Demo mode: Firebase Auth keys missing hain. Neeche Developer Sandbox use karo.',
    storeName: 'Store Name / दुकान नाम',
    email: 'Email address / ईमेल',
    password: 'Password / पासवर्ड',
    authenticating: 'Authenticating...',
    loginBtn: 'Login to Store',
    registerBtn: 'Create Store Account',
    sandbox: 'Developer Sandbox (Skip)',
    sandboxStoreName: 'OneFlow Sandbox',
    sandboxError: 'Firebase Auth configured nahi hai. Developer Sandbox use karo ya valid Firebase keys add karo.',
    storeRequired: 'Store Name zaroori hai',
    errInvalidCred: 'Email ya password galat hai.',
    errEmailUsed: 'Email pehle se registered hai.',
    errWeakPassword: 'Password kam se kam 6 characters ka hona chahiye.',
    errAuthFail: 'Authentication failed. Connection check karo.',
    errOpNotAllowed: 'Firebase me Email/Password login off hai. Authentication > Sign-in method me enable karo.',
    errInvalidApiKey: 'Firebase API key invalid hai. .env.local values check karo.',
    errConfigMissing: 'Firebase Auth backend ready nahi hai. Authentication > Sign-in method me Email/Password enable karo, phir Authentication > Settings > Authorized domains me localhost add karo.',
    errNetwork: 'Network error. Internet check karke phir try karo.',
    errTooMany: 'Bahut attempts ho gaye. Thoda wait karke dubara try karo.',
    errUnauthorizedDomain: 'Yeh domain Firebase Auth me authorized nahi hai. Authorized domains me localhost add karo.',
    fallbackStore: 'My Store',
  },
};

const mapAuthError = (code, copy) => {
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return copy.errInvalidCred;
  if (code === 'auth/email-already-in-use') return copy.errEmailUsed;
  if (code === 'auth/weak-password') return copy.errWeakPassword;
  if (code === 'auth/operation-not-allowed') return copy.errOpNotAllowed;
  if (code === 'auth/invalid-api-key') return copy.errInvalidApiKey;
  if (code === 'auth/configuration-not-found') return copy.errConfigMissing;
  if (code === 'auth/network-request-failed') return copy.errNetwork;
  if (code === 'auth/too-many-requests') return copy.errTooMany;
  if (code === 'auth/unauthorized-domain') return copy.errUnauthorizedDomain;
  return copy.errAuthFail;
};

export default function AuthScreen({ onLoginSuccess }) {
  const language = localStorage.getItem('flowops_lang') || 'mix';
  const copy = AUTH_COPY[language] || AUTH_COPY.mix;
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSandboxLogin = (e) => {
    e.preventDefault();
    hapticFeedback.success();
    // Sandbox bypass
    onLoginSuccess({
      uid: "sandbox-123456",
      storeName: copy.sandboxStoreName,
      email: "sandbox@flowops.dev"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!auth || !isFirebaseConfigured) {
      setError(copy.sandboxError);
      return;
    }

    setLoading(true);
    hapticFeedback.light();

    try {
      if (isLogin) {
        // Authenticate existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        hapticFeedback.success();
        // Extract basic details for the global state
        onLoginSuccess({
          uid: userCredential.user.uid,
          storeName: userCredential.user.displayName || copy.fallbackStore,
          email: userCredential.user.email
        });
      } else {
        // Register new user (new store owner)
        if (!storeName.trim()) {
          setError(copy.storeRequired);
          setLoading(false);
          return;
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Save the store name to the Firebase user profile
        await updateProfile(userCredential.user, {
          displayName: storeName
        });
        
        hapticFeedback.success();
        onLoginSuccess({
          uid: userCredential.user.uid,
          storeName: storeName,
          email: userCredential.user.email
        });
      }
    } catch (err) {
      hapticFeedback.error();
      console.error(err);
      setError(mapAuthError(err.code, copy));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-navy text-white">
      {/* Dynamic Header */}
      <div className="flex-[0.45] flex flex-col justify-center items-center px-6 pt-12 pb-6">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/10">
          <Zap size={32} className="text-navy" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black mb-2 tracking-tight">OneFlow</h1>
        <p className="text-blue-100 text-center text-sm font-medium px-4 opacity-95">
          {copy.tagline}
        </p>
      </div>

      {/* Auth Form Box */}
      <div className="flex-[0.55] bg-white text-slate-800 rounded-t-[32px] px-6 pt-8 pb-10 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] flex flex-col">
        {/* Pill Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-full mb-8">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${isLogin ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {copy.login}
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${!isLogin ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {copy.register}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
            {error}
          </div>
        )}

        {!isFirebaseConfigured && (
          <div className="bg-amber/10 border border-amber/30 text-amber-700 px-4 py-3 rounded-xl text-xs font-semibold mb-6">
            {copy.demoBanner}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
          {!isLogin && (
            <div className="relative">
              <Store size={20} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={copy.storeName}
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 focus:bg-white transition-all"
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="relative">
            <Mail size={20} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="email"
              placeholder={copy.email}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 focus:bg-white transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock size={20} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="password"
              placeholder={copy.password}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 focus:bg-white transition-all"
              required
            />
          </div>

          <div className="mt-auto pt-6">
            <button 
              type="submit" 
              disabled={loading || !isFirebaseConfigured}
              className="w-full bg-navy text-white rounded-2xl py-4 font-bold text-base flex flex-row items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 shadow-lg shadow-navy/20"
            >
              {loading ? copy.authenticating : (isLogin ? copy.loginBtn : copy.registerBtn)}
              {!loading && <ArrowRight size={20} />}
            </button>
            
            {!isFirebaseConfigured && (
              <div className="mt-6 flex justify-center">
                <button 
                  type="button"
                  onClick={handleSandboxLogin}
                  className="text-xs text-slate-400 font-medium active:scale-95 transition-transform hover:text-slate-600 px-4 py-2"
                >
                  {copy.sandbox}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
