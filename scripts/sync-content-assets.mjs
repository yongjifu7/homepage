#!/usr/bin/env node
// Copies user-editable binary assets from content/ into public/ before
// `astro dev` or `astro build` runs. This lets everything the user edits
// live under content/ while Astro still serves them at site-root URLs
// like /images/avatar.jpg and /pdfs/learning-to-search.pdf.

import { cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const pairs = [
  ['content/images', 'public/images'],
  ['content/pdfs', 'public/pdfs'],
  ['content/videos', 'public/videos'],
];

for (const [src, dst] of pairs) {
  const from = join(root, src);
  const to = join(root, dst);
  if (!existsSync(from)) {
    console.log(`[sync-assets] skip (missing) ${src}`);
    continue;
  }
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  console.log(`[sync-assets] ${src} → ${dst}`);
}
