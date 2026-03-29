import { defineCollection, defineContentConfig } from "@nuxt/content";
import { array, boolean, isoDate, object, optional, picklist, pipe, string } from "valibot";

const categories = ["Release", "Tutorial", "Announcement", "Article"] as const;

const Image = object({
	src: string(),
	alt: string(),
});

const Author = object({
	name: string(),
	description: optional(string()),
	username: optional(string()),
	twitter: optional(string()),
	bluesky: optional(string()),
	to: optional(string()),
	avatar: optional(Image),
});

export default defineContentConfig({
	collections: {
		blog: defineCollection({
			type: "page",
			source: "blog/**/*.md",
			schema: object({
				image: optional(string()),
				authors: array(Author),
				date: pipe(string(), isoDate()),
				draft: optional(boolean(), false),
				category: picklist(categories),
			}),
		}),
	},
});
