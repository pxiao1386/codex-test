import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF9F2',
        blush: '#FFE7EE',
        lavender: '#EAE3FF',
        rose: '#F8D5E2',
        coffee: '#7D5A68'
      },
      boxShadow: {
        soft: '0 8px 24px rgba(125, 90, 104, 0.12)'
      }
    }
  },
  plugins: []
};

export default config;
