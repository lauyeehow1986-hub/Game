import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sgRed: '#ED2939',
        sgWhite: '#FFFFFF',
        clinical: {
          bg: '#0b1320',
          panel: '#111a2e',
          border: '#1f2a44',
          accent: '#3aa6ff',
          ok: '#4ade80',
          warn: '#facc15',
          danger: '#f87171',
          subtle: '#7d8ba4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
