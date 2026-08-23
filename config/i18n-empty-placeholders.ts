import MagicString from "magic-string";
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
const EMPTY_PLACEHOLDERS_PLUGIN = "wolfstar:i18n-empty-placeholders";
const ALREADY_ES_MODULE = /^\s*export\b/;
const prioritizedResourcePlugins = new WeakSet<Plugin>();

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type ApplyToEnvironment = NonNullable<Plugin["applyToEnvironment"]>;
type AppliedPlugins = Awaited<ReturnType<ApplyToEnvironment>>;

/**
 * Both transforms depend on running before Vite's built-in JSON transform: the
 * resource compiler cannot parse `export default {…}` as JSON, and skipping it
 * silently would ship an uncompiled locale module that only fails at render
 * time under a runtime-only vue-i18n build. Fail loudly with the locale path
 * from either guard instead.
 */
function alreadyEsModuleMessage(plugin: string, id: string): string {
	return `[${plugin}] ${id} was already transformed into an ES module before empty placeholders could be stripped; the plugin lost its "pre" transform position.`;
}

function isVitePlugin(candidate: PluginOption): candidate is Plugin {
	return (
		!!candidate &&
		!Array.isArray(candidate) &&
		typeof candidate === "object" &&
		"name" in candidate
	);
}

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
 * `applyToEnvironment` may either gate the plugin (boolean) or return the
 * plugin(s) that actually run in that environment; only the latter carries
 * transforms that still need prioritizing.
 */
function prioritizeAppliedPlugins(applied: AppliedPlugins): void {
	if (typeof applied === "boolean") return;
	prioritizeVueI18nResourceTransform(Array.isArray(applied) ? applied : [applied]);
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
		if (Array.isArray(candidate)) {
			prioritizeVueI18nResourceTransform(candidate);
			continue;
		}
		if (!isVitePlugin(candidate)) continue;

		const plugin = candidate;
		if (
			!plugin.name.includes(VUE_I18N_RESOURCE_PLUGIN) ||
			prioritizedResourcePlugins.has(plugin)
		) {
			continue;
		}

		prioritizedResourcePlugins.add(plugin);

		const applyToEnvironment = plugin.applyToEnvironment;
		if (applyToEnvironment) {
			plugin.applyToEnvironment = function (environment) {
				const applied = applyToEnvironment.call(this, environment);
				if (!(applied instanceof Promise)) {
					prioritizeAppliedPlugins(applied);
					return applied;
				}

				return applied.then((resolved: AppliedPlugins) => {
					prioritizeAppliedPlugins(resolved);
					return resolved;
				}) as ReturnType<ApplyToEnvironment>;
			};
		}

		if (!plugin.transform) continue;
		const transform = plugin.transform;
		const handler = typeof transform === "function" ? transform : transform.handler;
		plugin.transform = {
			...(typeof transform === "function" ? {} : transform),
			order: "pre",
			async handler(code, id, options) {
				const path = id.split("?")[0]?.replaceAll("\\", "/");
				if (
					path?.endsWith(".json") &&
					path.includes(LOCALES_SEGMENT) &&
					ALREADY_ES_MODULE.test(code)
				) {
					throw new Error(alreadyEsModuleMessage(VUE_I18N_RESOURCE_PLUGIN, id));
				}

				return handler.call(this, code, id, options);
			},
		};
	}
}

export function stripEmptyI18nMessagesPlugin(): Plugin {
	return {
		name: EMPTY_PLACEHOLDERS_PLUGIN,
		// Registration order keeps this before the resource compiler; hook order
		// keeps both transforms before Vite+'s built-in JSON transform.
		enforce: "pre",
		// Modules that inject their Vite plugins from a later `vite:extendConfig`
		// hook (@nuxt/kit's env-injection path, used whenever `config.environments`
		// is missing — Storybook builds) land after nuxt.config's own hook, so
		// prioritize again here: plugin `config()` hooks run once the inline plugin
		// list is complete. `prioritizedResourcePlugins` keeps this idempotent.
		config(config) {
			prioritizeVueI18nResourceTransform(config.plugins ?? []);
		},
		transform: {
			order: "pre",
			handler(code, id) {
				const path = id.split("?")[0]?.replaceAll("\\", "/");
				if (!path?.endsWith(".json") || !path.includes(LOCALES_SEGMENT)) return null;

				// Losing the `pre` position lets Vite's own JSON transform run
				// first; fail loudly with the locale path instead of a bare
				// `SyntaxError` from `JSON.parse`.
				if (ALREADY_ES_MODULE.test(code)) {
					throw new Error(alreadyEsModuleMessage(EMPTY_PLACEHOLDERS_PLUGIN, id));
				}

				// `$schema` is editor tooling metadata, not a translatable message.
				let parsed: Record<string, JsonValue>;
				try {
					parsed = JSON.parse(code) as Record<string, JsonValue>;
				} catch (error) {
					throw new Error(
						`[${EMPTY_PLACEHOLDERS_PLUGIN}] failed to parse locale JSON ${id}: ${error instanceof Error ? error.message : String(error)}`,
						{ cause: error },
					);
				}

				const { $schema: _schema, ...messages } = parsed;
				const stripped = stripEmptyMessages(messages) ?? {};
				const rewritten = new MagicString(code);
				rewritten.overwrite(0, code.length, JSON.stringify(stripped));

				return {
					code: rewritten.toString(),
					map: rewritten.generateMap({ source: id, includeContent: true, hires: true }),
				};
			},
		},
	};
}
