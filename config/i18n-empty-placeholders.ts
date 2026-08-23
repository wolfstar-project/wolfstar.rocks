import type { Plugin, PluginOption } from "vite";

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
const VUE_I18N_RESOURCE_PLUGIN = "unplugin-vue-i18n:resource";

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

/**
 * Vite+ uses Rolldown's per-hook ordering for its built-in JSON transform.
 * `enforce: "pre"` on unplugin-vue-i18n is therefore not sufficient to keep
 * that resource compiler ahead of `vite:json`; without this explicit order it
 * receives the JSON plugin's `export default` output and tries to parse it as
 * JSON. This can be removed once unplugin-vue-i18n sets the hook order itself.
 */
export function prioritizeVueI18nResourceTransform(plugins: readonly PluginOption[]): void {
	for (const candidate of plugins) {
		if (
			!candidate ||
			Array.isArray(candidate) ||
			typeof candidate !== "object" ||
			!("name" in candidate)
		) {
			continue;
		}

		const plugin = candidate;
		if (plugin.name !== VUE_I18N_RESOURCE_PLUGIN || !plugin.transform) continue;

		const transform = plugin.transform;
		plugin.transform =
			typeof transform === "function"
				? { order: "pre", handler: transform }
				: { ...transform, order: "pre" };
	}
}

export function stripEmptyI18nMessagesPlugin(): Plugin {
	return {
		name: "wolfstar:i18n-empty-placeholders",
		// Registration order keeps this before the resource compiler; hook order
		// keeps both transforms before Vite+'s built-in JSON transform.
		enforce: "pre",
		config(config) {
			prioritizeVueI18nResourceTransform(config.plugins ?? []);
		},
		transform: {
			order: "pre",
			handler(code, id) {
				const path = id.split("?")[0]?.replaceAll("\\", "/");
				if (!path?.endsWith(".json") || !path.includes(LOCALES_SEGMENT)) return null;

				// `$schema` is editor tooling metadata, not a translatable message.
				const { $schema: _schema, ...messages } = JSON.parse(code) as Record<
					string,
					JsonValue
				>;
				const stripped = stripEmptyMessages(messages) ?? {};
				return { code: JSON.stringify(stripped), map: null };
			},
		},
	};
}
