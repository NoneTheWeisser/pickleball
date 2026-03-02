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
    },
  },
  plugins: [],
}
