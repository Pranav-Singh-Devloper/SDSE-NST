/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        yt: {
          red:    '#cc0000',
          redhov: '#e00000',
          bg:     '#0f0f0f',
          surface:'#1a1a1a',
          border: '#272727',
          card:   '#212121',
          muted:  '#aaaaaa',
          dim:    '#555555',
        },
      },
      aspectRatio: {
        'video': '16 / 9',
      },
      animation: {
        'live-pulse': 'livePulse 1.2s ease-in-out infinite',
        'spin-fast':  'spin 0.75s linear infinite',
      },
      keyframes: {
        livePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.4', transform: 'scale(0.7)' },
        },
      },
    },
  },
  plugins: [],
}
