import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Netflix-style dark backgrounds
        'netflix-dark': '#0f0f0f',
        'netflix-dark-secondary': '#1a1a1a',
        // Netflix red accent
        'netflix-red': '#e50914',
        // Gray for secondary elements
        'netflix-gray': '#808080',
      },
      zIndex: {
        '45': '45',
        '60': '60',
        '100': '100',
      },
      screens: {
        // Custom responsive breakpoints
        'mobile': { 'max': '639px' },
        'tablet': { 'min': '640px', 'max': '1023px' },
        'desktop': { 'min': '1024px' },
      },
    },
  },
  darkMode: 'selector',
  plugins: [
    function ({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};

export default config;
