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
        urdu: ['var(--typo-font-urdu)'],
        sans: ['var(--typo-font-body)'],
        poppins: ['var(--typo-font-admin)'],
        nastaleeq: ['var(--typo-font-nastaleeq)'],
      },
      /* Sizes / weights / line-heights from constants/typography.js (CSS vars) */
      fontSize: {
        xs: ['var(--typo-size-xs)', { lineHeight: 'var(--typo-lh-tight)' }],
        sm: ['var(--typo-size-sm)', { lineHeight: 'var(--typo-lh-snug)' }],
        base: ['var(--typo-size-base)', { lineHeight: 'var(--typo-lh-body)' }],
        lg: ['var(--typo-size-lg)', { lineHeight: 'var(--typo-lh-body)' }],
        xl: ['var(--typo-size-xl)', { lineHeight: 'var(--typo-lh-heading)' }],
        '2xl': ['var(--typo-size-2xl)', { lineHeight: 'var(--typo-lh-heading)' }],
        '3xl': ['var(--typo-size-3xl)', { lineHeight: 'var(--typo-lh-heading)' }],
        '4xl': ['var(--typo-size-4xl)', { lineHeight: 'var(--typo-lh-tight)' }],
      },
      fontWeight: {
        normal: 'var(--typo-weight-normal)',
        medium: 'var(--typo-weight-medium)',
        semibold: 'var(--typo-weight-semibold)',
        bold: 'var(--typo-weight-bold)',
        extrabold: 'var(--typo-weight-extrabold)',
      },
      lineHeight: {
        body: 'var(--typo-lh-body)',
        tight: 'var(--typo-lh-tight)',
        snug: 'var(--typo-lh-snug)',
        heading: 'var(--typo-lh-heading)',
        article: 'var(--typo-lh-article)',
      },
    },
  },
  plugins: [],
};
