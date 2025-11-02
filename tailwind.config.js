/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bgblack: '#000000',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        glass: '0 40px 140px -10px rgba(255,255,255,0.2)',
      },
    },
  },
  plugins: [],
}
