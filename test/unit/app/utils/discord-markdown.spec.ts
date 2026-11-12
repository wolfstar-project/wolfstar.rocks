import { describe, expect, it } from "vitest";
import {
	discordPlainText,
	parseDiscordInline,
	blankEmptyFormatting,
	keyMentions,
	parseDiscordMarkdown,
	postHeadingOffset,
} from "~/utils/discord-markdown";

describe("parseDiscordInline", () => {
	it("splits bold, code and mentions out of the text", () => {
		expect(
			parseDiscordInline("Added `free nitro` to **Bad Words** in <#general> for <@baddie>."),
		).toEqual([
			{ type: "text", content: "Added " },
			{ type: "code", content: "free nitro" },
			{ type: "text", content: " to " },
			{ type: "bold", children: [{ type: "text", content: "Bad Words" }] },
			{ type: "text", content: " in " },
			{ type: "mention", kind: "channel", name: "general" },
			{ type: "text", content: " for " },
			{ type: "mention", kind: "user", name: "baddie" },
			{ type: "text", content: "." },
		]);
	});

	it("keeps a bare @ or # as text", () => {
		expect(parseDiscordInline("Ping @everyone in #1")).toEqual([
			{ type: "text", content: "Ping @everyone in #1" },
		]);
	});
});

describe("parseDiscordMarkdown", () => {
	it("reads headings, list items and subtext by their prefix", () => {
		const blocks = parseDiscordMarkdown(
			"## Your settings\n- `spam`: Spamming\n-# Up to 1,000 messages\nDone",
		);

		expect(blocks.map((block) => block.type)).toEqual(["heading", "bullet", "subtext", "line"]);
		expect(blocks[1]?.inline).toEqual([
			{ type: "code", content: "spam" },
			{ type: "text", content: ": Spamming" },
		]);
	});
});

describe("parseDiscordInline in announcements", () => {
	it("reads links, written or bare", () => {
		expect(
			parseDiscordInline(
				"Read [the notes](https://wolfstar.rocks/changelog) or https://wolfstar.rocks.",
			),
		).toEqual([
			{ type: "text", content: "Read " },
			{ type: "link", content: "the notes", url: "https://wolfstar.rocks/changelog" },
			{ type: "text", content: " or " },
			{ type: "link", content: "https://wolfstar.rocks", url: "https://wolfstar.rocks" },
			{ type: "text", content: "." },
		]);
	});

	it("leaves a link to anything but the web as text", () => {
		expect(parseDiscordInline("[click](javascript:alert(1))")).toEqual([
			{ type: "text", content: "[click](javascript:alert(1))" },
		]);
	});

	it("reads italic, underline and strike", () => {
		expect(parseDiscordInline("*new* __now__ ~~old~~")).toEqual([
			{ type: "italic", children: [{ type: "text", content: "new" }] },
			{ type: "text", content: " " },
			{ type: "underline", children: [{ type: "text", content: "now" }] },
			{ type: "text", content: " " },
			{ type: "strike", children: [{ type: "text", content: "old" }] },
		]);
	});

	it("keeps a link or a mention inside formatting", () => {
		expect(
			parseDiscordInline("**[Release notes](https://wolfstar.rocks/changelog)** __<@Wolf>__"),
		).toEqual([
			{
				type: "bold",
				children: [
					{
						type: "link",
						content: "Release notes",
						url: "https://wolfstar.rocks/changelog",
					},
				],
			},
			{ type: "text", content: " " },
			{ type: "underline", children: [{ type: "mention", kind: "user", name: "Wolf" }] },
		]);
	});

	it("draws a server emoji from Discord's CDN", () => {
		expect(
			parseDiscordInline("<:wolf:123456789012345678> <a:spin:123456789012345679>"),
		).toEqual([
			{
				type: "emoji",
				name: "wolf",
				url: "https://cdn.discordapp.com/emojis/123456789012345678.webp?size=48",
			},
			{ type: "text", content: " " },
			{
				type: "emoji",
				name: "spin",
				url: "https://cdn.discordapp.com/emojis/123456789012345679.gif?size=48",
			},
		]);
	});

	it("reads a timestamp, in Discord's default style when it names none", () => {
		expect(parseDiscordInline("<t:1700000000:R> <t:1700000000>")).toEqual([
			{ type: "time", at: "2023-11-14T22:13:20.000Z", style: "R" },
			{ type: "text", content: " " },
			{ type: "time", at: "2023-11-14T22:13:20.000Z", style: "f" },
		]);
	});

	it("leaves a timestamp past the range of a date as text", () => {
		expect(parseDiscordInline("<t:9999999999999:R>")).toEqual([
			{ type: "text", content: "<t:9999999999999:R>" },
		]);
		expect(discordPlainText("Out at <t:9999999999999>")).toBe("Out at <t:9999999999999>");
	});
});

