import { defineCollection, defineContentConfig } from "@nuxt/content";
import { array, boolean, object, optional, string } from "valibot";

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
				date: string(),
				draft: optional(boolean(), false),
				badge: optional(
					object({
						label: string(),
					}),
				),
				tags: optional(array(string())),
			}),
		}),
	},
});
