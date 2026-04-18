import { defineCollection, z } from 'astro:content';

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    title_zh: z.string().optional(),
    authors: z.array(z.string()),
    venue: z.string(),
    venue_zh: z.string().optional(),
    year: z.number(),
    date: z.date().optional(),
    pdf: z.string().optional(),
    webpage: z.string().url().optional(),
    code: z.string().url().optional(),
    arxiv: z.string().optional(),
    bibtex: z.string().optional(),
    status: z.enum(['published', 'under-review', 'preprint']).default('published'),
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    title_zh: z.string().optional(),
    summary: z.string(),
    summary_zh: z.string().optional(),
    date: z.date(),
    stack: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    title_zh: z.string().optional(),
    date: z.date(),
    description: z.string(),
    description_zh: z.string().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['en', 'zh']).default('en'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { publications, projects, blog };
