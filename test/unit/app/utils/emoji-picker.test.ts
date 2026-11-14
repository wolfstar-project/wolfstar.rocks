import { describe, expect, it } from "vitest";
import {
	emojiShortcode,
	groupEmojis,
	matchesEmojiQuery,
	parseServerEmojiToken,
	rememberEmoji,
	RECENT_EMOJI_LIMIT,
	searchEmojis,
	serverEmojiToken,
	serverEmojiUrl,
	undrawnHexcodes,
	usableServerEmojis,
	withSkinTone,
	type RawEmoji,
} from "~/utils/emoji-picker";

const tones = ["👍🏻", "👍🏼", "👍🏽", "👍🏾", "👍🏿"].map((unicode, index) => ({
	hexcode: `1F44D-1F3F${"BCDEF"[index]}`,
	unicode,
}));

const raw: RawEmoji[] = [
	{ group: 0, hexcode: "1F600", label: "grinning face", unicode: "😀", tags: ["grin", "happy"] },
	{
		group: 1,
		hexcode: "1F44D",
		label: "thumbs up",
		unicode: "👍",
		tags: ["+1", "yes"],
		skins: tones,
	},
	{
		group: 1,
		hexcode: "1F9D1-200D-1F91D-200D-1F9D1",
		label: "people holding hands",
		unicode: "🧑‍🤝‍🧑",
		skins: [...tones, ...tones],
	},
	{ group: 2, hexcode: "1F3FB", label: "light skin tone", unicode: "🏻" },
	{ group: 9, hexcode: "1F1EE-1F1F9", label: "flag: Italy", unicode: "🇮🇹" },
	{ hexcode: "1F1E6", label: "regional indicator A", unicode: "🇦" },
	{ group: 8, hexcode: "2705", label: "check mark button", unicode: "✅" },
];

describe("groupEmojis", () => {
	const sections = groupEmojis(raw);

	it("sorts the emoji into the picker's sections, in order", () => {
		expect(sections.smileys.map((entry) => entry.emoji)).toStrictEqual(["😀"]);
		expect(sections.people.map((entry) => entry.emoji)).toStrictEqual(["👍", "🧑‍🤝‍🧑"]);
		expect(sections.symbols.map((entry) => entry.emoji)).toStrictEqual(["✅"]);
	});

	it("leaves out the flags, the skin tone swatches and what has no group", () => {
		const all = Object.values(sections)
			.flat()
			.map((entry) => entry.emoji);

		expect(all).not.toContain("🇮🇹");
		expect(all).not.toContain("🏻");
		expect(all).not.toContain("🇦");
	});

	it("keeps the five tones of an emoji, and none for one that has twenty-five", () => {
		expect(sections.people[0]?.skins).toStrictEqual(["👍🏻", "👍🏼", "👍🏽", "👍🏾", "👍🏿"]);
		expect(sections.people[1]?.skins).toStrictEqual([]);
	});
});

describe("the emoji Twemoji cannot draw", () => {
	it("are the codes of the Emoji versions newer than its release", () => {
		const undrawn = undrawnHexcodes({
			"0.6": ["1F600"],
			"13.1": ["2764-FE0F-200D-1F525"],
			"17": ["1FAE9"],
			"18": ["1FAE8", "1F44D"],
		});

		expect([...undrawn].toSorted()).toStrictEqual(["1F44D", "1FAE8"]);
	});

	it("are left out of the sections", () => {
		const sections = groupEmojis(raw, new Set(["1F600"]));

		expect(sections.smileys).toStrictEqual([]);
		expect(sections.people.map((entry) => entry.emoji)).toContain("👍");
	});

	it("take the tones of an emoji with them when one of the tones is missing", () => {
		const sections = groupEmojis(raw, new Set(["1F44D-1F3FD"]));

		expect(sections.people[0]?.emoji).toBe("👍");
		expect(sections.people[0]?.skins).toStrictEqual([]);
	});
});

describe("withSkinTone", () => {
	const [thumbs, holding] = groupEmojis(raw).people;

	it("gives the emoji in the tone, and as it is for the default one", () => {
		expect(withSkinTone(thumbs!, 0)).toBe("👍");
		expect(withSkinTone(thumbs!, 3)).toBe("👍🏽");
		expect(withSkinTone(thumbs!, 5)).toBe("👍🏿");
	});

	it("keeps an emoji that has no tone", () => {
		expect(withSkinTone(holding!, 4)).toBe("🧑‍🤝‍🧑");
	});
});

