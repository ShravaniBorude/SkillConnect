/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefaf3',
          100: '#d5f4e1',
          200: '#aee8c7',
          500: '#16a34a',
          600: '#108a3d',
          700: '#0d6f32',
          800: '#0b5729',
        },
        slate: {
          850: '#172033',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
