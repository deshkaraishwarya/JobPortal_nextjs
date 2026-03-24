import type { Config } from 'tailwindcss';

/**
 * tailwind.config.ts — Tailwind CSS Configuration
 *
 * WHY configure Tailwind?
 * Out of the box, Tailwind is a massive utility CSS framework. This config:
 * 1. `content`: Tells Tailwind WHICH files to scan for class names.
 *    At build time, Tailwind removes (tree-shakes) any classes NOT used in
 *    these files, making the final CSS bundle tiny (~5kb vs ~3MB).
 *    If you forget to add a path here, those classes will be stripped!
 *
 * 2. `theme.extend`: Add custom values ON TOP of Tailwind's defaults.
 *    Anything inside `extend` merges with defaults — perfect for brand colors.
 *    Putting values directly in `theme` (without extend) would REPLACE defaults.
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom font family — references the CSS variable set by next/font
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      // Brand colors for JobTrackr
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
      },
      // Animation for skeleton loading states
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
