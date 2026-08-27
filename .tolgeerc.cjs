/**
 * Tolgee CLI config for WolfStar.rocks (project "Wolfstar Website", id 33768).
 *
 * Local layout: i18n/locales/{nuxtLocale}/{namespace}.json
 * Tolgee tags are shorter (cs-CZ → cs, zh-CN → zh-Hans, …). Base English
 * lives in `en/` (same content as en-US); base Spanish in `es/` (≈ es-ES).
 *
 * Push maps each file via `push.files[*].language` to those short tags. The
 * platform must already have matching languages — run
 * `node scripts/tolgee-ensure-languages.mjs` after creating/cloning a project.
 *
 * The `$schema` pointer in each locale file is editor tooling metadata and never
 * migrates: push reads a stripped staging mirror (see PUSH_STAGING_DIR below) and
 * `scripts/tolgee-pull-remap.ts` restores the local pointer on the way back. A
 * `$schema` key left on the platform from an earlier push is inert but should be
 * deleted once in the Tolgee UI.
 *
 * Free plan key limit is 500; this repo has ~907 string keys across all eight
 * namespaces (up from ~562 across the original six, before `errors` and
 * `marketing` were added — `marketing` alone contributes ~320). The key limit
 * is per-project, not per-language, so scoping a push with `--languages` does
 * NOT reduce the key count pushed. Confirm the plan has been upgraded before
 * pushing for real; until then, keep pushes to a scratch/staging project or
 * push a reduced namespace/pattern subset.
 *
 * NAMESPACES is derived from i18n/locale-features.json so the two sources
 * can't drift; `.json` suffixes are stripped to get Tolgee namespace names.
 *
 * Set TOLGEE_API_KEY (Project API Key or PAT) in the environment — never commit it.
 * `tolgee login` PAT also works. MCP may still point at the older Wolfstar (33602) PAK.
 */
const localeFeatures = require("./i18n/locale-features.json");
const NAMESPACES = localeFeatures.features.map((file) => file.replace(/\.json$/, ""));

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

/**
 * Push reads a staging mirror instead of `i18n/locales/` so the `$schema`
 * tooling pointer never reaches the platform as a translatable key.
 * `scripts/tolgee-push-prepare.ts` rebuilds it before every push.
 */
const PUSH_STAGING_DIR = "./i18n/.tolgee-push";

const pushEntries = Object.entries(LOCALE_MAP).flatMap(([localDir, language]) =>
	NAMESPACES.map((namespace) => ({
		source: `./i18n/locales/${localDir}/${namespace}.json`,
		path: `${PUSH_STAGING_DIR}/${localDir}/${namespace}.json`,
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
		files: pushEntries.map(({ source: _source, ...file }) => file),
	},
	pull: {
		// Pull into a staging dir; `pnpm tolgee:pull` remaps tags → Nuxt folders.
		path: "./i18n/.tolgee-pull",
		fileStructureTemplate: "{languageTag}/{namespace}.{extension}",
		delimiter: ".",
		// `tolgee pull` defaults to TRANSLATED + REVIEWED, and the remap script
		// overwrites each locale file wholesale — so untranslated keys would be
		// dropped from disk on every sync. Export them too; Tolgee represents them
		// as null and scripts/tolgee-pull-remap.ts converts them to empty strings so
		// they survive as placeholders instead of disappearing or being refilled
		// with English. See wolfstar-project/wolfstar#240.
		states: ["TRANSLATED", "REVIEWED", "UNTRANSLATED"],
	},
	// Exported for scripts/tolgee-pull-remap.ts
	tolgeeToLocal: TOLGEE_TO_LOCAL,
	namespaces: NAMESPACES,
	// Exported for scripts/tolgee-push-prepare.ts
	pushStaging: {
		path: PUSH_STAGING_DIR,
		files: pushEntries.map(({ source, path }) => ({ source, path })),
	},
};
