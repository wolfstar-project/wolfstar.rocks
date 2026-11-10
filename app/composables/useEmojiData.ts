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
			const [{ default: data }, { default: versions }] = await Promise.all([
				import("emojibase-data/en/compact.json"),
				import("emojibase-data/versions/emoji.json"),
			]);
			// Twemoji draws every emoji the same way on every system, so none is left
			// out for the system's font; only the newest, which it has no image for yet.
			sections.value = groupEmojis(data as readonly RawEmoji[], undrawnHexcodes(versions));
			status.value = "success";
		} catch {
			status.value = "error";
		}
	}

	return { load, sections, status };
}
