'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface SlideTabPosition {
  left: number;
  width: number;
  opacity: number;
}

export interface SlideTabsProps {
  tabs?: string[];
  defaultSelected?: number;
  onTabChange?: (tab: string, index: number) => void;
  className?: string;
  cursorClassName?: string;
}

export const SlideTabs = ({
  tabs = ['Home', 'Pricing', 'Features', 'Docs', 'Blog'],
  defaultSelected = 0,
  onTabChange,
  className = '',
  cursorClassName = '',
}: SlideTabsProps) => {
  const [position, setPosition] = useState<SlideTabPosition>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  // State to track the currently selected tab, defaulting to the first tab (index 0)
  const [selected, setSelected] = useState(defaultSelected);
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  // Update selected if defaultSelected changes externally
  useEffect(() => {
    setSelected(defaultSelected);
  }, [defaultSelected]);

  // This effect runs when the component mounts or when the selected tab changes.
  // It calculates the position of the selected tab and sets the cursor.
  useEffect(() => {
    const selectedTab = tabsRef.current[selected];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({
        left: selectedTab.offsetLeft,
        width,
        opacity: 1,
      });
    }
  }, [selected]);

  return (
    <ul
      onMouseLeave={() => {
        // When the mouse leaves the container, reset the cursor
        // to the position of the currently selected tab.
        const selectedTab = tabsRef.current[selected];
        if (selectedTab) {
          const { width } = selectedTab.getBoundingClientRect();
          setPosition({
            left: selectedTab.offsetLeft,
            width,
            opacity: 1,
          });
        }
      }}
      className={`relative mx-auto flex w-fit rounded-full border-2 border-black bg-white p-1 dark:border-white dark:bg-neutral-800 ${className}`}
    >
      {tabs.map((tab, i) => (
        <Tab
          key={tab}
          ref={(el) => {
            tabsRef.current[i] = el;
          }}
          setPosition={setPosition}
          onClick={() => {
            setSelected(i);
            onTabChange?.(tab, i);
          }}
        >
          {tab}
        </Tab>
      ))}

      <Cursor position={position} className={cursorClassName} />
    </ul>
  );
};

interface TabProps {
  children: React.ReactNode;
  setPosition: React.Dispatch<React.SetStateAction<SlideTabPosition>>;
  onClick?: () => void;
  className?: string;
}

// The Tab component is wrapped in forwardRef to accept a ref from its parent.
export const Tab = React.forwardRef<HTMLLIElement, TabProps>(
  ({ children, setPosition, onClick, className }, ref) => {
    return (
      <li
        ref={ref}
        onClick={onClick}
        onMouseEnter={(e) => {
          const target = e.currentTarget;
          const { width } = target.getBoundingClientRect();

          setPosition({
            left: target.offsetLeft,
            width,
            opacity: 1,
          });
        }}
        className={
          className ||
          'relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-5 md:py-3 md:text-base font-semibold transition-colors'
        }
      >
        {children}
      </li>
    );
  }
);
Tab.displayName = 'Tab';

interface CursorProps {
  position: SlideTabPosition;
  className?: string;
}

export const Cursor = ({ position, className }: CursorProps) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`absolute z-0 h-7 rounded-full bg-black dark:bg-white md:h-12 ${className || ''}`}
    />
  );
};

export default SlideTabs;
