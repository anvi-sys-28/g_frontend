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
