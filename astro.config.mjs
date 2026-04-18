import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/static';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax/svg';

export default defineConfig({
  site: 'https://yongjifu.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [mdx(), tailwind({ applyBaseStyles: false })],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [
        rehypeMathjax,
        {
          tex: {
            packages: { '[+]': ['ams', 'physics', 'mhchem', 'color', 'boldsymbol', 'cancel', 'newcommand'] },
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            tags: 'ams',
          },
          svg: { fontCache: 'local', scale: 1 },
        },
      ],
    ],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      langs: ['python', 'cpp', 'rust', 'javascript', 'typescript', 'bash', 'json', 'yaml', 'markdown', 'latex'],
      wrap: true,
    },
  },
});
