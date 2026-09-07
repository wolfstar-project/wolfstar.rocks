export type TolgeeDictionary = {
	[key: string]: string | TolgeeDictionary;
};

/**
 * Editor tooling pointer carried by every locale file. It is metadata, not a
 * translatable message, so it must never travel to Tolgee in either direction:
 * pushing it creates a bogus `$schema` key translators can see and edit, and
 * pulling it back would overwrite the local pointer with whatever the platform
 * happens to hold.
 */
export const SCHEMA_POINTER_KEY = "$schema";

/** Canonical `$schema` pointer for a namespace's locale file. */
export function localeSchemaPointer(namespace: string): string {
	return `../../schemas/${namespace}.schema.json`;
}

/** Drop the `$schema` tooling pointer from a locale document. */
export function withoutSchemaPointer<T>(document: Record<string, T>): Record<string, T> {
	const { [SCHEMA_POINTER_KEY]: _pointer, ...rest } = document;
	return rest;
}

/**
 * Replace whatever `$schema` value a pull produced with the repository's own
 * pointer, kept first so remapped files keep the local key order.
 */
export function withLocaleSchemaPointer(
	dictionary: TolgeeDictionary,
	namespace: string,
): TolgeeDictionary {
	return {
		[SCHEMA_POINTER_KEY]: localeSchemaPointer(namespace),
		...withoutSchemaPointer(dictionary),
	};
}

function normalizeDictionaryValue(value: unknown, path: string): string | TolgeeDictionary {
	if (value === null) return "";
	if (typeof value === "string") return value;
	if (typeof value !== "object" || Array.isArray(value)) {
		throw new TypeError(`Expected a string or nested dictionary at ${path}`);
	}

	return Object.fromEntries(
		Object.entries(value).map(([key, child]) => [
			key,
			normalizeDictionaryValue(child, `${path}.${key}`),
		]),
	);
}

/** Convert Tolgee's null untranslated values to the repository's empty placeholders. */
export function normalizeTolgeeDictionary(value: unknown): TolgeeDictionary {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new TypeError("Expected a Tolgee dictionary at the document root");
	}

	return Object.fromEntries(
		Object.entries(value).map(([key, child]) => [
			key,
			normalizeDictionaryValue(child, `$.${key}`),
		]),
	);
}
