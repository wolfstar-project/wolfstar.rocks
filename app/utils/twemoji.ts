/**
 * Twemoji, the emoji Discord draws: the same picture on every system, in place
 * of what each system's font makes of the character.
 */

/** The release of `jdecked/twemoji`, the maintained fork, that the images come from. */
export const TWEMOJI_VERSION = "17.0.3";

/** The newest Emoji version that release draws; later emoji have no image. */
export const TWEMOJI_EMOJI_VERSION = 17;

const ZERO_WIDTH_JOINER = 0x200D;
const VARIATION_SELECTOR = 0xFE0F;

/**
 * The name of an emoji's file: its code points in lowercase hex, joined by `-`.
 * The variation selector is left out unless the emoji is a joined sequence,
 * where the files keep it (`1f3f3-fe0f-200d-1f308` is the rainbow flag).
 */
export function twemojiFileName(emoji: string): string {
	const points = Array.from(emoji, (char) => char.codePointAt(0) ?? 0);
	const joined = points.includes(ZERO_WIDTH_JOINER);
	return points
		.filter((point) => joined || point !== VARIATION_SELECTOR)
		.map((point) => point.toString(16))
		.join("-");
}

/** Where the image of an emoji is served from: a versioned, immutable path of jsDelivr. */
export function twemojiUrl(emoji: string): string {
	return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@${TWEMOJI_VERSION}/assets/svg/${twemojiFileName(emoji)}.svg`;
}
