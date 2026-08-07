import type { Plugin } from "vite";

/**
 * Untranslated keys live in `i18n/locales/{locale}/*.json` as empty strings, so
 * translators (and Tolgee/Lunaria) still see the full key set without English
 * text being copied into every locale.
 *
 * vue-i18n treats `""` as a valid translation and renders it verbatim, and
 * regional variants (`es-419` merges `es/*` then `es-419/*`) would let an empty
 * placeholder overwrite a real base translation. Both are fixed by dropping the
 * empty leaves before the JSON reaches the bundle: the key is then genuinely
 * absent, so the merge keeps the base value and vue-i18n falls back to
 * `fallbackLocale`.
 *
 * Locale *types* are generated from the on-disk files, so stripped keys stay
 * type-safe in `$t()` call sites.
 */
const LOCALES_SEGMENT = "/i18n/locales/";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Recursively remove empty-string leaves, and any object left empty by that
 * removal. Returns `undefined` when nothing is left to keep.
 */
export function stripEmptyMessages(value: JsonValue): JsonValue | undefined {
	if (value === "") return undefined;
	if (value === null || typeof value !== "object" || Array.isArray(value)) return value;

	const result: Record<string, JsonValue> = {};
	for (const [key, child] of Object.entries(value)) {
		const stripped = stripEmptyMessages(child);
		if (stripped !== undefined) result[key] = stripped;
	}

	return Object.keys(result).length > 0 ? result : undefined;
}

export function stripEmptyI18nMessagesPlugin(): Plugin {
	return {
		name: "wolfstar:i18n-empty-placeholders",
		// Must run before Vite's JSON plugin turns the file into an ES module.
		enforce: "pre",
		transform(code, id) {
			const path = id.split("?")[0]?.replaceAll("\\", "/");
			if (!path?.endsWith(".json") || !path.includes(LOCALES_SEGMENT)) return null;

			// `$schema` is editor tooling metadata, not a translatable message.
			const { $schema: _schema, ...messages } = JSON.parse(code) as Record<string, JsonValue>;
			const stripped = stripEmptyMessages(messages) ?? {};
			return { code: JSON.stringify(stripped), map: null };
		},
	};
}
