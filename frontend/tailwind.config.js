/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'terminal-black': '#050505',
        'terminal-green': '#00ff41',
        'terminal-amber': '#ffb000',
        'terminal-red': '#ff0000',
        'terminal-cyan': '#00ffff',
        'terminal-dim': '#0f1f0f',
      },
      fontFamily: {
        'mono': ['"Share Tech Mono"', 'monospace'],
        'display': ['"Orbitron"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 1s linear infinite',
        'typing': 'typing 2s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        blink: {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: '#00ff41' },
        }
      }
    },
  },
  plugins: [],
}
