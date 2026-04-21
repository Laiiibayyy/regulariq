e {import('tailwindcss').Config}
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.7s ease both',
        fadeInLeft: 'fadeInLeft 0.6s ease both',
      },
    },
  },
  plugins: [],
};
keyframes: {
  // ... existing ones ...
  ticker: {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-50%)' },
  },
  fadeUp: {
    from: { opacity: '0', transform: 'translateY(20px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
},
animation: {
  ticker: 'ticker 25s linear infinite',
  fadeUp: 'fadeUp 0.7s ease both',
  fadeInLeft: 'fadeInLeft 0.6s ease both',
},

keyframes: {
  lineGrow: {
    from: { strokeDashoffset: '1000' },
    to: { strokeDashoffset: '0' },
  },
  // ... baaki existing ones
},
animation: {
  lineGrow: 'lineGrow 2s ease 0.5s forwards',
  // ... baaki
},