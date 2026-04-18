// Render a Markdown string (including math and basic formatting) to HTML
// at build time, using the same MathJax SVG pipeline configured for .md
// file bodies. This lets frontmatter string fields like `abstract_en` /
// `abstract_zh` render math correctly, so publication abstracts can be
// authored in plain YAML-friendly form without losing $formulas$ or **bold**.

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeMathjax from 'rehype-mathjax/svg';
import rehypeStringify from 'rehype-stringify';

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeMathjax, {
    tex: {
      packages: { '[+]': ['ams', 'physics', 'mhchem', 'color', 'boldsymbol', 'cancel', 'newcommand'] },
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      tags: 'ams',
    },
    svg: { fontCache: 'local', scale: 1 },
  })
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function renderMarkdown(md: string | undefined | null): Promise<string> {
  if (!md) return '';
  const file = await processor.process(md);
  return String(file);
}
