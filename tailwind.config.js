// Config: Tailwind CSS configuration with DayFlow design tokens
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#FAFAF8',
        forest: {
          50:  '#EEF4ED',
          100: '#D0E4CC',
          200: '#A7C9A0',
          500: '#3B6B4B',
          700: '#2A4E36',
          900: '#1A3222',
        },
        terracotta: {
          50:  '#FBF0EB',
          500: '#C4622D',
          700: '#9A4520',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          muted:   '#737373',
          faint:   '#A8A29E',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans:  ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:  { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        'fade-in':        'fadeIn 0.5s ease forwards',
        'fade-up':        'fadeUp 0.55s ease forwards',
        'fade-up-d1':     'fadeUp 0.55s 0.1s ease forwards',
        'fade-up-d2':     'fadeUp 0.55s 0.2s ease forwards',
        'fade-up-d3':     'fadeUp 0.55s 0.35s ease forwards',
        'scale-in':       'scaleIn 0.25s ease forwards',
      },
    },
  },
  plugins: [],
}