describe("parseDiscordMarkdown in announcements", () => {
	it("reads every heading level and quotes", () => {
		expect(
			parseDiscordMarkdown("# Big\n## Middle\n### Small\n> Quoted").map(
				(block) => block.type,
			),
		).toEqual(["title", "heading", "subheading", "quote"]);
	});
});

describe("discordPlainText", () => {
	it("reads the first line without its formatting", () => {
		expect(
			discordPlainText(
				"\n## **v7** for <@Moderator> in <#rules> <:wolf:123456789012345678>\nmore",
			),
		).toBe("v7 for @Moderator in #rules :wolf:");
	});
});

describe("postHeadingOffset", () => {
	// The thread's name is the page's <h2>: a post's top heading is an <h3>,
	// whatever size it is written in, so a post never skips a level.
	it("makes a post's top heading an h3, whatever its size", () => {
		expect(postHeadingOffset("# Big\n## Smaller")).toBe(2);
		expect(postHeadingOffset("## Dashboard v3\nText")).toBe(1);
		expect(postHeadingOffset("### Small")).toBe(0);
	});

	it("reads a heading after the blank lines a post starts with", () => {
		expect(postHeadingOffset("\n  ## Dashboard v3")).toBe(1);
	});

	it("reads the headings in a quote, and keeps newt/ui's default without any", () => {
		expect(postHeadingOffset("> ## Quoted")).toBe(1);
		expect(postHeadingOffset("Just text")).toBe(2);
	});
});

describe("keyMentions", () => {
	// newt/ui reads a mention only without spaces, and takes digits for an ID.
	it("swaps each name for a key the renderer reads, and keeps the names", () => {
		const { content, names } = keyMentions("Thanks <@Jane Doe> and <@12345>, see <#rules>.");

		expect(content).toBe("Thanks <@m0> and <@m1>, see <#m2>.");
		expect([...names]).toStrictEqual([
			["m0", "Jane Doe"],
			["m1", "12345"],
			["m2", "rules"],
		]);
	});

	it("leaves a mention inside code as written, where it is not read", () => {
		const source = "Use `<@Jane Doe>` here:\n```\n<#rules>\n```\nThanks <@Jane Doe>.";
		const { content, names } = keyMentions(source);

		expect(content).toBe("Use `<@Jane Doe>` here:\n```\n<#rules>\n```\nThanks <@m0>.");
		expect([...names]).toStrictEqual([["m0", "Jane Doe"]]);
	});

	it("leaves a timestamp and a server emoji alone", () => {
		expect(keyMentions("<t:1700000000:R> <:wolf:700000000000000001>").content).toBe(
			"<t:1700000000:R> <:wolf:700000000000000001>",
		);
	});
});

describe("blankEmptyFormatting", () => {
	// Discord shows `_ _` as an empty line, which posts use to space their parts.
	it("empties a line of formatting around spaces, and keeps the line", () => {
		expect(blankEmptyFormatting("June Time!\n_ _\n- Update\n** **")).toBe(
			"June Time!\n\u200B\n- Update\n\u200B",
		);
	});

	it("leaves formatting around words alone", () => {
		expect(blankEmptyFormatting("_so_ and **this**\n_ a _")).toBe("_so_ and **this**\n_ a _");
	});

	it("keeps the lines of a code block as written", () => {
		expect(blankEmptyFormatting("```\n_ _\n```\n_ _")).toBe("```\n_ _\n```\n\u200B");
	});

	it("keeps the lines of a code span as written", () => {
		expect(blankEmptyFormatting("`a\n_ _\nb` and ``c\n** **\nd``\n_ _")).toBe(
			"`a\n_ _\nb` and ``c\n** **\nd``\n\u200B",
		);
	});
});
