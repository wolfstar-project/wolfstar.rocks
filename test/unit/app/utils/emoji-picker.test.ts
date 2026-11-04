import { describe, expect, it } from "vitest";
import {
	emojiShortcode,
	groupEmojis,
	matchesEmojiQuery,
	searchEmojis,
	serverEmojiToken,
	serverEmojiUrl,
	usableServerEmojis,
	withSkinTone,
	type RawEmoji,
} from "~/utils/emoji-picker";

const tones = ["👍🏻", "👍🏼", "👍🏽", "👍🏾", "👍🏿"].map((unicode) => ({ unicode }));

const raw: RawEmoji[] = [
	{ group: 0, label: "grinning face", unicode: "😀", tags: ["grin", "happy"] },
	{ group: 1, label: "thumbs up", unicode: "👍", tags: ["+1", "yes"], skins: tones },
	{ group: 1, label: "people holding hands", unicode: "🧑‍🤝‍🧑", skins: [...tones, ...tones] },
	{ group: 2, label: "light skin tone", unicode: "🏻" },
	{ group: 9, label: "flag: Italy", unicode: "🇮🇹" },
	{ label: "regional indicator A", unicode: "🇦" },
	{ group: 8, label: "check mark button", unicode: "✅" },
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
