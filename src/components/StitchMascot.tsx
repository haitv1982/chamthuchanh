import React from 'react';

// SVG Stitch Mascots crafted specifically for the Informatics Practice Lab
// Captures Stitch's iconic features: large blue & pink ears, cut in left ear, dark nose, big starry eyes, cute tuft

export function StitchGreeting({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left Ear with classic notch */}
      <path
        d="M32 52 C15 40 2 20 8 6 C16 -6 38 10 46 34 Z"
        fill="#2563EB"
      />
      <path
        d="M30 48 C18 38 8 22 13 11 C19 1 35 15 42 34 Z"
        fill="#F472B6"
      />
      {/* Ear Notch */}
      <path d="M12 18 L18 22 L11 26 Z" fill="#F8FAFC" />

      {/* Right Ear */}
      <path
        d="M88 52 C105 40 118 20 112 6 C104 -6 82 10 74 34 Z"
        fill="#2563EB"
      />
      <path
        d="M90 48 C102 38 112 22 107 11 C101 1 85 15 78 34 Z"
        fill="#F472B6"
      />

      {/* Head Tuft Hair */}
      <path d="M57 26 C55 18 52 14 49 16 C53 22 55 26 57 28 Z" fill="#1D4ED8" />
      <path d="M60 25 C60 16 63 12 66 14 C63 21 62 25 60 28 Z" fill="#1D4ED8" />

      {/* Body & Paws */}
      <ellipse cx="60" cy="98" rx="28" ry="20" fill="#2563EB" />
      <ellipse cx="60" cy="100" rx="18" ry="14" fill="#93C5FD" />
      {/* Left paw */}
      <ellipse cx="38" cy="95" rx="8" ry="6" fill="#1D4ED8" />
      {/* Right waving paw */}
      <ellipse cx="88" cy="80" rx="9" ry="8" fill="#1D4ED8" transform="rotate(-20 88 80)" />
      <circle cx="94" cy="74" r="2.5" fill="#1E3A8A" />
      <circle cx="91" cy="71" r="2.5" fill="#1E3A8A" />
      <circle cx="86" cy="72" r="2.5" fill="#1E3A8A" />

      {/* Head Base */}
      <ellipse cx="60" cy="62" rx="36" ry="30" fill="#3B82F6" />

      {/* Eye Patches (lighter blue around eyes) */}
      <ellipse cx="44" cy="58" rx="14" ry="13" fill="#60A5FA" />
      <ellipse cx="76" cy="58" rx="14" ry="13" fill="#60A5FA" />

      {/* Eyes */}
      <ellipse cx="44" cy="58" rx="9" ry="11" fill="#0F172A" />
      <ellipse cx="76" cy="58" rx="9" ry="11" fill="#0F172A" />

      {/* Eye Sparkles */}
      <circle cx="41" cy="54" r="3.5" fill="#FFFFFF" />
      <circle cx="46" cy="62" r="1.5" fill="#FFFFFF" />
      <circle cx="73" cy="54" r="3.5" fill="#FFFFFF" />
      <circle cx="78" cy="62" r="1.5" fill="#FFFFFF" />

      {/* Big Dark Alien Nose */}
      <path
        d="M52 64 C52 60 68 60 68 64 C68 70 52 70 52 64 Z"
        fill="#1E3A8A"
      />
      <ellipse cx="60" cy="65" rx="2" ry="1" fill="#93C5FD" opacity="0.6" />

      {/* Cheerful Smile */}
      <path
        d="M45 72 C50 82 70 82 75 72"
        stroke="#0F172A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Little Tooth */}
      <path d="M49 73 L51 77 L53 74 Z" fill="#FFFFFF" />
      <path d="M67 74 L69 77 L71 73 Z" fill="#FFFFFF" />

      {/* Rosy Cheeks */}
      <circle cx="36" cy="68" r="4" fill="#F472B6" opacity="0.6" />
      <circle cx="84" cy="68" r="4" fill="#F472B6" opacity="0.6" />
    </svg>
  );
}

