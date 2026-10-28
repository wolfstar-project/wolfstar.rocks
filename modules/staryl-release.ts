import { defineNuxtModule, useLogger } from "nuxt/kit";
import { isTest } from "std-env";
import { fetchStarylRelease } from "../config/staryl-release.ts";

/**
 * Puts Staryl's version and the time of its latest change in the app config,
 * for the release line of its page. They are read from GitHub at build time,
 * since the site's own build says nothing about Staryl; tests and Storybook get
 * a fixed release instead.
 */
export default defineNuxtModule({
	meta: {
		name: "wolfstar:staryl-release",
	},
	async setup(_options, nuxt) {
		if (isTest || nuxt.options.test || process.env.STORYBOOK === "true") {
			nuxt.options.appConfig.starylRelease = {
				version: "1.0.0",
				time: Date.parse("2026-10-28T09:25:24Z"),
			};
			return;
		}

		const release = await fetchStarylRelease({ token: process.env.GITHUB_TOKEN });
		if (!release) {
			useLogger("wolfstar:staryl-release").warn(
				"Staryl's release could not be read from GitHub: its page shows the source link alone.",
			);
		}
		nuxt.options.appConfig.starylRelease = release;
	},
});
