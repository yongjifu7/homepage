# Link TouchSteer Authors Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show the complete visible author list for TouchSteer and link Shan Luo and Guanqun Cao to their academic profiles in both English and Chinese publication views.

**Architecture:** Keep publication metadata in the existing Markdown front matter and centralize the profile URL mapping in the two existing author-rendering helpers used by publication cards and detail pages. Render external author links with the site's existing author styling and safe new-tab attributes.

**Tech Stack:** Astro 5, Markdown content collections, TypeScript, npm build.

---

### Task 1: Update TouchSteer metadata

**Files:**
- Modify: `content/publications/touchsteer.md`

**Step 1: Replace the abbreviated author list**

Change the `et al.` entry to the remaining authors already present in the paper's BibTeX metadata, ending with Shan Luo.

**Step 2: Preserve source facts**

Do not alter the title, venue, status, abstract, or BibTeX content.

### Task 2: Render profile links in publication author lists

**Files:**
- Modify: `src/components/PubEntry.astro`
- Modify: `src/layouts/PublicationLayout.astro`

**Step 1: Add the two known profile mappings**

Map `Guanqun Cao` to `https://guan1206.github.io/` and `Shan Luo` to `https://www.kcl.ac.uk/people/shan-luo`.

**Step 2: Render safe external links**

Render mapped authors as links with `target="_blank"` and `rel="noopener"`; retain the current bold/dotted styling for Yongji Fu.

**Step 3: Leave unmapped authors as plain text**

Keep all other author names unchanged.

### Task 3: Build verification

**Files:**
- Test: generated Astro output from `npm run build`

**Step 1: Build the site**

Run `npm run build` from `site/` and confirm the English and Chinese publication routes compile successfully.

**Step 2: Inspect generated output**

Confirm the built TouchSteer pages contain both author profile URLs and the full author list.

