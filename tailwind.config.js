/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#b91c1c', // news red
          dark: '#7f1d1d',
          light: '#dc2626',
        },
        ink: '#1f2937',
      },
      fontFamily: {
        urdu: ['"Noto Nastaliq Urdu"', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
