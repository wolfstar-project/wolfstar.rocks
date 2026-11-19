import type { H3Event } from "h3";
import { Feed } from "feed";
import { joinURL } from "ufo";

interface SiteFeedOptions {
	/** Where the feed lives: `blog` for the posts (`/blog/rss.xml`), `changelog` for the entries. */
	path: string;
	title: string;
	description: string;
}

/**
 * An empty RSS feed for one of the site's pages, with the address the site is
 * served from. A feed reader keeps absolute links, so every item's link is
 * built with the returned `baseUrl`.
 */
export function createSiteFeed(event: H3Event, { description, path, title }: SiteFeedOptions) {
	const site = getSiteConfig(event);
	const baseUrl = (
		site.url ??
		process.env.NUXT_PUBLIC_SITE_URL ??
		"https://wolfstar.rocks"
	).replace(/\/$/, "");
	const link = joinURL(baseUrl, path);

	const feed = new Feed({
		copyright: `Copyright © ${new Date().getFullYear()} WolfStar Project`,
		description,
		favicon: joinURL(baseUrl, "favicon.svg"),
		feedLinks: { rss: joinURL(link, "rss.xml") },
		id: link,
		image: joinURL(baseUrl, "logo.svg"),
		language: "en",
		link,
		title,
	});

	return { baseUrl, feed };
}

export function sendFeed(event: H3Event, feed: Feed): string {
	setResponseHeader(event, "Content-Type", "application/rss+xml; charset=utf-8");
	return feed.rss2();
}
