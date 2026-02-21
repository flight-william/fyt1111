/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
  ],
  theme: {
    extend: {
      colors: {
        'fyt-black': '#1A1A1A',
        'fyt-dark': '#242424',
        'fyt-orange': '#F57C00',
        'fyt-gold': '#D4A843',
        'fyt-warm-white': '#FAF8F5',
        'fyt-muted': '#9A9A9A',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'zh-body': ['17px', { lineHeight: '1.8' }],
        'zh-body-lg': ['19px', { lineHeight: '1.8' }],
      },
    },
  },
  plugins: [],
}
