import type { LunariaUserConfig } from "@lunariajs/core/config";
import configJson from "./lunaria.config.json" with { type: "json" };

/**
 * Typed stable (0.1.x) Lunaria config shared with `lunaria/lunaria.ts`.
 * The JSON file is the source of truth for the local Lunaria CLI
 * (stable `@lunariajs/core` only loads `.json` configs).
 *
 * Keep `locales` in sync with `config/i18n.ts` when adding languages.
 */
export const stableConfig = configJson as LunariaUserConfig;

/**
 * Config for the Lunaria GitHub Action (`lunariajs/action`), which bundles the
 * v1 prerelease of `@lunariajs/core`. The v1 loader only reads
 * `lunaria.config.{mjs,js,ts,mts,cjs,cts}` (never the `.json`) and uses a
 * different schema than stable 0.1.x: `sourceLocale` instead of
 * `defaultLocale`, `files[].include` glob arrays instead of `location`, and
 * nested boolean records instead of key arrays for `optionalKeys`.
 * Shared fields are derived from the JSON so the two configs cannot drift.
 */
const config = {
	repository: configJson.repository,
	sourceLocale: configJson.defaultLocale,
	locales: configJson.locales,
	files: [
		{
			include: ["i18n/locales/en/**/*.json"],
			pattern: "i18n/locales/@lang/@path",
			type: "dictionary",
			/** `$schema` is editor tooling metadata, not a translatable key. */
			optionalKeys: { $schema: true },
		},
	],
	tracking: {
		ignoredKeywords: configJson.ignoreKeywords,
	},
};

export default config;
