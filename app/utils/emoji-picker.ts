import { TWEMOJI_EMOJI_VERSION } from "~/utils/twemoji";

/**
 * What the emoji picker of the appeal forms is made of: the Unicode emoji,
 * grouped the way Discord's picker groups them, the server's own, and the text
 * a form stores for each.
 */

/** The sections of the picker, in the order Discord draws them. */
export const EmojiCategories = [
	"server",
	"smileys",
	"people",
	"nature",
	"food",
	"activities",
	"travel",
	"objects",
	"symbols",
] as const;
export type EmojiCategory = (typeof EmojiCategories)[number];
export type UnicodeEmojiCategory = Exclude<EmojiCategory, "server">;

/**
 * Where each group of the Emojibase data goes. The flags are left out: Windows
 * draws them as two letters, which Discord avoids by drawing its own images, and
 * so do the components, which are the skin tones and hair styles on their own.
 */
const GROUP_CATEGORIES: Readonly<Record<number, UnicodeEmojiCategory>> = {
	0: "smileys",
	1: "people",
	3: "nature",
	4: "food",
	5: "travel",
	6: "activities",
	7: "objects",
	8: "symbols",
};

/** An emoji as Emojibase's compact data gives it. */
export interface RawEmoji {
	group?: number;
	hexcode: string;
	label: string;
	unicode: string;
	tags?: readonly string[];
	skins?: readonly { hexcode: string; unicode: string }[];
}

export interface EmojiEntry {
	/** The emoji, in its default tone. */
	emoji: string;
	/** Its name, as the Unicode consortium gives it: `grinning face`. */
	label: string;
	tags: readonly string[];
	/** The emoji in each of the five skin tones, light to dark; empty when it has none. */
	skins: readonly string[];
}

/** The skin tones of the picker: none picked is the yellow of the default, then light to dark. */
export const EmojiSkinTones = [0, 1, 2, 3, 4, 5] as const;
export type EmojiSkinTone = (typeof EmojiSkinTones)[number];

/**
 * The codes of the emoji that Twemoji has no image for: the ones of an Emoji
 * version newer than its release. `versions` is Emojibase's `versions/emoji.json`,
 * the codes of each version, whose keys read like `0.6`, `13.1` and `17`.
 */
export function undrawnHexcodes(
	versions: Readonly<Record<string, readonly string[]>>,
): Set<string> {
	const codes = new Set<string>();
	for (const [version, list] of Object.entries(versions)) {
		if (Number(version) <= TWEMOJI_EMOJI_VERSION) continue;
		for (const code of list) codes.add(code);
	}
	return codes;
}

/**
 * Sorts the emoji of Emojibase into the sections of the picker, keeping their
 * order. `undrawn` holds the codes to leave out: the emoji Twemoji cannot draw,
 * and a skin tone it lacks takes the tones of that emoji with it.
 */
export function groupEmojis(
	raw: readonly RawEmoji[],
	undrawn: ReadonlySet<string> = new Set(),
): Record<UnicodeEmojiCategory, EmojiEntry[]> {
	const sections: Record<UnicodeEmojiCategory, EmojiEntry[]> = {
		smileys: [],
		people: [],
		nature: [],
		food: [],
		activities: [],
		travel: [],
		objects: [],
		symbols: [],
	};
	for (const item of raw) {
		const category = item.group === undefined ? undefined : GROUP_CATEGORIES[item.group];
		if (category === undefined || undrawn.has(item.hexcode)) continue;
		// Emoji with two people have 25 combinations and no single tone to pick:
		const hasFiveTones =
			item.skins?.length === 5 && item.skins.every((skin) => !undrawn.has(skin.hexcode));
		const skins = hasFiveTones ? (item.skins?.map((skin) => skin.unicode) ?? []) : [];
		sections[category].push({
			emoji: item.unicode,
			label: item.label,
			tags: item.tags ?? [],
			skins,
		});
	}
	return sections;
}

/** The emoji in a skin tone, or as it is when it has none. */
export function withSkinTone(entry: EmojiEntry, tone: EmojiSkinTone): string {
	return (tone === 0 ? undefined : entry.skins[tone - 1]) ?? entry.emoji;
}

/** What a search reads of an emoji: its name and its tags, lowercase. */
function haystack(label: string, tags: readonly string[]): string {
	return [label, ...tags].join(" ").toLowerCase();
}

/** Every word of the query has to be in the name or the tags of the emoji. */
export function matchesEmojiQuery(label: string, tags: readonly string[], query: string): boolean {
	const words = query
		.toLowerCase()
		.split(/[\s_:]+/u)
		.filter(Boolean);
	if (words.length === 0) return true;
	const text = haystack(label, tags);
	return words.every((word) => text.includes(word));
}

/** The emoji of a section that a search finds. */
export function searchEmojis(entries: readonly EmojiEntry[], query: string): EmojiEntry[] {
	return entries.filter((entry) => matchesEmojiQuery(entry.label, entry.tags, query));
}

/** An emoji of the server, as the guild payload gives it. */
export interface ServerEmoji {
	id: string;
	name: string;
	animated: boolean;
}

/** What a form stores for an emoji of the server: `<:name:id>`, `<a:name:id>` when it moves. */
export function serverEmojiToken(emoji: ServerEmoji): string {
	return `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`;
}

/**
 * Where Discord serves the image of an emoji of a server. An animated one is
 * served as its first frame unless `animated` asks for it to move.
 */
export function serverEmojiUrl(id: string, size = 48, animated = false): string {
	return `https://cdn.discordapp.com/emojis/${id}.webp?size=${size}${animated ? "&animated=true" : ""}`;
}

/** The emoji of a server a form stores as `<:name:id>`, or `null` for any other text. */
export function parseServerEmojiToken(value: string | null | undefined): ServerEmoji | null {
	const match = value?.match(/^<(a?):(\w{2,32}):(\d{17,20})>$/u);
	if (!match) return null;
	const [, animated, name, id] = match;
	return { id: id!, name: name!, animated: animated === "a" };
}

/** The emoji of a server the picker offers: the ones members can use, with a name a form can hold. */
export function usableServerEmojis(
	emojis: readonly { id: string; name: string | null; animated: boolean; available: boolean }[],
): ServerEmoji[] {
	return emojis.flatMap((emoji) =>
		emoji.available && emoji.name && /^\w{2,32}$/u.test(emoji.name)
			? [{ id: emoji.id, name: emoji.name, animated: emoji.animated }]
			: [],
	);
}

/** The name an emoji is written with between colons, as Discord's picker shows it: `:grinning_face:`. */
export function emojiShortcode(label: string): string {
	return `:${label
		.toLowerCase()
		.replaceAll(/[^\p{L}\p{N}]+/gu, "_")
		.replaceAll(/^_+|_+$/gu, "")}:`;
}

/** How many emoji the picker remembers as the ones a member used last. */
export const RECENT_EMOJI_LIMIT = 18;

/** The list of the last emoji used with this one first, once, and no longer than the limit. */
export function rememberEmoji(list: readonly string[], value: string): string[] {
	return [value, ...list.filter((item) => item !== value)].slice(0, RECENT_EMOJI_LIMIT);
}
