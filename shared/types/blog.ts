export interface BlogAuthor {
	name: string;
	description?: string;
	to?: string;
	twitter?: string;
	avatar?: {
		src: string;
		alt?: string;
	};
}

export interface BlogArticle {
	path: string;
	stem?: string;
	title: string;
	description: string;
	date: string;
	image?: string;
	category: "Release" | "Tutorial" | "Announcement" | "Article";
	tags: string[];
	draft: boolean;
	authors: BlogAuthor[];
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
