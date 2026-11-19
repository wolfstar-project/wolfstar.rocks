import { queryCollection } from "@nuxt/content/server";
import { joinURL } from "ufo";

export default defineEventHandler(async (event) => {
	const { baseUrl, feed } = createSiteFeed(event, {
		description: "News and updates about WolfStar, Staryl, and the WolfStar Project network.",
		path: "blog",
		title: "The WolfStar Blog",
	});

	const posts = await queryCollection(event, "blog")
		.where("draft", "=", false)
		.order("date", "DESC")
		.all();

	for (const post of posts) {
		feed.addItem({
			category: [{ name: post.category }],
			date: new Date(post.date),
			description: post.description,
			image: post.image ? joinURL(baseUrl, post.image) : undefined,
			link: joinURL(baseUrl, post.path),
			title: post.title,
		});
	}

	return sendFeed(event, feed);
});
