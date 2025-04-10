/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          400: '#00A7EA',
          500: '#0099cc',
          600: '#0077cc',
          700: '#0066aa',
          900: '#004488',
        },
        cyan: {
          300: '#88ddff',
          400: '#66bbff',
          500: '#33aaff',
        },
      },
    },
  },
  plugins: [],
};