export function StitchLaptop({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left Ear */}
      <path d="M30 48 C12 36 2 16 8 4 C16 -6 38 10 44 32 Z" fill="#2563EB" />
      <path d="M28 44 C16 34 8 18 13 8 C19 -1 35 14 40 32 Z" fill="#F472B6" />
      <path d="M11 16 L17 20 L10 24 Z" fill="#F8FAFC" />

      {/* Right Ear */}
      <path d="M90 48 C108 36 118 16 112 4 C104 -6 82 10 76 32 Z" fill="#2563EB" />
      <path d="M92 44 C104 34 112 18 107 8 C101 -1 85 14 80 32 Z" fill="#F472B6" />

      {/* Head */}
      <ellipse cx="60" cy="54" rx="34" ry="28" fill="#3B82F6" />
      <ellipse cx="44" cy="50" rx="13" ry="12" fill="#60A5FA" />
      <ellipse cx="76" cy="50" rx="13" ry="12" fill="#60A5FA" />

      {/* Cute Glasses for studying */}
      <circle cx="44" cy="50" r="12" stroke="#EF4444" strokeWidth="2.5" fill="none" />
      <circle cx="76" cy="50" r="12" stroke="#EF4444" strokeWidth="2.5" fill="none" />
      <path d="M56 50 L64 50" stroke="#EF4444" strokeWidth="2.5" />

      {/* Eyes */}
      <ellipse cx="44" cy="50" rx="7" ry="9" fill="#0F172A" />
      <ellipse cx="76" cy="50" rx="7" ry="9" fill="#0F172A" />
      <circle cx="42" cy="47" r="2.5" fill="#FFFFFF" />
      <circle cx="74" cy="47" r="2.5" fill="#FFFFFF" />

      {/* Nose */}
      <ellipse cx="60" cy="57" rx="7" ry="4" fill="#1E3A8A" />

      {/* Smile */}
      <path d="M48 64 C53 71 67 71 72 64" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

      {/* Body */}
      <ellipse cx="60" cy="88" rx="24" ry="16" fill="#2563EB" />

      {/* Cute Laptop */}
      <rect x="36" y="80" width="48" height="28" rx="3" fill="#1E293B" />
      <rect x="39" y="83" width="42" height="22" rx="2" fill="#38BDF8" />
      <circle cx="60" cy="94" r="3.5" fill="#FFFFFF" />
      {/* Laptop base */}
      <path d="M30 108 L90 108 L94 114 L26 114 Z" fill="#94A3B8" />

      {/* Paws on keyboard */}
      <circle cx="42" cy="106" r="5" fill="#1D4ED8" />
      <circle cx="78" cy="106" r="5" fill="#1D4ED8" />
    </svg>
  );
}

export function StitchCelebrate({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Golden Star with 10 Points */}
      <path
        d="M60 4 L64 16 L76 17 L67 24 L70 36 L60 29 L50 36 L53 24 L44 17 L56 16 Z"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="1.5"
      />
      <text x="60" y="27" textAnchor="middle" fontSize="11" fontWeight="900" fill="#78350F">10</text>

      {/* Left Ear */}
      <path d="M28 58 C10 46 0 24 6 12 C14 2 36 18 42 40 Z" fill="#2563EB" />
      <path d="M26 54 C14 44 6 26 11 16 C17 7 33 22 38 40 Z" fill="#F472B6" />
      <path d="M10 22 L16 26 L9 30 Z" fill="#F8FAFC" />

      {/* Right Ear */}
      <path d="M92 58 C110 46 120 24 114 12 C106 2 84 18 78 40 Z" fill="#2563EB" />
      <path d="M94 54 C106 44 114 26 109 16 C103 7 87 22 82 40 Z" fill="#F472B6" />

      {/* Hands Up in Joy */}
      <ellipse cx="28" cy="44" rx="8" ry="12" fill="#1D4ED8" transform="rotate(-30 28 44)" />
      <ellipse cx="92" cy="44" rx="8" ry="12" fill="#1D4ED8" transform="rotate(30 92 44)" />

      {/* Head */}
      <ellipse cx="60" cy="66" rx="34" ry="28" fill="#3B82F6" />
      <ellipse cx="44" cy="62" rx="13" ry="12" fill="#60A5FA" />
      <ellipse cx="76" cy="62" rx="13" ry="12" fill="#60A5FA" />

      {/* Happy squinting/starry eyes */}
      <path d="M38 60 Q44 54 50 60" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 60 Q76 54 82 60" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="60" cy="67" rx="7" ry="4" fill="#1E3A8A" />

      {/* Big Happy Open Mouth */}
      <path
        d="M46 72 C46 84 74 84 74 72 Z"
        fill="#BE123C"
        stroke="#0F172A"
        strokeWidth="2"
      />
      {/* Tongue */}
      <path d="M52 79 C56 75 64 75 68 79 Z" fill="#FB7185" />
      <path d="M48 72 L51 75 L54 72 Z" fill="#FFFFFF" />
      <path d="M66 72 L69 75 L72 72 Z" fill="#FFFFFF" />

      {/* Body */}
      <ellipse cx="60" cy="98" rx="26" ry="16" fill="#2563EB" />
      <ellipse cx="60" cy="100" rx="16" ry="10" fill="#93C5FD" />

      {/* Confetti particles */}
      <circle cx="20" cy="30" r="2.5" fill="#EC4899" />
      <rect x="98" y="24" width="4" height="4" fill="#10B981" transform="rotate(25 98 24)" />
      <circle cx="106" cy="42" r="2" fill="#F59E0B" />
      <rect x="14" y="46" width="4" height="4" fill="#6366F1" transform="rotate(45 14 46)" />
    </svg>
  );
}

