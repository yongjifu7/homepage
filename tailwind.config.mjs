import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        ink: {
          DEFAULT: '#0a0a0a',
          muted: '#4a4a4a',
          soft: '#888',
        },
        accent: '#0a66c2',
        surface: '#fafaf9',
      },
      maxWidth: {
        prose: '72ch',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.ink.DEFAULT'),
            '--tw-prose-headings': theme('colors.ink.DEFAULT'),
            '--tw-prose-links': theme('colors.accent'),
            '--tw-prose-bold': theme('colors.ink.DEFAULT'),
            '--tw-prose-code': theme('colors.ink.DEFAULT'),
            maxWidth: '72ch',
            fontSize: '1rem',
            lineHeight: '1.7',
            h1: { fontFamily: 'var(--font-serif)', fontWeight: '600', letterSpacing: '-0.01em' },
            h2: { fontFamily: 'var(--font-serif)', fontWeight: '600', letterSpacing: '-0.005em', marginTop: '2em' },
            h3: { fontFamily: 'var(--font-serif)', fontWeight: '600' },
            a: {
              textDecoration: 'none',
              borderBottom: '1px solid currentColor',
              fontWeight: '400',
            },
            'a:hover': { opacity: 0.7 },
            blockquote: {
              fontStyle: 'normal',
              color: theme('colors.ink.muted'),
              borderLeftColor: '#d4d4d4',
              fontFamily: 'var(--font-serif)',
            },
            'mjx-container[display="true"]': { overflowX: 'auto', overflowY: 'hidden' },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
