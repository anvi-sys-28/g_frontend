'use client';

import React from 'react';

/**
 * Authentic, instantly recognizable Cricket Bat and Ball SVG Icon.
 */
export function CricketBatBallIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* --- CRICKET BAT --- */}
      {/* Handle Cap */}
      <rect
        x="28.2"
        y="4.2"
        width="3"
        height="1.5"
        rx="0.75"
        transform="rotate(45 28.2 4.2)"
        fill="currentColor"
      />
      {/* Handle Grip (Cylindrical with ribbed texture) */}
      <rect
        x="24.5"
        y="6"
        width="3.2"
        height="9"
        rx="1"
        transform="rotate(45 24.5 6)"
        fill="currentColor"
      />
      {/* Handle grip white wraps */}
      <line x1="26" y1="8" x2="28" y2="10" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
      <line x1="24" y1="10" x2="26" y2="12" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
      <line x1="22" y1="12" x2="24" y2="14" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />

      {/* Bat Shoulders & Willow Blade */}
      <path
        d="M 21.5 13.5
           L 24.5 16.5
           Q 24.8 17.5 24.2 18.2
           L 11.5 32.5
           Q 10 34 8 33
           Q 6.8 32 8 30
           L 19.5 15.5
           Q 20.2 14.5 21.5 13.5 Z"
        fill="currentColor"
      />
      {/* Willow Edge & Spine Highlights */}
      <path
        d="M 20.5 15.8 L 10 28.5"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Flat Toe Curve */}
      <path
        d="M 7.8 30.2 Q 8.5 32.8 11.2 32.2"
        stroke="currentColor"
        strokeWidth="1"
      />

      {/* --- CRICKET BALL --- */}
      {/* Ball Sphere */}
      <circle
        cx="28"
        cy="26"
        r="6.5"
        fill="currentColor"
      />
      {/* Iconic Raised Seam with Stitches */}
      <path
        d="M 24 23.5 C 26 25, 29 27, 32.2 28.5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M 24.2 24 C 26.2 25.5, 29.2 27.5, 32.4 29"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="0.8"
        strokeDasharray="1.2 1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Custom Ace of Spades / Playing Card SVG Icon.
 */
export function AceCardIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Card Body */}
      <rect
        x="8"
        y="4"
        width="20"
        height="28"
        rx="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      {/* Top-Left 'A' */}
      <text
        x="12"
        y="12"
        fontSize="7.5"
        fontWeight="900"
        fontFamily="sans-serif"
        textAnchor="middle"
        fill="currentColor"
      >
        A
      </text>
      {/* Small Spade under Top-Left A */}
      <path
        d="M12 14.5 C 11.2 15.5 10.5 16.2 10.5 17 C 10.5 17.6 11 18 11.6 18 C 12 18 12.2 17.8 12.3 17.6 L 12.3 18.5 H 11.7 V 18.9 H 12.9 V 18.5 H 12.3 L 12.3 17.6 C 12.4 17.8 12.6 18 13 18 C 13.6 18 14.1 17.6 14.1 17 C 14.1 16.2 13.4 15.5 12.6 14.5 Z"
        fill="currentColor"
      />
      {/* Center Large Spade */}
      <path
        d="M 18 13
           C 15.8 16 13 18.5 13 21
           C 13 23 14.6 24.5 16.6 24.5
           C 17.6 24.5 18.3 24 18.6 23.4
           L 18.3 26.5
           H 16.5
           V 27.5
           H 19.5
           V 26.5
           H 18.9
           L 18.6 23.4
           C 18.9 24 19.6 24.5 20.6 24.5
           C 22.6 24.5 24.2 23 24.2 21
           C 24.2 18.5 21.4 16 19.2 13
           Q 18.6 12.2 18 13 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Authentic Person / User Profile SVG Icon.
 */
export function ProfilePersonIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="18" cy="11.5" r="5.5" stroke="currentColor" strokeWidth="2.4" fill="none" />
      {/* Torso / Shoulders */}
      <path
        d="M7.5 28.5 C7.5 22.8 12.2 19.5 18 19.5 C23.8 19.5 28.5 22.8 28.5 28.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
