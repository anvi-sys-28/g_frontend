import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          DEFAULT: 'var(--brand-600)',
          foreground: 'var(--on-brand)',
        },
        surface: {
          DEFAULT: 'var(--bg)',
          muted: 'var(--bg-muted)',
          border: 'var(--border)',
          text: 'var(--text)',
          'muted-text': 'var(--text-muted)',
        },
        win: 'var(--win)',
        loss: 'var(--loss)',
        danger: 'var(--danger)',
        live: 'var(--live)',
        'draw-nr': 'var(--draw-nr)',
        // shadcn UI colors
        primary: {
          DEFAULT: 'var(--primary, #D7263D)',
          foreground: 'var(--primary-foreground, #FFFFFF)',
        },
        card: {
          DEFAULT: 'var(--card, #141519)',
          foreground: 'var(--card-foreground, #F3F4F6)',
        },
        secondary: {
          DEFAULT: 'var(--secondary, #1F2026)',
          foreground: 'var(--secondary-foreground, #F3F4F6)',
        },
        foreground: 'var(--foreground, #F3F4F6)',
        accent: {
          DEFAULT: 'var(--accent, #26282E)',
          foreground: 'var(--accent-foreground, #F3F4F6)',
        },
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
