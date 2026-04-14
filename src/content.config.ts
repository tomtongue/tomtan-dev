import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		tags: z.array(z.string()),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		draft: z.boolean().optional()
	}),
});

const works = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/works' }),
	schema: z.object({
		title: z.string(),
	}),
});

export const collections = { blog, works };
