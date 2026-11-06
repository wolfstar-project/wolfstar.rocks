import type { EmojiEntry } from "~/utils/emoji-picker";
import {
	createEmojiSupportCheck,
	groupEmojis,
	type RawEmoji,
	type UnicodeEmojiCategory,
} from "~/utils/emoji-picker";

/**
 * The Unicode emoji of the picker, grouped. The data is a chunk of its own, a
 * few hundred kilobytes that only the picker reads, so it is fetched when the
 * picker opens and not before.
 */
export function useEmojiData() {
	const sections = shallowRef<Record<UnicodeEmojiCategory, EmojiEntry[]> | null>(null);
	const status = ref<"idle" | "pending" | "success" | "error">("idle");

	async function load() {
		if (status.value === "pending" || status.value === "success") return;

		status.value = "pending";
		try {
			const { default: data } = await import("emojibase-data/en/compact.json");
			const drawn = createEmojiSupportCheck();
			const grouped = groupEmojis(data as readonly RawEmoji[]);
			// Only what this browser draws as an emoji: see `createEmojiSupportCheck`.
			for (const id of Object.keys(grouped) as UnicodeEmojiCategory[]) {
				grouped[id] = grouped[id].filter((entry) => drawn(entry.emoji));
			}
			sections.value = grouped;
			status.value = "success";
		} catch {
			status.value = "error";
		}
	}

	return { load, sections, status };
}