export function StitchEncourage({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left Ear */}
      <path d="M32 50 C14 38 2 18 8 6 C16 -4 38 10 46 32 Z" fill="#2563EB" />
      <path d="M30 46 C18 36 8 20 13 10 C19 1 35 15 42 32 Z" fill="#F472B6" />
      <path d="M12 18 L18 22 L11 26 Z" fill="#F8FAFC" />

      {/* Right Ear */}
      <path d="M88 50 C106 38 118 18 112 6 C104 -4 82 10 74 32 Z" fill="#2563EB" />
      <path d="M90 46 C102 36 112 20 107 10 C101 1 85 15 78 32 Z" fill="#F472B6" />

      {/* Head */}
      <ellipse cx="60" cy="58" rx="34" ry="28" fill="#3B82F6" />
      <ellipse cx="44" cy="54" rx="13" ry="12" fill="#60A5FA" />
      <ellipse cx="76" cy="54" rx="13" ry="12" fill="#60A5FA" />

      {/* Thinking / Curious Eyes */}
      <ellipse cx="44" cy="54" rx="8" ry="10" fill="#0F172A" />
      <ellipse cx="76" cy="54" rx="8" ry="10" fill="#0F172A" />
      <circle cx="42" cy="50" r="3" fill="#FFFFFF" />
      <circle cx="74" cy="50" r="3" fill="#FFFFFF" />

      {/* Nose */}
      <ellipse cx="60" cy="61" rx="7" ry="4" fill="#1E3A8A" />

      {/* Determined Encouraging Smile */}
      <path d="M48 68 C54 74 66 74 72 68" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

      {/* Body & Paw touching chin like thinking */}
      <ellipse cx="60" cy="92" rx="24" ry="16" fill="#2563EB" />
      <ellipse cx="48" cy="74" rx="7" ry="9" fill="#1D4ED8" transform="rotate(30 48 74)" />
      {/* Lightbulb above head */}
      <circle cx="60" cy="18" r="7" fill="#FBBF24" />
      <path d="M57 25 L63 25" stroke="#92400E" strokeWidth="2" />
    </svg>
  );
}

export function StitchUploadMascot({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left Ear */}
      <path d="M30 52 C12 40 2 20 8 8 C16 -2 38 12 44 34 Z" fill="#2563EB" />
      <path d="M28 48 C16 38 8 22 13 12 C19 3 35 17 40 34 Z" fill="#F472B6" />
      <path d="M11 20 L17 24 L10 28 Z" fill="#F8FAFC" />

      {/* Right Ear */}
      <path d="M90 52 C108 40 118 20 112 8 C104 -2 82 12 76 34 Z" fill="#2563EB" />
      <path d="M92 48 C104 38 112 22 107 12 C101 3 85 17 80 34 Z" fill="#F472B6" />

      {/* Head */}
      <ellipse cx="60" cy="58" rx="34" ry="28" fill="#3B82F6" />
      <ellipse cx="44" cy="54" rx="13" ry="12" fill="#60A5FA" />
      <ellipse cx="76" cy="54" rx="13" ry="12" fill="#60A5FA" />

      {/* Big Eyes looking at file */}
      <ellipse cx="44" cy="54" rx="9" ry="11" fill="#0F172A" />
      <ellipse cx="76" cy="54" rx="9" ry="11" fill="#0F172A" />
      <circle cx="46" cy="50" r="3.5" fill="#FFFFFF" />
      <circle cx="78" cy="50" r="3.5" fill="#FFFFFF" />

      {/* Nose */}
      <ellipse cx="60" cy="62" rx="7" ry="4" fill="#1E3A8A" />

      {/* Smile */}
      <path d="M48 70 C54 77 66 77 72 70" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

      {/* Body */}
      <ellipse cx="60" cy="94" rx="24" ry="18" fill="#2563EB" />
      <ellipse cx="60" cy="96" rx="14" ry="12" fill="#93C5FD" />

      {/* Folder held by Stitch */}
      <rect x="42" y="80" width="36" height="26" rx="4" fill="#F59E0B" />
      <path d="M42 84 L54 84 L58 88 L78 88 L78 106 L42 106 Z" fill="#FCD34D" />
      <path d="M60 90 L60 100 M56 94 L60 90 L64 94" stroke="#78350F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Paws holding folder */}
      <circle cx="40" cy="92" r="5" fill="#1D4ED8" />
      <circle cx="80" cy="92" r="5" fill="#1D4ED8" />
    </svg>
  );
}

