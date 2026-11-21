import { createSiteFeed, sendFeed } from "#server/utils/site-feed";
import { queryCollection } from "@nuxt/content/server";
import { defineEventHandler } from "nitro/h3";
import { joinURL } from "ufo";

export default defineEventHandler(async (event) => {
	const { baseUrl, feed } = createSiteFeed(event, {
		description: "Every release, improvement, and fix across the WolfStar Project.",
		path: "changelog",
		title: "WolfStar Changelog",
	});

	const entries = await queryCollection(event, "changelog").order("date", "DESC").all();

	for (const entry of entries) {
		// An entry has no page of its own: its address is its place on `/changelog`.
		const link = `${joinURL(baseUrl, "changelog")}#${changelogEntryAnchor(entry.path)}`;

		feed.addItem({
			category: [{ name: entry.kind }],
			date: new Date(entry.date),
			description: entry.description,
			id: link,
			link,
			title: entry.title,
		});
	}

	return sendFeed(event, feed);
});
