/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        retro: {
          green: '#00ff88',
          pink: '#ff1493',
          cyan: '#00d4ff',
          gold: '#ffd700',
          cream: '#fffef0',
          dark: '#0d0d12',
          card: '#16161d',
        },
      },
      boxShadow: {
        'retro-glow': '0 0 20px rgba(0, 255, 136, 0.3)',
        'retro-pink': '0 0 15px rgba(255, 20, 147, 0.25)',
      },
      keyframes: {
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'vs-pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-in-left': 'slide-in-left 0.4s ease-out both',
        'slide-in-right': 'slide-in-right 0.4s ease-out both',
        'vs-pop': 'vs-pop 0.35s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
