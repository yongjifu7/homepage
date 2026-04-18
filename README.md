# yongjifu.dev — personal site

Bilingual (EN / 中文) academic homepage. Astro static output, MathJax SVG at
build time, Shiki code highlighting, deployed on Vercel.

## Stack

- **Astro 5** with Content Collections (glob loader)
- **Math**: `remark-math` + `rehype-mathjax/svg` — formulas are SSR'd to SVG
  at build time; no client-side JS needed
- **Code**: Shiki (github-light / github-dark)
- **Styling**: Tailwind + `@tailwindcss/typography`
- **Deploy**: `@astrojs/vercel` static adapter

## Where to edit things

Everything you write lives in `content/`:

```
content/
├── about/{en,zh}.md                  self-introduction
├── publications/*.md                 papers — frontmatter drives the list
├── projects/*.md                     project writeups
├── blog/*.md                         blog posts (math & code OK)
├── images/                           photos / figures, served at /images/…
└── pdfs/                             paper PDFs, served at /pdfs/…
```

`content/images/` and `content/pdfs/` are copied into `public/` before
`dev` / `build` by `scripts/sync-content-assets.mjs` (npm `predev` /
`prebuild` hooks). The copies in `public/images/` and `public/pdfs/` are
gitignored — `content/` is the single source of truth.

## Local

```sh
npm install
npm run dev        # → http://localhost:4321
npm run build      # → dist/  (and .vercel/output for Vercel)
```

## Deploy

Push to `main` on GitHub. Vercel rebuilds and ships automatically.

## Authoring tips

- Math: `$inline$`, `$$display$$`, or `\begin{align}…\end{align}` — all
  work in any `.md` / `.mdx` under `content/`.
- Code blocks use fenced syntax with the language tag.
  Registered languages: python, cpp, rust, javascript, typescript, bash,
  json, yaml, markdown, latex. More can be added in `astro.config.mjs`.
- Publication frontmatter supports `pdf`, `webpage`, `arxiv`, `code`,
  `bibtex`, `status` (`published` / `under-review` / `preprint`). See
  existing entries under `content/publications/` for the exact shape.
