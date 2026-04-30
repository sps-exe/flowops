import { useState } from 'react';
import { ArrowRight, Languages, Zap } from 'lucide-react';

const LANG_OPTIONS = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिंदी' },
  { id: 'mix', label: 'Mix (EN + HI)' },
];

const LANG_LABELS_BY_MODE = {
  en: { en: 'English', hi: 'Hindi', mix: 'Mix' },
  hi: { en: 'अंग्रेज़ी', hi: 'हिंदी', mix: 'मिक्स' },
  mix: { en: 'English', hi: 'हिंदी', mix: 'Mix (EN + HI)' },
};

const WELCOME_COPY = {
  en: {
    badge: 'WELCOME',
    subtitle: 'Choose your language and get started.',
    languageLabel: 'Choose language',
    continue: 'Continue',
  },
  hi: {
    badge: 'स्वागत है',
    subtitle: 'अपनी भाषा चुनें और शुरू करें।',
    languageLabel: 'भाषा चुनें',
    continue: 'आगे बढ़ें',
  },
  mix: {
    badge: 'WELCOME / स्वागत',
    subtitle: 'Choose language aur shuru karo.',
    languageLabel: 'Choose language / भाषा चुनें',
    continue: 'Continue / आगे',
  },
};

export default function WelcomeScreen({ onContinue }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('flowops_lang') || 'mix');
  const copy = WELCOME_COPY[language] || WELCOME_COPY.mix;
  const modeLabels = LANG_LABELS_BY_MODE[language] || LANG_LABELS_BY_MODE.mix;

  const handleSelectLanguage = (langId) => {
    setLanguage(langId);
    localStorage.setItem('flowops_lang', langId);
  };

  return (
    <div className="absolute inset-0 bg-navy text-white px-6 pt-10 pb-8 flex flex-col">
      <div className="flex flex-col items-center justify-center mt-1">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-black/15 mb-3">
          <Zap size={24} className="text-navy" strokeWidth={2.5} />
        </div>
        <p className="text-white text-[32px] leading-none font-black tracking-tight">OneFlow</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center -translate-y-4">
        <h1 className="text-[64px] font-black tracking-tight leading-[0.9] mb-4">
          {language === 'hi' ? 'स्वागत' : 'Welcome'}
        </h1>
        <p className="text-blue-100 text-[16px] leading-relaxed font-medium max-w-[320px]">
          {copy.subtitle}
        </p>
      </div>

      <div className="w-full bg-white text-slate-800 rounded-[30px] px-5 pt-6 pb-6 shadow-[0_8px_32px_rgba(0,0,0,0.16)] mt-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
            <Languages size={16} className="text-navy" />
          </div>
          <div>
            <p className="text-[12px] font-black text-navy tracking-tight">{copy.languageLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {LANG_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectLanguage(option.id)}
              className={`rounded-2xl py-3 text-[13px] font-bold transition-all active:scale-95 border ${
                language === option.id
                  ? 'bg-navy text-white border-navy shadow-md shadow-navy/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {modeLabels[option.id] || option.label}
            </button>
          ))}
        </div>

        <button
          onClick={onContinue}
          className="w-full bg-navy text-white rounded-2xl py-4 font-black text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-navy/20"
        >
          {copy.continue}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