export function StitchDetective({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left Ear */}
      <path d="M30 52 C12 40 2 20 8 8 C16 -2 38 12 44 34 Z" fill="#2563EB" />
      <path d="M28 48 C16 38 8 22 13 12 C19 3 35 17 40 34 Z" fill="#F472B6" />
      <path d="M11 20 L17 24 L10 28 Z" fill="#F8FAFC" />

      {/* Right Ear */}
      <path d="M90 52 C108 40 118 20 112 8 C104 -2 82 12 76 34 Z" fill="#2563EB" />
      <path d="M92 48 C104 38 112 22 107 12 C101 3 85 17 80 34 Z" fill="#F472B6" />

      {/* Detective Hat */}
      <ellipse cx="60" cy="34" rx="28" ry="8" fill="#B45309" />
      <path d="M40 34 C42 16 78 16 80 34 Z" fill="#D97706" />
      <path d="M42 32 L78 32" stroke="#78350F" strokeWidth="2.5" />

      {/* Head */}
      <ellipse cx="60" cy="62" rx="34" ry="26" fill="#3B82F6" />
      <ellipse cx="44" cy="60" rx="13" ry="12" fill="#60A5FA" />
      <ellipse cx="76" cy="60" rx="13" ry="12" fill="#60A5FA" />

      {/* Eyes */}
      <ellipse cx="44" cy="60" rx="8" ry="10" fill="#0F172A" />
      <ellipse cx="76" cy="60" rx="8" ry="10" fill="#0F172A" />
      <circle cx="42" cy="57" r="3" fill="#FFFFFF" />
      <circle cx="74" cy="57" r="3" fill="#FFFFFF" />

      {/* Nose */}
      <ellipse cx="60" cy="68" rx="7" ry="4" fill="#1E3A8A" />

      {/* Smile */}
      <path d="M50 74 C55 79 65 79 70 74" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

      {/* Body */}
      <ellipse cx="60" cy="98" rx="24" ry="16" fill="#2563EB" />

      {/* Magnifying Glass */}
      <circle cx="82" cy="74" r="14" stroke="#D97706" strokeWidth="3" fill="#E0F2FE" fillOpacity="0.7" />
      <circle cx="82" cy="74" r="10" stroke="#0284C7" strokeWidth="1" strokeDasharray="2 2" fill="none" />
      <line x1="92" y1="84" x2="104" y2="96" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

export function StitchThumbsUp({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left Ear */}
      <path d="M30 48 C12 36 2 16 8 4 C16 -6 38 10 44 32 Z" fill="#2563EB" />
      <path d="M28 44 C16 34 8 18 13 8 C19 -1 35 14 40 32 Z" fill="#F472B6" />
      <path d="M11 16 L17 20 L10 24 Z" fill="#F8FAFC" />

      {/* Right Ear */}
      <path d="M90 48 C108 36 118 16 112 4 C104 -6 82 10 76 32 Z" fill="#2563EB" />
      <path d="M92 44 C104 34 112 18 107 8 C101 -1 85 14 80 32 Z" fill="#F472B6" />

      {/* Head */}
      <ellipse cx="60" cy="56" rx="34" ry="28" fill="#3B82F6" />
      <ellipse cx="44" cy="52" rx="13" ry="12" fill="#60A5FA" />
      <ellipse cx="76" cy="52" rx="13" ry="12" fill="#60A5FA" />

      {/* Big Cheerful Eyes with winks */}
      <ellipse cx="44" cy="52" rx="9" ry="11" fill="#0F172A" />
      <circle cx="42" cy="48" r="3.5" fill="#FFFFFF" />
      <circle cx="47" cy="55" r="1.5" fill="#FFFFFF" />

      {/* Winking right eye */}
      <path d="M70 52 Q76 46 82 52" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="60" cy="61" rx="7" ry="4" fill="#1E3A8A" />

      {/* Big Tooth Smile */}
      <path d="M46 68 C50 78 70 78 74 68" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 69 L53 73 L56 69 Z" fill="#FFFFFF" />

      {/* Body */}
      <ellipse cx="60" cy="94" rx="24" ry="16" fill="#2563EB" />
      <ellipse cx="60" cy="96" rx="14" ry="10" fill="#93C5FD" />

      {/* Big Thumbs Up on right hand */}
      <g transform="translate(80, 70)">
        <ellipse cx="12" cy="12" rx="7" ry="6" fill="#1D4ED8" />
        <rect x="8" y="2" width="6" height="12" rx="3" fill="#1D4ED8" />
        <path d="M11 2 C11 -2 14 -2 14 2 Z" fill="#1D4ED8" />
      </g>
    </svg>
  );
}
