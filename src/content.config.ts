import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema({
			// A section removed in the editor must not fail the build; sidebar.mjs
			// puts such pages in the first section.
			extend: z.object({ section: z.string().optional() }),
		}) }),
};
