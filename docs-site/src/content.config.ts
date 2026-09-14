import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Source of truth is the root package's own `docs/*.md` files (ROADMAP item 15) — this project
// never copies or hand-maintains their content, it only reads them at build time.
//
// One collection for every `docs/*.md` file. `design-conventions.md` (the source for the
// Conventions page) has no frontmatter, so `category`/`tests` are optional here rather than
// splitting into two collections with two schemas.
const docs = defineCollection({
  loader: glob({ pattern: '*.md', base: '../docs' }),
  schema: z.object({
    category: z.string().optional(),
    tests: z.array(z.string()).optional(),
  }),
});

export const collections = { docs };
