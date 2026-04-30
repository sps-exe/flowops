import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const slides = [
  {
    emoji: '🏪',
    svgContent: (
      <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
        <rect x="60" y="70" width="160" height="90" rx="4" fill="#2471A3" opacity="0.15"/>
        <rect x="70" y="80" width="140" height="80" rx="3" fill="#1A5276" opacity="0.25"/>
        <rect x="80" y="60" width="120" height="25" rx="4" fill="#F39C12"/>
        <text x="140" y="77" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">KIRANA STORE</text>
        <rect x="85" y="100" width="110" height="4" rx="2" fill="#1A5276" opacity="0.4"/>
        <rect x="85" y="118" width="110" height="4" rx="2" fill="#1A5276" opacity="0.4"/>
        <rect x="85" y="136" width="110" height="4" rx="2" fill="#1A5276" opacity="0.4"/>
        {[95,110,125,140,155,165,175].map((x, i) => (
          <rect key={i} x={x} y={i % 2 === 0 ? 90 : 92} width="9" height={i % 2 === 0 ? 10 : 8} rx="2" fill={['#E74C3C','#F39C12','#27AE60','#1A5276','#E74C3C','#F39C12','#27AE60'][i]} opacity="0.8"/>
        ))}
        <circle cx="60" cy="105" r="12" fill="#F39C12" opacity="0.9"/>
        <rect x="52" y="117" width="16" height="25" rx="4" fill="#1A5276" opacity="0.8"/>
        <circle cx="220" cy="115" r="8" fill="#27AE60" opacity="0.7"/>
        <rect x="215" y="123" width="10" height="17" rx="3" fill="#27AE60" opacity="0.5"/>
        <rect x="55" y="100" width="8" height="12" rx="2" fill="#1A5276"/>
        <rect x="56" y="102" width="6" height="8" rx="1" fill="#F39C12" opacity="0.8"/>
        <text x="150" y="170" textAnchor="middle" fill="#E74C3C" fontSize="16" fontWeight="bold" opacity="0.7">⚡⚡⚡</text>
        {[190, 200, 210].map((x, i) => (
          <circle key={i} cx={x} cy={138} r="6" fill="#2471A3" opacity={0.5 + i * 0.1}/>
        ))}
      </svg>
    ),
    title: 'Made for your busiest hours',
    body: 'OneFlow works during peak hour chaos so you don\'t have to juggle 3 apps at once.',
    color: '#F39C12',
  },
  {
    emoji: '📓',
    svgContent: (
      <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
        <rect x="30" y="40" width="90" height="120" rx="6" fill="#F39C12" opacity="0.2"/>
        <rect x="36" y="46" width="78" height="108" rx="4" fill="white"/>
        <rect x="30" y="40" width="12" height="120" rx="3" fill="#F39C12" opacity="0.5"/>
        {[60,75,90,105,120,135,150].map(y => (
          <rect key={y} x="46" y={y} width="58" height="2" rx="1" fill="#E5E7EB"/>
        ))}
        <rect x="46" y="60" width="35" height="2" rx="1" fill="#9CA3AF" opacity="0.8"/>
        <rect x="46" y="75" width="50" height="2" rx="1" fill="#9CA3AF" opacity="0.6"/>
        <rect x="46" y="90" width="30" height="2" rx="1" fill="#9CA3AF" opacity="0.8"/>
        <text x="85" y="70" fill="#27AE60" fontSize="10" fontWeight="bold" opacity="0.9">₹850</text>
        <text x="80" y="95" fill="#27AE60" fontSize="10" fontWeight="bold" opacity="0.8">₹200</text>
        <path d="M 130 100 Q 150 80 160 100" stroke="#1A5276" strokeWidth="2.5" fill="none" strokeDasharray="4 3" opacity="0.7"/>
        <polygon points="155,97 163,101 157,107" fill="#1A5276" opacity="0.7"/>
        <rect x="165" y="50" width="75" height="120" rx="12" fill="white" stroke="#1A5276" strokeWidth="2" opacity="0.9"/>
        <rect x="169" y="62" width="67" height="96" rx="6" fill="#F4F6F8"/>
        <rect x="169" y="62" width="67" height="20" rx="6" fill="#1A5276"/>
        <text x="202" y="76" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">OneFlow</text>
        {[90, 102, 114, 126, 138].map(y => (
          <rect key={y} x="175" y={y} width="55" height="8" rx="3" fill="white"/>
        ))}
        <text x="202" y="97" textAnchor="middle" fill="#27AE60" fontSize="7" fontWeight="bold">₹850 — Sale</text>
        <text x="202" y="109" textAnchor="middle" fill="#E74C3C" fontSize="7" fontWeight="bold">₹200 — Exp</text>
        <circle cx="145" cy="100" r="6" fill="#27AE60" opacity="0.8"/>
        <text x="145" y="104" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">✓</text>
      </svg>
    ),
    title: 'Keep your register. We\'ll sync it.',
    body: 'We know you trust your notebook. Keep using it — just tell us what you wrote and we\'ll do the rest.',
    color: '#27AE60',
  },
  {
    emoji: '📒',
    svgContent: (
      <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
        {/* Ledger background */}
        <rect x="50" y="25" width="180" height="140" rx="16" fill="white" opacity="0.95"/>
        <rect x="50" y="25" width="180" height="35" rx="16" fill="#E74C3C"/>
        <rect x="50" y="48" width="180" height="12" rx="0" fill="#E74C3C"/>
        <text x="140" y="48" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">KHATA (उधार)</text>
        {/* Customer rows */}
        {[
          { name: 'Ramesh Ji', due: '₹1,200', color: '#E74C3C' },
          { name: 'Sunita Devi', due: '₹450', color: '#F39C12' },
          { name: 'Mohan Lal', due: '₹800', color: '#E74C3C' },
        ].map((c, i) => (
          <g key={i}>
            <rect x="62" y={70 + i * 30} width="156" height="22" rx="6" fill={i === 1 ? '#FEF9E7' : '#FDEDEC'}/>
            <text x="72" y={85 + i * 30} fill="#374151" fontSize="8" fontWeight="bold">{c.name}</text>
            <text x="170" y={85 + i * 30} fill={c.color} fontSize="9" fontWeight="900">{c.due}</text>
            <rect x="195" y={73 + i * 30} width="18" height="16" rx="4" fill="#27AE60" opacity="0.9"/>
            <text x="204" y={84 + i * 30} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">✓</text>
          </g>
        ))}
        {/* WhatsApp reminder icon */}
        <circle cx="75" cy="155" r="10" fill="#27AE60"/>
        <text x="75" y="159" textAnchor="middle" fill="white" fontSize="10">📱</text>
        <text x="100" y="158" fill="#27AE60" fontSize="7" fontWeight="bold">Reminder bhejo</text>
      </svg>
    ),
    title: 'Udhaar? No problem.',
    body: 'Give credit to regulars. Track who owes what. Collect later with one tap. Send WhatsApp reminders too.',
    color: '#E74C3C',
  },
  {
    emoji: '📊',
    svgContent: (
      <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
        <rect x="40" y="20" width="200" height="145" rx="16" fill="white" opacity="0.95"/>
        <rect x="40" y="20" width="200" height="40" rx="16" fill="#1A5276"/>
        <rect x="40" y="45" width="200" height="15" rx="0" fill="#1A5276"/>
        <text x="80" y="43" fill="white" fontSize="9" opacity="0.7">Today's Profit</text>
        <text x="140" y="100" textAnchor="middle" fill="#27AE60" fontSize="36" fontWeight="900">₹2,847</text>
        <rect x="55" y="112" width="170" height="8" rx="4" fill="#E5E7EB"/>
        <rect x="55" y="112" width="120" height="8" rx="4" fill="#27AE60"/>
        <text x="140" y="128" textAnchor="middle" fill="#6B7280" fontSize="8">71% of daily goal</text>
        <rect x="55" y="136" width="50" height="22" rx="6" fill="#F4F6F8"/>
        <rect x="113" y="136" width="55" height="22" rx="6" fill="#F4F6F8"/>
        <rect x="176" y="136" width="50" height="22" rx="6" fill="#F4F6F8"/>
        <text x="80" y="150" textAnchor="middle" fill="#1A5276" fontSize="8" fontWeight="bold">34 Bills</text>
        <text x="140" y="150" textAnchor="middle" fill="#1A5276" fontSize="8" fontWeight="bold">₹8,200</text>
        <text x="201" y="150" textAnchor="middle" fill="#F39C12" fontSize="8" fontWeight="bold">₹6,450</text>
        <ellipse cx="140" cy="96" rx="60" ry="15" fill="#27AE60" opacity="0.05"/>
        <circle cx="218" cy="32" r="5" fill="#F39C12" opacity="0.9"/>
        <circle cx="218" cy="32" r="8" fill="#F39C12" opacity="0.2"/>
        <text x="198" y="36" textAnchor="end" fill="#F39C12" fontSize="7" fontWeight="bold">LIVE</text>
      </svg>
    ),
    title: 'Know your profit — right now',
    body: 'Live profit meter so you always know if today was a good day. No more guessing at the end of the month.',
    color: '#27AE60',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[current];
  
  // Map old hex codes to new theme temporarily if they aren't fully replaced in SVG
  const themeColors = ['#F59E0B', '#10B981', '#EF4444', '#10B981'];
  const activeColor = themeColors[current];

  return (
    <div className="flex flex-col h-full bg-white screen-enter">
      {/* Skip */}
      <div className="flex justify-end px-5 pt-10">
        <button onClick={onComplete} className="text-slate-500 text-sm font-semibold active:scale-95 transition-transform hover:text-slate-700">
          Skip
        </button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 float-anim">
        <div className="w-full mb-6 relative">
          {/* Subtle glow behind illustration */}
          <div className="absolute inset-0 blur-3xl opacity-20 bg-blend-screen" style={{ backgroundColor: activeColor }} />
          <div className="relative z-10">
            {slide.svgContent}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-12">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '32px' : '8px',
                height: '8px',
                background: i === current ? activeColor : '#E2E8F0',
              }}
            />
          ))}
        </div>

        <h2 className="text-navy font-black text-3xl tracking-tight leading-tight mb-4 text-center">
          {slide.title}
        </h2>
        <p className="text-slate-600 text-[15px] leading-relaxed text-center mb-10 font-medium">
          {slide.body}
        </p>

        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl font-black text-lg text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl"
          style={{ 
            background: `linear-gradient(135deg, ${activeColor}, ${activeColor}E6)`,
            boxShadow: `0 8px 24px ${activeColor}33`
          }}
        >
          {current < slides.length - 1 ? (
            <>Next <ChevronRight size={22} strokeWidth={3} /></>
          ) : (
            '🚀 Get Started'
          )}
        </button>
      </div>
    </div>
  );
}
