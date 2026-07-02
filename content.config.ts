import { defineContentConfig, defineCollection, z } from "@nuxt/content";

const Author = z.object({
	name: z.string(),
	description: z.string().optional(),
	to: z.string().optional(),
	twitter: z.string().optional(),
	avatar: z
		.object({
			src: z.string(),
			alt: z.string().optional(),
		})
		.optional(),
});

const PageHero = z.object({
	title: z.string(),
	description: z.string(),
	head: z
		.object({
			title: z.string().optional(),
			description: z.string().optional(),
		})
		.optional(),
});

export default defineContentConfig({
	collections: {
		blog: defineCollection({
			type: "page",
			source: "blog/*",
			schema: z.object({
				image: z.string().optional(),
				authors: z.array(Author),
				date: z.string(),
				draft: z.boolean().default(false),
				category: z.enum(["Release", "Tutorial", "Announcement", "Article"]),
				tags: z.array(z.string()).default([]),
			}),
		}),
		landing: defineCollection({
			type: "page",
			source: [{ include: "blog.yml" }],
			schema: PageHero,
		}),
	},
});