describe("matchesEmojiQuery", () => {
	it("finds an emoji by its name or its tags, whatever the case", () => {
		expect(matchesEmojiQuery("grinning face", ["grin"], "GRIN")).toBe(true);
		expect(matchesEmojiQuery("thumbs up", ["+1"], "+1")).toBe(true);
		expect(matchesEmojiQuery("thumbs up", ["+1"], "smile")).toBe(false);
	});

	it("wants every word, however they are separated", () => {
		expect(matchesEmojiQuery("thumbs up", [], "thumbs up")).toBe(true);
		expect(matchesEmojiQuery("thumbs up", [], "thumbs_up")).toBe(true);
		expect(matchesEmojiQuery("thumbs up", [], ":thumbs:")).toBe(true);
		expect(matchesEmojiQuery("thumbs up", [], "thumbs down")).toBe(false);
	});

	it("matches everything for an empty query", () => {
		expect(matchesEmojiQuery("grinning face", [], "  ")).toBe(true);
	});

	it("filters the emoji of a section", () => {
		const entries = groupEmojis(raw).people;

		expect(searchEmojis(entries, "yes").map((entry) => entry.emoji)).toStrictEqual(["👍"]);
	});
});

describe("the emoji of a server", () => {
	it("is stored as Discord writes it, with an a when it moves", () => {
		expect(serverEmojiToken({ id: "123456789012345678", name: "wolf", animated: false })).toBe(
			"<:wolf:123456789012345678>",
		);
		expect(serverEmojiToken({ id: "123456789012345678", name: "wolf", animated: true })).toBe(
			"<a:wolf:123456789012345678>",
		);
	});

	it("is an image Discord serves by its ID", () => {
		expect(serverEmojiUrl("123456789012345678")).toBe(
			"https://cdn.discordapp.com/emojis/123456789012345678.webp?size=48",
		);
	});

	it("is served moving only when it is asked to", () => {
		expect(serverEmojiUrl("123456789012345678", 64, true)).toBe(
			"https://cdn.discordapp.com/emojis/123456789012345678.webp?size=64&animated=true",
		);
	});

	it("is read back from what a form stores", () => {
		expect(parseServerEmojiToken("<:wolf:123456789012345678>")).toStrictEqual({
			id: "123456789012345678",
			name: "wolf",
			animated: false,
		});
		expect(parseServerEmojiToken("<a:dance:123456789012345678>")?.animated).toBe(true);
		expect(parseServerEmojiToken("😀")).toBeNull();
		expect(parseServerEmojiToken(null)).toBeNull();
	});

	it("is offered when members can use it and a form can hold its name", () => {
		expect(
			usableServerEmojis([
				{ id: "1", name: "wolf", animated: false, available: true },
				{ id: "2", name: "gone", animated: false, available: false },
				{ id: "3", name: null, animated: false, available: true },
				{ id: "4", name: "a", animated: false, available: true },
				{ id: "5", name: "bad name", animated: false, available: true },
			]),
		).toStrictEqual([{ id: "1", name: "wolf", animated: false }]);
	});
});

describe("emojiShortcode", () => {
	it("writes the name of an emoji between colons", () => {
		expect(emojiShortcode("grinning face")).toBe(":grinning_face:");
		expect(emojiShortcode("flag: Italy")).toBe(":flag_italy:");
		expect(emojiShortcode("A button (blood type)")).toBe(":a_button_blood_type:");
	});
});

describe("rememberEmoji", () => {
	it("puts the emoji first and keeps it once", () => {
		expect(rememberEmoji(["😀", "👍"], "👍")).toStrictEqual(["👍", "😀"]);
		expect(rememberEmoji(["😀"], "🔥")).toStrictEqual(["🔥", "😀"]);
	});

	it("forgets the oldest when the list is full", () => {
		const full = Array.from({ length: RECENT_EMOJI_LIMIT }, (_, index) => `e${index}`);
		const next = rememberEmoji(full, "new");

		expect(next).toHaveLength(RECENT_EMOJI_LIMIT);
		expect(next[0]).toBe("new");
		expect(next).not.toContain(`e${RECENT_EMOJI_LIMIT - 1}`);
	});
});
