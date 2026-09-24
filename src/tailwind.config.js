/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        rose: {
          50: '#FFF5F7',
          100: '#FFE4EC',
          200: '#FECDD9',
          300: '#FDA4C1',
          400: '#FB6FA6',
          500: '#F43F8E',
          600: '#E11D74',
          700: '#BE1260',
          800: '#9F1255',
          900: '#88134E',
        },
        blush: {
          50: '#FDF2F8',
          100: '#FCE7F3',
        },
      },
      boxShadow: {
        soft: '0 2px 20px -4px rgba(244, 63, 142, 0.12)',
        card: '0 4px 24px -8px rgba(0, 0, 0, 0.08)',
        glow: '0 0 24px -4px rgba(244, 63, 142, 0.3)',
      },
    },
  },
  plugins: [],
};
