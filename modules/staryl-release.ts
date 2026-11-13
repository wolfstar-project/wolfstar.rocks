import type { StarylRelease } from "../shared/types/env.ts";
import { defineNuxtModule, useLogger } from "nuxt/kit";
import { isTest } from "std-env";
import { fetchStarylRelease } from "../config/staryl-release.ts";

/** What everything but a build shows, so none of it waits on GitHub. */
const SAMPLE_RELEASE: StarylRelease = {
	version: "1.0.0",
	time: Date.parse("2026-10-28T09:25:24Z"),
};

/**
 * Puts Staryl's version and the time of its latest change in the app config,
 * for the release line of its page. A build reads them from GitHub, since the
 * site's own build says nothing about Staryl. The dev server, `nuxt prepare`
 * (run on every install and typecheck), tests and Storybook get a sample.
 */
export default defineNuxtModule({
	meta: {
		name: "wolfstar:staryl-release",
	},
	async setup(_options, nuxt) {
		const isBuild =
			!nuxt.options.dev &&
			!nuxt.options._prepare &&
			!nuxt.options.test &&
			!isTest &&
			process.env.STORYBOOK !== "true";
		if (!isBuild) {
			nuxt.options.appConfig.starylRelease = SAMPLE_RELEASE;
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
