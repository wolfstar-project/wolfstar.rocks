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
	label: string;
	unicode: string;
	tags?: readonly string[];
	skins?: readonly { unicode: string }[];
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

/** Sorts the emoji of Emojibase into the sections of the picker, keeping their order. */
export function groupEmojis(raw: readonly RawEmoji[]): Record<UnicodeEmojiCategory, EmojiEntry[]> {
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
		if (category === undefined) continue;
		// Emoji with two people have 25 combinations and no single tone to pick:
		const skins = item.skins?.length === 5 ? item.skins.map((skin) => skin.unicode) : [];
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

/**
 * The fonts the picker draws emoji with: the colour ones of each system first,
 * so a system whose first font for a character is a plain outline of it, as some
 * Linux fonts have for the faces, does not draw the face as one.
 */
export const EMOJI_FONT_FAMILY =
	'"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';

/**
 * Tells whether this browser draws an emoji as one picture. The newest emoji
 * are on a system only after it is updated: before that it draws a box with the
 * code of the character, or the pieces of a sequence side by side, and a picker
 * that offered them would offer what the member cannot see. Discord draws its
 * own images and has no such emoji; this asks the canvas instead.
 *
 * A glyph that is part of the font takes the colour the canvas is filled with,
 * and an emoji does not, so red in the picture is a character the emoji font
 * does not have; a sequence is as wide as one emoji when it is drawn as one.
 */
export function createEmojiSupportCheck(): (emoji: string) => boolean {
	const size = 24;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext("2d", { willReadFrequently: true });
	if (!context) return () => true;

	context.textBaseline = "top";
	context.font = `${size - 6}px ${EMOJI_FONT_FAMILY}`;
	const single = context.measureText("😀").width;

	return (emoji) => {
		if (emoji.includes("\u200D") && context.measureText(emoji).width > single * 1.5)
			return false;

		context.clearRect(0, 0, size, size);
		context.fillStyle = "#f00";
		context.fillText(emoji, 0, 0);
		const { data } = context.getImageData(0, 0, size, size);
		for (let offset = 0; offset < data.length; offset += 4) {
			const [red = 0, green = 0, blue = 0, alpha = 0] = data.subarray(offset, offset + 4);
			if (alpha > 200 && red > 220 && green < 40 && blue < 40) return false;
		}
		return true;
	};
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

/** Where Discord serves the image of an emoji of a server. */
export function serverEmojiUrl(id: string, size = 48): string {
	return `https://cdn.discordapp.com/emojis/${id}.webp?size=${size}`;
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
