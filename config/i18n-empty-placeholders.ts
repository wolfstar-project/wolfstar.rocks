/**
 * Untranslated keys live in `i18n/locales/{locale}/*.json` as empty strings, so
 * translators (and Tolgee/Lunaria) still see the full key set without English
 * text being copied into every locale.
 *
 * An empty string is a perfectly valid translation as far as a runtime is
 * concerned, so it renders verbatim instead of falling back — and, for regional
 * variants (`es-419` merges `es/*` then `es-419/*`), an empty placeholder would
 * overwrite a real base translation. Both are fixed by dropping the empty
 * leaves before the JSON is merged into a locale bundle: the key is then
 * genuinely absent, so the merge keeps the base value and Nuxt I18n Micro falls
 * back to `fallbackLocale`.
 *
 * `modules/i18n-locale-bundles.ts` applies this while building the bundles that
 * `i18n.translationDir` points at; `i18n/locales/` stays the translator-facing
 * source of truth with its full key set intact.
 */
export type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue };

export type LocaleMessages = Record<string, JsonValue>;

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
 * Parse a locale JSON source, drop the `$schema` tooling pointer and every empty
 * placeholder, and return what is left.
 */
export function parseLocaleMessages(
	code: string,
	source: string,
	consumer: string,
): LocaleMessages {
	let parsed: LocaleMessages;
	try {
		parsed = JSON.parse(code) as LocaleMessages;
	} catch (error) {
		throw new Error(
			`[${consumer}] failed to parse locale JSON ${source}: ${error instanceof Error ? error.message : String(error)}`,
			{ cause: error },
		);
	}

	// `$schema` is editor tooling metadata, not a translatable message.
	const { $schema: _schema, ...messages } = parsed;
	return (stripEmptyMessages(messages) ?? {}) as LocaleMessages;
}

/**
 * Deep-merge locale message trees, later sources winning. Objects merge
 * recursively; every other value (including arrays) is replaced wholesale.
 */
export function mergeLocaleMessages(...sources: LocaleMessages[]): LocaleMessages {
	const target: LocaleMessages = {};
	for (const source of sources) {
		mergeInto(target, source);
	}
	return target;
}

function mergeInto(target: LocaleMessages, source: LocaleMessages): void {
	for (const [key, value] of Object.entries(source)) {
		const existing = target[key];
		if (isPlainObject(existing) && isPlainObject(value)) {
			mergeInto(existing, value);
			continue;
		}
		target[key] = value;
	}
}

function isPlainObject(value: JsonValue | undefined): value is LocaleMessages {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
