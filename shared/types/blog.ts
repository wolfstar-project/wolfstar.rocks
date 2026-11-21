import type { BLOG_CATEGORIES, CHANGELOG_KINDS } from "#shared/utils/blog";

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type ChangelogKind = (typeof CHANGELOG_KINDS)[number];

interface BlogAuthor {
	name: string;
	description?: string;
	to?: string;
	twitter?: string;
	avatar?: {
		src: string;
		alt?: string;
	};
}

/** What a list of posts needs of each one: no body. */
export interface BlogPostSummary {
	path: string;
	title: string;
	description: string;
	date: string;
	image?: string;
	category: BlogCategory;
	authors: BlogAuthor[];
	/** Whole minutes, written at build time by `modules/blog-content.ts`. */
	readingTime?: number;
}

export interface BlogArticle extends BlogPostSummary {
	stem?: string;
	tags: string[];
	draft: boolean;
	body?: {
		toc?: {
			links: Array<{
				id: string;
				text: string;
				depth: number;
				children?: Array<{
					id: string;
					text: string;
					depth: number;
				}>;
			}>;
		};
	};
}

/** What the blog's timeline needs of a changelog entry: no body. */
export interface ChangelogEntrySummary {
	path: string;
	title: string;
	description: string;
	date: string;
	kind: ChangelogKind;
}
