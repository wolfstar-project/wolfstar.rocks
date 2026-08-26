type SettingsEntryField = "name" | "title" | "tooltip" | "description";

interface SettingsEntryLike {
	key: string;
	name?: string;
	title?: string;
	tooltip?: string;
	description?: string;
}

/**
 * Translate shared settings-entry labels (roles/channels/events/moderation)
 * keyed by the entry's stable `key` field. Falls back to the English source string.
 */
export function useSettingsEntryI18n() {
	const { ts: t, has: te } = useI18n();

	function translateEntry(entry: SettingsEntryLike, field: SettingsEntryField): string {
		const i18nKey = `settings.entries.${entry.key}.${field}`;
		if (te(i18nKey)) {
			return t(i18nKey);
		}

		const fallback = entry[field];
		if (typeof fallback === "string") {
			return fallback;
		}

		return entry.name ?? entry.title ?? entry.key;
	}

	return { translateEntry };
}
