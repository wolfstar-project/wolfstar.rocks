import { defineContentConfig, defineCollection, z } from "@nuxt/content";
import { BLOG_CATEGORIES, CHANGELOG_KINDS } from "./shared/utils/blog.ts";

// docs/blog.md is the guide to these fields for whoever writes the content.

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

export default defineContentConfig({
	collections: {
		blog: defineCollection({
			type: "page",
			source: "blog/*.md",
			schema: z.object({
				image: z.string().optional(),
				authors: z.array(Author),
				date: z.string(),
				draft: z.boolean().default(false),
				category: z.enum(BLOG_CATEGORIES),
				tags: z.array(z.string()).default([]),
				// Written by modules/blog-content.ts, never in the frontmatter.
				readingTime: z.number().optional(),
			}),
		}),
		changelog: defineCollection({
			type: "page",
			source: "changelog/*.md",
			schema: z.object({
				description: z.string(),
				date: z.string(),
				kind: z.enum(CHANGELOG_KINDS),
				image: z.string().optional(),
				authors: z.array(Author).default([]),
			}),
		}),
	},
});
