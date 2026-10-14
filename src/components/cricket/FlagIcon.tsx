import React from 'react';

interface FlagIconProps {
  code: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function FlagIcon({ code, name, size = 'md', className = '' }: FlagIconProps) {
  const normCode = (code || '').toUpperCase().trim();
  const normName = (name || '').toUpperCase().trim();

  const sizeMap = {
    xs: 'w-4 h-4 text-[8px]',
    sm: 'w-5 h-5 text-[9px]',
    md: 'w-6 h-6 text-[10px]',
    lg: 'w-8 h-8 text-xs',
  };

  const dimension = sizeMap[size];
  const baseWrap = `inline-block rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-200/60 dark:border-slate-700/80 ${dimension} ${className}`;

  // Helper matching both code and name
  const is = (key: string) => normCode === key || normName.includes(key);

  // 1. Maldives
  if (is('MDV') || is('MALDIVES')) {
    return (
      <span className={baseWrap} title={name || 'Maldives'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#D21034" />
          <rect x="6" y="6" width="24" height="24" rx="2" fill="#007E3A" />
          <path d="M 21,11 A 7,7 0 0,0 21,25 A 5.5,5.5 0 0,1 21,11 Z" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 2. Saudi Arabia
  if (is('KSA') || is('SAUDI')) {
    return (
      <span className={baseWrap} title={name || 'Saudi Arabia'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#006C35" />
          {/* Stylized Shahada Script lines */}
          <path d="M 8 13 Q 18 10 28 13 M 10 16 Q 18 14 26 16 M 12 18 Q 18 17 24 18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Saber Sword */}
          <path d="M 9 24 L 27 24 M 9 22 L 9 26 M 27 24 L 25 22.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      </span>
    );
  }

  // 3. Hong Kong
  if (is('HK') || is('HONG KONG')) {
    return (
      <span className={baseWrap} title={name || 'Hong Kong'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#C8102E" />
          {/* Bauhinia Flower Petals */}
          <circle cx="18" cy="18" r="3.5" fill="#FFFFFF" />
          <path d="M 18,18 C 18,10 14,8 18,6 C 22,8 18,10 18,18 Z" fill="#FFFFFF" />
          <path d="M 18,18 C 26,16 28,12 30,15 C 28,19 25,18 18,18 Z" fill="#FFFFFF" />
          <path d="M 18,18 C 24,24 26,27 23,29 C 20,28 20,24 18,18 Z" fill="#FFFFFF" />
          <path d="M 18,18 C 12,24 10,27 13,29 C 16,28 16,24 18,18 Z" fill="#FFFFFF" />
          <path d="M 18,18 C 10,16 8,12 6,15 C 8,19 11,18 18,18 Z" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 4. Singapore
  if (is('SIN') || is('SINGAPORE')) {
    return (
      <span className={baseWrap} title={name || 'Singapore'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="18" fill="#EE2737" />
          <rect y="18" width="36" height="18" fill="#FFFFFF" />
          {/* Crescent */}
          <path d="M 12,6 A 5.5,5.5 0 0,0 12,16 A 4.3,4.3 0 0,1 12,6 Z" fill="#FFFFFF" />
          {/* 5 small stars */}
          <circle cx="14" cy="9" r="0.9" fill="#FFFFFF" />
          <circle cx="16" cy="11" r="0.9" fill="#FFFFFF" />
          <circle cx="15.5" cy="13.5" r="0.9" fill="#FFFFFF" />
          <circle cx="13" cy="13" r="0.9" fill="#FFFFFF" />
          <circle cx="12.5" cy="11" r="0.9" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 5. Thailand
  if (is('THA') || is('THAILAND')) {
    return (
      <span className={baseWrap} title={name || 'Thailand'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="6" fill="#A51931" />
          <rect y="6" width="36" height="6" fill="#F4F5F8" />
          <rect y="12" width="36" height="12" fill="#2D2A4A" />
          <rect y="24" width="36" height="6" fill="#F4F5F8" />
          <rect y="30" width="36" height="6" fill="#A51931" />
        </svg>
      </span>
    );
  }

  // 6. Bahrain
  if (is('BHR') || is('BAHRAIN')) {
    return (
      <span className={baseWrap} title={name || 'Bahrain'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#DA291C" />
          <polygon points="0,0 9,0 14,3.6 9,7.2 14,10.8 9,14.4 14,18 9,21.6 14,25.2 9,28.8 14,32.4 9,36 0,36" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 7. Qatar
  if (is('QAT') || is('QATAR')) {
    return (
      <span className={baseWrap} title={name || 'Qatar'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#8A1538" />
          <polygon points="0,0 8,0 13,2 8,4 13,6 8,8 13,10 8,12 13,14 8,16 13,18 8,20 13,22 8,24 13,26 8,28 13,30 8,32 13,34 8,36 0,36" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 8. Myanmar
  if (is('MYA') || is('MYANMAR') || is('BURMA')) {
    return (
      <span className={baseWrap} title={name || 'Myanmar'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="12" fill="#FECB00" />
          <rect y="12" width="36" height="12" fill="#34B233" />
          <rect y="24" width="36" height="12" fill="#EA2839" />
          {/* Big White Star */}
          <polygon points="18,7 20.8,15.2 29.5,15.2 22.4,20.2 25.1,28.5 18,23.3 10.9,28.5 13.6,20.2 6.5,15.2 15.2,15.2" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 9. Mongolia
  if (is('MGL') || is('MONGOLIA')) {
    return (
      <span className={baseWrap} title={name || 'Mongolia'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="12" height="36" fill="#E4002B" />
          <rect x="12" width="12" height="36" fill="#0066B3" />
          <rect x="24" width="12" height="36" fill="#E4002B" />
          {/* Soyombo symbol (gold) */}
          <circle cx="6" cy="11" r="2" fill="#FFD700" />
          <rect x="4" y="14" width="4" height="2" fill="#FFD700" />
          <rect x="4" y="17" width="4" height="8" fill="#FFD700" />
        </svg>
      </span>
    );
  }

  // 10. Bhutan
  if (is('BHU') || is('BHUTAN')) {
    return (
      <span className={baseWrap} title={name || 'Bhutan'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <polygon points="0,0 36,0 0,36" fill="#FFCC00" />
          <polygon points="36,0 36,36 0,36" fill="#FF4E12" />
          {/* White Druk Dragon silhouette */}
          <path d="M 12 28 Q 18 20 24 14 Q 28 12 26 8 Q 23 9 20 12 Q 16 16 12 20 Q 8 22 10 26 Z" fill="#FFFFFF" />
          <circle cx="26" cy="9" r="1.5" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 11. Kuwait
  if (is('KUW') || is('KUWAIT')) {
    return (
      <span className={baseWrap} title={name || 'Kuwait'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="12" fill="#007A3D" />
          <rect y="12" width="36" height="12" fill="#FFFFFF" />
          <rect y="24" width="36" height="12" fill="#CE1126" />
          <polygon points="0,0 12,9 12,27 0,36" fill="#000000" />
        </svg>
      </span>
    );
  }

  // 12. Malaysia
  if (is('MAS') || is('MALAYSIA')) {
    return (
      <span className={baseWrap} title={name || 'Malaysia'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#FFFFFF" />
          {/* Alternating Red stripes */}
          <rect y="0" width="36" height="2.5" fill="#CC0000" />
          <rect y="5" width="36" height="2.5" fill="#CC0000" />
          <rect y="10" width="36" height="2.5" fill="#CC0000" />
          <rect y="15" width="36" height="2.5" fill="#CC0000" />
          <rect y="20" width="36" height="2.5" fill="#CC0000" />
          <rect y="25" width="36" height="2.5" fill="#CC0000" />
          <rect y="30" width="36" height="2.5" fill="#CC0000" />
          {/* Blue Canton */}
          <rect width="18" height="18" fill="#000066" />
          {/* Yellow Crescent and Star */}
          <circle cx="8" cy="9" r="4.5" fill="#FFCC00" />
          <circle cx="9.5" cy="9" r="4" fill="#000066" />
          <polygon points="13,9 13.8,7.5 15,8.5 14.5,10 15.5,11 13.5,10.8" fill="#FFCC00" />
        </svg>
      </span>
    );
  }

  // 13. China
  if (is('CHN') || is('CHINA')) {
    return (
      <span className={baseWrap} title={name || 'China'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#DE2910" />
          {/* Big Star */}
          <polygon points="8,5 9.2,8.5 12.8,8.5 9.9,10.6 11,14 8,11.8 5,14 6.1,10.6 3.2,8.5 6.8,8.5" fill="#FFDE00" />
          {/* 4 Small Stars */}
          <circle cx="15" cy="5" r="1.1" fill="#FFDE00" />
          <circle cx="18" cy="8" r="1.1" fill="#FFDE00" />
          <circle cx="18" cy="12" r="1.1" fill="#FFDE00" />
          <circle cx="15" cy="15" r="1.1" fill="#FFDE00" />
        </svg>
      </span>
    );
  }

  // 14. India
  if (is('IND') || is('INDIA')) {
    return (
      <span className={baseWrap} title={name || 'India'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="12" fill="#FF9933" />
          <rect y="12" width="36" height="12" fill="#FFFFFF" />
          <rect y="24" width="36" height="12" fill="#138808" />
          <circle cx="18" cy="18" r="4.5" fill="none" stroke="#000080" strokeWidth="1" />
          <circle cx="18" cy="18" r="1.5" fill="#000080" />
        </svg>
      </span>
    );
  }

  // 15. Australia
  if (is('AUS') || is('AUSTRALIA')) {
    return (
      <span className={baseWrap} title={name || 'Australia'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#00008B" />
          {/* Southern Cross stars */}
          <circle cx="26" cy="8" r="1.5" fill="#FFFFFF" />
          <circle cx="30" cy="15" r="1.5" fill="#FFFFFF" />
          <circle cx="24" cy="22" r="1.5" fill="#FFFFFF" />
          <circle cx="28" cy="28" r="1.5" fill="#FFFFFF" />
          <polygon points="10,24 11.5,28 15.5,28 12.5,30.5 13.5,34.5 10,32 6.5,34.5 7.5,30.5 4.5,28 8.5,28" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 16. Bangladesh
  if (is('BAN') || is('BANGLADESH')) {
    return (
      <span className={baseWrap} title={name || 'Bangladesh'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#006A4E" />
          <circle cx="16" cy="18" r="9" fill="#F42A41" />
        </svg>
      </span>
    );
  }

  // 17. Pakistan
  if (is('PAK') || is('PAKISTAN')) {
    return (
      <span className={baseWrap} title={name || 'Pakistan'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#006622" />
          <rect width="9" height="36" fill="#FFFFFF" />
          <circle cx="23" cy="18" r="7" fill="#FFFFFF" />
          <circle cx="25" cy="17" r="6" fill="#006622" />
          <polygon points="25,13 26.5,16 29.5,16 27,18 28,21 25,19 22,21 23,18 20.5,16 23.5,16" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 18. England
  if (is('ENG') || is('ENGLAND')) {
    return (
      <span className={baseWrap} title={name || 'England'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#FFFFFF" />
          <rect x="15" width="6" height="36" fill="#CF081F" />
          <rect y="15" width="36" height="6" fill="#CF081F" />
        </svg>
      </span>
    );
  }

  // 19. New Zealand
  if (is('NZ') || is('NEW ZEALAND')) {
    return (
      <span className={baseWrap} title={name || 'New Zealand'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#00247D" />
          <circle cx="28" cy="10" r="2" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="32" cy="18" r="2" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="26" cy="24" r="2" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="30" cy="30" r="2" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.8" />
        </svg>
      </span>
    );
  }

  // 20. South Africa
  if (is('SA') || is('SOUTH AFRICA')) {
    return (
      <span className={baseWrap} title={name || 'South Africa'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="18" fill="#E03C31" />
          <rect y="18" width="36" height="18" fill="#001489" />
          <polygon points="0,0 18,18 0,36" fill="#000000" />
          <polygon points="0,0 22,18 0,36" fill="none" stroke="#FFB81C" strokeWidth="3" />
          <path d="M 0,18 L 18,18 L 36,18" stroke="#007749" strokeWidth="6" />
          <path d="M 0,0 L 18,18 L 36,18" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M 0,36 L 18,18 L 36,18" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      </span>
    );
  }

  // 21. Sri Lanka
  if (is('SL') || is('SRI LANKA')) {
    return (
      <span className={baseWrap} title={name || 'Sri Lanka'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#FFBE00" />
          <rect x="3" y="3" width="7" height="30" fill="#005B38" />
          <rect x="10" y="3" width="7" height="30" fill="#EB7400" />
          <rect x="18" y="3" width="15" height="30" fill="#8D153A" />
        </svg>
      </span>
    );
  }

  // 22. West Indies
  if (is('WI') || is('WEST INDIES')) {
    return (
      <span className={baseWrap} title={name || 'West Indies'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#7B1113" />
          <circle cx="18" cy="18" r="10" fill="#F4B400" />
          <path d="M18 10 C18 14 14 20 12 25 L24 25 C22 20 18 14 18 10 Z" fill="#0F9D58" />
        </svg>
      </span>
    );
  }

  // 23. Afghanistan
  if (is('AFG') || is('AFGHANISTAN')) {
    return (
      <span className={baseWrap} title={name || 'Afghanistan'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="12" height="36" fill="#000000" />
          <rect x="12" width="12" height="36" fill="#D32011" />
          <rect x="24" width="12" height="36" fill="#007A36" />
          <circle cx="18" cy="18" r="5" fill="#FFFFFF" opacity="0.9" />
        </svg>
      </span>
    );
  }

  // 24. United States
  if (is('USA') || is('UNITED STATES')) {
    return (
      <span className={baseWrap} title={name || 'USA'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#B22234" />
          <rect y="4" width="36" height="3" fill="#FFFFFF" />
          <rect y="10" width="36" height="3" fill="#FFFFFF" />
          <rect y="16" width="36" height="3" fill="#FFFFFF" />
          <rect y="22" width="36" height="3" fill="#FFFFFF" />
          <rect y="28" width="36" height="3" fill="#FFFFFF" />
          <rect width="16" height="18" fill="#3C3B6E" />
          <circle cx="5" cy="5" r="1" fill="#FFFFFF" />
          <circle cx="11" cy="5" r="1" fill="#FFFFFF" />
          <circle cx="8" cy="9" r="1" fill="#FFFFFF" />
          <circle cx="5" cy="13" r="1" fill="#FFFFFF" />
          <circle cx="11" cy="13" r="1" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 25. Netherlands
  if (is('NED') || is('NETHERLANDS')) {
    return (
      <span className={baseWrap} title={name || 'Netherlands'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="12" fill="#AE1C28" />
          <rect y="12" width="36" height="12" fill="#FFFFFF" />
          <rect y="24" width="36" height="12" fill="#21468B" />
        </svg>
      </span>
    );
  }

  // 26. Scotland
  if (is('SCO') || is('SCOTLAND')) {
    return (
      <span className={baseWrap} title={name || 'Scotland'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#0065BF" />
          <path d="M 0,0 L 36,36 M 0,36 L 36,0" stroke="#FFFFFF" strokeWidth="5" />
        </svg>
      </span>
    );
  }

  // 27. Ireland
  if (is('IRE') || is('IRELAND')) {
    return (
      <span className={baseWrap} title={name || 'Ireland'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="12" height="36" fill="#169B62" />
          <rect x="12" width="12" height="36" fill="#FFFFFF" />
          <rect x="24" width="12" height="36" fill="#FF883E" />
        </svg>
      </span>
    );
  }

  // 28. Zimbabwe
  if (is('ZIM') || is('ZIMBABWE')) {
    return (
      <span className={baseWrap} title={name || 'Zimbabwe'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="5.1" fill="#006400" />
          <rect y="5.1" width="36" height="5.1" fill="#FFD700" />
          <rect y="10.2" width="36" height="5.1" fill="#D40000" />
          <rect y="15.3" width="36" height="5.4" fill="#000000" />
          <rect y="20.7" width="36" height="5.1" fill="#D40000" />
          <rect y="25.8" width="36" height="5.1" fill="#FFD700" />
          <rect y="30.9" width="36" height="5.1" fill="#006400" />
          <polygon points="0,0 15,18 0,36" fill="#FFFFFF" />
          <polygon points="5,15 6,17 8,17 6.5,18.5 7,20.5 5,19 3,20.5 3.5,18.5 2,17 4,17" fill="#D40000" />
        </svg>
      </span>
    );
  }

  // 29. Nepal
  if (is('NEP') || is('NEPAL')) {
    return (
      <span className={baseWrap} title={name || 'Nepal'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#003893" />
          <polygon points="4,2 26,16 14,16 26,34 4,34" fill="#DC143C" />
          <circle cx="10" cy="11" r="2.5" fill="#FFFFFF" />
          <circle cx="10" cy="24" r="3" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 30. UAE
  if (is('UAE') || is('EMIRATES')) {
    return (
      <span className={baseWrap} title={name || 'UAE'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="12" fill="#00732F" />
          <rect y="12" width="36" height="12" fill="#FFFFFF" />
          <rect y="24" width="36" height="12" fill="#000000" />
          <rect width="10" height="36" fill="#FF0000" />
        </svg>
      </span>
    );
  }

  // 31. Canada
  if (is('CAN') || is('CANADA')) {
    return (
      <span className={baseWrap} title={name || 'Canada'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="9" height="36" fill="#FF0000" />
          <rect x="9" width="18" height="36" fill="#FFFFFF" />
          <rect x="27" width="9" height="36" fill="#FF0000" />
          {/* Maple Leaf */}
          <path d="M 18 10 L 20 14 L 23 13 L 21 17 L 23 19 L 19 19 L 19 24 L 17 24 L 17 19 L 13 19 L 15 17 L 13 13 L 16 14 Z" fill="#FF0000" />
        </svg>
      </span>
    );
  }

  // -------------------------------------------------------------
  // Franchise & Australian / Domestic Team Emblems
  // -------------------------------------------------------------

  // Adelaide Strikers (ADS)
  if (is('ADS') || is('ADELAIDE')) {
    return (
      <span className={baseWrap} title={name || 'Adelaide Strikers'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#0082C8" />
          <polygon points="19,5 11,20 17,20 15,31 25,16 19,16" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // Hobart Hurricanes (HBH)
  if (is('HBH') || is('HOBART')) {
    return (
      <span className={baseWrap} title={name || 'Hobart Hurricanes'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#642882" />
          {/* Purple hurricane swirl */}
          <circle cx="18" cy="18" r="10" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="16,6" />
          <circle cx="18" cy="18" r="4.5" fill="#F4B400" />
        </svg>
      </span>
    );
  }

  // Melbourne Renegades (MLR)
  if (is('MLR') || is('RENEGADES')) {
    return (
      <span className={baseWrap} title={name || 'Melbourne Renegades'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#D50000" />
          <path d="M 12 10 L 20 10 Q 24 10 24 15 Q 24 19 20 19 L 16 19 L 23 27 M 16 10 L 16 27" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </span>
    );
  }

  // Melbourne Stars (MLS)
  if (is('MLS') || is('STARS')) {
    return (
      <span className={baseWrap} title={name || 'Melbourne Stars'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#007A33" />
          <polygon points="18,7 21,14 29,14 23,19 25,27 18,22 11,27 13,19 7,14 15,14" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // Sydney Thunder (SYT)
  if (is('SYT') || is('THUNDER')) {
    return (
      <span className={baseWrap} title={name || 'Sydney Thunder'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#000000" />
          <polygon points="21,4 10,19 17,19 14,32 26,15 19,15" fill="#76FF03" />
        </svg>
      </span>
    );
  }

  // Brisbane Heat (BRH)
  if (is('BRH') || is('HEAT')) {
    return (
      <span className={baseWrap} title={name || 'Brisbane Heat'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#009E97" />
          {/* Flame Icon */}
          <path d="M 18,7 C 22,13 25,18 25,23 A 7,7 0 0,1 11,23 C 11,18 16,14 18,7 Z" fill="#FFFFFF" />
          <path d="M 18,17 C 20,20 21,22 21,24 A 3,3 0 0,1 15,24 C 15,22 17,20 18,17 Z" fill="#FFCC00" />
        </svg>
      </span>
    );
  }

  // Perth Scorchers (PRS)
  if (is('PRS') || is('SCORCHERS')) {
    return (
      <span className={baseWrap} title={name || 'Perth Scorchers'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#F47920" />
          <circle cx="18" cy="18" r="8" fill="#FFFFFF" />
          <circle cx="18" cy="18" r="5" fill="#D50000" />
        </svg>
      </span>
    );
  }

  // Sydney Sixers (SYS)
  if (is('SYS') || is('SIXERS')) {
    return (
      <span className={baseWrap} title={name || 'Sydney Sixers'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#ED008C" />
          {/* Big number 6 */}
          <text x="18" y="26" fill="#FFFFFF" fontSize="22" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            6
          </text>
        </svg>
      </span>
    );
  }

  // Western Australia (WA)
  if (is('WA') || is('WESTERN AUSTRALIA')) {
    return (
      <span className={baseWrap} title={name || 'Western Australia'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#FFCD00" />
          {/* Black Swan Silhouette */}
          <path d="M 14,24 Q 22,25 24,19 Q 25,14 20,13 Q 19,8 22,7 Q 24,6 26,8 Q 23,8 22,11 Q 26,14 26,20 Q 23,26 14,24 Z" fill="#000000" />
        </svg>
      </span>
    );
  }

  // New South Wales (NSW)
  if (is('NSW') || is('NEW SOUTH WALES')) {
    return (
      <span className={baseWrap} title={name || 'New South Wales'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#75B2DD" />
          <circle cx="18" cy="18" r="8" fill="#002B49" />
          <circle cx="18" cy="18" r="4.5" fill="#E4002B" />
        </svg>
      </span>
    );
  }

  // Chennai Super Kings (CSK)
  if (is('CSK')) {
    return (
      <span className={baseWrap} title={name || 'CSK'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#F9CD05" />
          <circle cx="18" cy="18" r="7" fill="#004BA0" />
          <text x="18" y="22" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">CSK</text>
        </svg>
      </span>
    );
  }

  // Mumbai Indians (MI)
  if (is('MI')) {
    return (
      <span className={baseWrap} title={name || 'MI'}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect width="36" height="36" fill="#004BA0" />
          <circle cx="18" cy="18" r="7" fill="#D4AF37" />
          <text x="18" y="22" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">MI</text>
        </svg>
      </span>
    );
  }

  // Default fallback circle with 3 uppercase letters
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold shrink-0 border border-slate-300 dark:border-slate-700 ${dimension} ${className}`}
      title={name || normCode}
    >
      {normCode.slice(0, 3)}
    </span>
  );
}
