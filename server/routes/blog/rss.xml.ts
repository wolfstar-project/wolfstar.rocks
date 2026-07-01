import type { H3Event } from "h3";
import { queryCollection } from "@nuxt/content/server";
import { Feed } from "feed";
import { joinURL } from "ufo";

export default defineEventHandler(async (event: H3Event) => {
	const site = getSiteConfig(event);
	const baseUrl = (
		site.url ??
		process.env.NUXT_PUBLIC_SITE_URL ??
		"https://wolfstar.rocks"
	).replace(/\/$/, "");
	const siteUrl = joinURL(baseUrl, "blog");

	const feed = new Feed({
		title: "The WolfStar Blog",
		description: "News and updates about WolfStar, Staryl, and the WolfStar Project network.",
		id: siteUrl,
		link: siteUrl,
		language: "en",
		image: joinURL(baseUrl, "logo.svg"),
		favicon: joinURL(baseUrl, "favicon.svg"),
		copyright: `Copyright © ${new Date().getFullYear()} WolfStar Project`,
		feedLinks: {
			rss: `${siteUrl}/rss.xml`,
		},
	});

	const articles = await queryCollection(event, "blog")
		.where("draft", "=", false)
		.order("date", "DESC")
		.all();

	for (const article of articles) {
		if (article.path === "/blog") {
			continue;
		}

		feed.addItem({
			link: joinURL(baseUrl, article.path),
			image: article.image ? joinURL(baseUrl, article.image) : undefined,
			title: article.title,
			date: new Date(article.date),
			description: article.description,
			category: [{ name: article.category }],
		});
	}

	appendHeader(event, "Content-Type", "application/xml");
	return feed.rss2();
});
