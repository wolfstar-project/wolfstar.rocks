export type NestedRecord = Record<string, unknown>;

function isNested(value: unknown): value is NestedRecord {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Whether a locale has a string for a key. An untranslated key is kept as an
 * empty string, which the app shows in the fallback language instead.
 */
function isTranslated(value: unknown): boolean {
	return value !== undefined && value !== null && value !== "";
}

/**
 * Merges the strings of a locale's directories, base first, as the app's
 * bundle does: a later directory's string replaces an earlier one, but its
 * empty strings do not hide the base's translations.
 */
export function mergeLocaleStrings(layers: readonly NestedRecord[]): NestedRecord {
	const merged: NestedRecord = {};
	for (const layer of layers) {
		mergeInto(merged, layer);
	}
	return merged;
}

function mergeInto(target: NestedRecord, source: NestedRecord) {
	for (const [key, value] of Object.entries(source)) {
		if (isNested(value)) {
			const existing = target[key];
			const nested = isNested(existing) ? existing : {};
			mergeInto(nested, value);
			target[key] = nested;
		} else if (isTranslated(value) || !(key in target)) {
			target[key] = value;
		}
	}
}

/** Counts the strings of the source locale. */
export function countKeys(obj: NestedRecord): number {
	let count = 0;
	for (const value of Object.values(obj)) {
		count += isNested(value) ? countKeys(value) : 1;
	}
	return count;
}

/** The dot paths of the source's keys that the target has no string for. */
export function collectMissingKeys(
	source: NestedRecord,
	target: NestedRecord,
	prefix = "",
): string[] {
	const missing: string[] = [];
	for (const [key, sourceValue] of Object.entries(source)) {
		const path = prefix ? `${prefix}.${key}` : key;
		const targetValue = target[key];

		if (isNested(sourceValue)) {
			missing.push(
				...collectMissingKeys(sourceValue, isNested(targetValue) ? targetValue : {}, path),
			);
		} else if (!isTranslated(targetValue)) {
			missing.push(path);
		}
	}
	return missing;
}
