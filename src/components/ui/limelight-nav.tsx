'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, cloneElement } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// --- Internal Types and Defaults ---

const DefaultHomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const DefaultCompassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </svg>
);

const DefaultBellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export type NavItem = {
  id: string | number;
  icon: React.ReactElement<any>;
  label?: string;
  onClick?: () => void;
};

const defaultNavItems: NavItem[] = [
  { id: 'default-home', icon: <DefaultHomeIcon />, label: 'Home' },
  { id: 'default-explore', icon: <DefaultCompassIcon />, label: 'Explore' },
  { id: 'default-notifications', icon: <DefaultBellIcon />, label: 'Notifications' },
];

export type LimelightNavProps = {
  items?: NavItem[];
  defaultActiveIndex?: number;
  activeIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  limelightClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
};

/**
 * An adaptive-width navigation bar with a "limelight" effect matching the user screenshot.
 */
export const LimelightNav = ({
  items = defaultNavItems,
  defaultActiveIndex = 0,
  activeIndex: controlledIndex,
  onTabChange,
  className = '',
  limelightClassName = '',
  iconContainerClassName = '',
  iconClassName = '',
}: LimelightNavProps) => {
  const [internalIndex, setInternalIndex] = useState(defaultActiveIndex);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const [isReady, setIsReady] = useState(false);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (items.length === 0) return;

    const limelight = limelightRef.current;
    const activeItem = navItemRefs.current[activeIndex];
    
    if (limelight && activeItem) {
      const newLeft = activeItem.offsetLeft + activeItem.offsetWidth / 2 - limelight.offsetWidth / 2;
      limelight.style.left = `${newLeft}px`;

      if (!isReady) {
        const timer = setTimeout(() => setIsReady(true), 50);
        return () => clearTimeout(timer);
      }
    }
  }, [activeIndex, isReady, items]);

  if (items.length === 0) {
    return null; 
  }

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    setInternalIndex(index);
    onTabChange?.(index);
    itemOnClick?.();
  };

  return (
    <nav className={`relative inline-flex items-center h-16 rounded-2xl bg-[#121214] text-white border border-neutral-800/90 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-md px-2 ${className}`}>
      {items.map(({ id, icon, label, onClick }, index) => (
        <a
          key={id}
          ref={(el) => {
            navItemRefs.current[index] = el;
          }}
          className={`relative z-20 flex h-full cursor-pointer items-center justify-center p-5 ${iconContainerClassName}`}
          onClick={() => handleItemClick(index, onClick)}
          aria-label={label}
        >
          {cloneElement(icon, {
            className: `w-7 h-7 transition-colors duration-200 ${
              activeIndex === index ? 'text-white opacity-100' : 'text-neutral-400 opacity-60 hover:opacity-90'
            } ${icon.props?.className || ''} ${iconClassName || ''}`,
          })}
        </a>
      ))}

      {/* Red Limelight Top Pill & Spotlight Glow matching reference */}
      <div 
        ref={limelightRef}
        className={`absolute top-0 z-10 w-9 sm:w-10 h-[4px] rounded-full bg-[#E11D48] shadow-[0_2px_8px_rgba(225,29,72,0.6)] ${
          isReady ? 'transition-[left] duration-300 ease-out' : ''
        } ${limelightClassName}`}
        style={{ left: '-999px' }}
      >
        {/* Soft diffused red spotlight glow underneath the active icon */}
        <div className="absolute left-[-40%] top-[4px] w-[180%] h-14 bg-gradient-to-b from-[#E11D48]/35 via-[#E11D48]/15 to-transparent [clip-path:polygon(10%_100%,25%_0,75%_0,90%_100%)] pointer-events-none blur-[1px]" />
        <div className="absolute left-[-20%] top-[22px] w-[140%] h-7 bg-[#E11D48]/25 rounded-full blur-md pointer-events-none" />
      </div>
    </nav>
  );
};

export default LimelightNav;
