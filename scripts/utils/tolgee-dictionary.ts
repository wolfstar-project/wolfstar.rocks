export type TolgeeDictionary = {
	[key: string]: string | TolgeeDictionary;
};

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
