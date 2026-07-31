/**
 * Tolgee CLI config for WolfStar.rocks (project "Wolfstar Site", id 33602).
 *
 * Local layout: i18n/locales/{nuxtLocale}/{namespace}.json
 * Tolgee tags are shorter (cs-CZ → cs, zh-CN → zh-Hans, …). Base English
 * lives in `en/` (same content as en-US); base Spanish in `es/` (≈ es-ES).
 *
 * Free plan key limit is 500; this repo has ~552 string keys across namespaces.
 * Prefer pushing only languages with real translations until the plan is upgraded:
 *   pnpm tolgee:push -- --languages en es it
 *
 * Set TOLGEE_API_KEY (Project API Key or PAT) in the environment — never commit it.
 * The same key is configured on the Tolgee MCP server in Cursor.
 */
const NAMESPACES = ["common", "auth", "dashboard", "guilds", "profile", "components"];

/** Local directory → Tolgee language tag (canonical sources only). */
const LOCALE_MAP = {
	"en": "en",
	"en-GB": "en-GB",
	"es": "es",
	"es-419": "es-419",
	"cs-CZ": "cs",
	"da-DK": "da",
	"de-DE": "de",
	"el-GR": "el",
	"fi-FI": "fi",
	"fr-FR": "fr",
	"hi-IN": "hi",
	"hr-HR": "hr",
	"hu-HU": "hu",
	"id-ID": "id",
	"it-IT": "it",
	"ko-KR": "ko",
	"lt-LT": "lt",
	"nl-NL": "nl",
	"pt-PT": "pt",
	"ro-RO": "ro",
	"ru-RU": "ru",
	"tr-TR": "tr",
	"uk-UA": "uk",
};

/** Tolgee language tag → Nuxt locale directory (for pull remapping). */
const TOLGEE_TO_LOCAL = Object.fromEntries(
	Object.entries(LOCALE_MAP).map(([local, tag]) => [tag, local]),
);

const pushFiles = Object.entries(LOCALE_MAP).flatMap(([localDir, language]) =>
	NAMESPACES.map((namespace) => ({
		path: `./i18n/locales/${localDir}/${namespace}.json`,
		language,
		namespace,
	})),
);

module.exports = {
	$schema: "https://docs.tolgee.io/cli-schema.json",
	projectId: 33768,
	format: "JSON_TOLGEE",
	parser: "vue",
	// App deep-merges feature files; keys are used without vue-i18n namespaces.
	strictNamespace: false,
	patterns: [
		"./app/components/**/*.vue",
		"./app/pages/**/*.vue",
		"./app/composables/**/*.ts",
		"./app/utils/**/*.ts",
		"./app/layouts/**/*.vue",
	],
	push: {
		forceMode: "KEEP",
		tagNewKeys: ["migrated"],
		files: pushFiles,
	},
	pull: {
		// Pull into a staging dir; `pnpm tolgee:pull` remaps tags → Nuxt folders.
		path: "./i18n/.tolgee-pull",
		fileStructureTemplate: "{languageTag}/{namespace}.{extension}",
		delimiter: ".",
	},
	// Exported for scripts/tolgee-pull-remap.ts
	tolgeeToLocal: TOLGEE_TO_LOCAL,
	namespaces: NAMESPACES,
};
