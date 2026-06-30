import { defineContentConfig, defineCollection, z } from "@nuxt/content";

export default defineContentConfig({
	collections: {
		blog: defineCollection({
			type: "page",
			source: "blog/**",
			schema: z.object({
				image: z.string().optional(),
				author: z.string(),
				date: z.string(),
				tags: z.array(z.string()).default([]),
				draft: z.boolean().default(false),
			}),
		}),
	},
});
