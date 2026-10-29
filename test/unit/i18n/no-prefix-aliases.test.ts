import type { NuxtPage } from "nuxt/schema";
import { NoPrefixPathStrategy } from "@i18n-micro/path-strategy/no-prefix";
import { describe, expect, it } from "vitest";
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

// The patch in `patches/@i18n-micro__path-strategy@1.3.20.patch`: a language
// switch never moves away from the current path.
describe("no_prefix language switch", () => {
	it("stays on the path the visitor is on, an alias included", () => {
		const strategy = new NoPrefixPathStrategy({
			defaultLocale: "en-US",
			locales: [{ code: "en-US" }, { code: "it-IT" }],
			strategy: "no_prefix",
		} as ConstructorParameters<typeof NoPrefixPathStrategy>[0]);
		const route = {
			fullPath: "/?ref=nav#top",
			hash: "#top",
			matched: [],
			meta: {},
			name: "wolfstar",
			params: {},
			path: "/",
			query: { ref: "nav" },
			redirectedFrom: undefined,
		};

		expect(strategy.switchLocaleRoute("en-US", "it-IT", route, {})).toStrictEqual({
			hash: "#top",
			path: "/",
			query: { ref: "nav" },
		});
	});
});
