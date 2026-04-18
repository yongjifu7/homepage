import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax/svg';

// Shares the same plugin chain as astro.config.mjs so frontmatter-supplied
// markdown (e.g. publication abstracts) renders identically to body markdown.
let processorPromise: ReturnType<typeof createMarkdownProcessor> | null = null;
function getProcessor() {
  if (!processorPromise) {
    processorPromise = createMarkdownProcessor({
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
    });
  }
  return processorPromise;
}

export async function renderMarkdown(src: string | undefined): Promise<string> {
  if (!src) return '';
  const processor = await getProcessor();
  const { code } = await processor.render(src);
  return code;
}
