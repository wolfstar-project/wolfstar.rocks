/**
 * Tolgee CLI config for WolfStar.rocks (project "Wolfstar Website", id 33768).
 *
 * Local layout: i18n/locales/{nuxtLocale}/{namespace}.json
 * Regional English/Spanish keep base dirs (`en/`, `es/`) plus variants via
 * `countryLocaleVariants`. Other locales use wolfstar `src/languages/` names
 * (`de`, `it`, `pt-BR`, …). Tolgee tags stay short (`cs-CZ`→`cs` era → now
 * local `cs`→`cs`; `pt-BR`→`pt`).
 *
 * Push maps each file via `push.files[*].language` to those short tags. The
 * platform must already have matching languages — run
 * `node scripts/tolgee-ensure-languages.mjs` after creating/cloning a project.
 *
 * Free plan key limit is 500; this repo has ~552 string keys across namespaces.
 * Prefer pushing only languages with real translations until the plan is upgraded:
 *   pnpm tolgee:push -- --languages en es it
 *
 * Set TOLGEE_API_KEY (Project API Key or PAT) in the environment — never commit it.
 * `tolgee login` PAT also works. MCP may still point at the older Wolfstar (33602) PAK.
 */
const NAMESPACES = ["common", "auth", "dashboard", "guilds", "profile", "components"];

/** Local directory → Tolgee language tag (canonical sources only). */
const LOCALE_MAP = {
	en: "en",
	"en-GB": "en-GB",
	es: "es",
	"es-419": "es-419",
	cs: "cs",
	da: "da",
	de: "de",
	el: "el",
	fi: "fi",
	fr: "fr",
	hi: "hi",
	hr: "hr",
	hu: "hu",
	id: "id",
	it: "it",
	ko: "ko",
	lt: "lt",
	nl: "nl",
	"pt-BR": "pt",
	ro: "ro",
	ru: "ru",
	tr: "tr",
	uk: "uk",
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
