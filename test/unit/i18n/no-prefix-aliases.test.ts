import type { NuxtPage } from "nuxt/schema";
import { createPathStrategy } from "@i18n-micro/path-strategy";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { dropLocalizedAliasPages } from "../../../modules/i18n-no-prefix-aliases.ts";

describe("dropLocalizedAliasPages", () => {
	it("drops the locale-prefixed twins of aliased pages, children included", () => {
		const pages: NuxtPage[] = [
			{ alias: ["/"], name: "wolfstar", path: "/wolfstar" },
			{ name: "localized-wolfstar", path: "/:locale(en-US|it-IT)" },
			{
				children: [
					{ name: "app-logs", path: "logs" },
					{ name: "localized-app-logs", path: "/:locale(en-US|it-IT)/logs" },
				],
				name: "app",
				path: "/app",
			},
		];

		dropLocalizedAliasPages(pages);

		expect(pages.map((page) => page.name)).toStrictEqual(["wolfstar", "app"]);
		expect(pages[1]?.children?.map((page) => page.name)).toStrictEqual(["app-logs"]);
	});
});

// The patch in `patches/@i18n-micro__path-strategy@2.1.0.patch`: a language
// switch never moves away from the current path.
describe("no_prefix language switch", () => {
	it("stays on the path the visitor is on, an alias included", () => {
		const router = createRouter({
			history: createMemoryHistory(),
			routes: [
				{
					alias: ["/"],
					component: {},
					// What Micro adds to every localized page: without it the
					// strategy does not know the page and leaves the route as is.
					meta: { i18n: { locales: ["en-US", "it-IT"], name: "wolfstar" } },
					name: "wolfstar",
					path: "/wolfstar",
				},
			],
		});
		const strategy = createPathStrategy({
			defaultLocale: "en-US",
			locales: [{ code: "en-US" }, { code: "it-IT" }],
			router,
			strategy: "no_prefix",
		});

		expect(strategy.switchLocaleRoute("it-IT", router.resolve("/?ref=nav#top"))).toMatchObject({
			hash: "#top",
			path: "/",
			query: { ref: "nav" },
		});
	});
});
