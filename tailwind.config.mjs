import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        serif: ['"Source Serif Pro"', 'Charter', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#111111',
          muted: '#555555',
          soft: '#888888',
        },
        accent: '#0a66c2',
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
            a: { textDecoration: 'none', borderBottom: '1px solid currentColor' },
            'a:hover': { opacity: 0.7 },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            code: {
              backgroundColor: '#f3f3f3',
              padding: '0.15em 0.35em',
              borderRadius: '0.25em',
              fontWeight: '400',
            },
            'pre code': { backgroundColor: 'transparent', padding: 0 },
            pre: {
              backgroundColor: '#f6f8fa',
              color: '#24292f',
              borderRadius: '0.5rem',
              padding: '1rem 1.25rem',
              overflow: 'auto',
              fontSize: '0.875em',
              lineHeight: '1.65',
            },
            blockquote: {
              fontStyle: 'normal',
              color: theme('colors.ink.muted'),
              borderLeftColor: '#d0d7de',
            },
            'mjx-container[display="true"]': {
              overflowX: 'auto',
              overflowY: 'hidden',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
