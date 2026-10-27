import { describe, expect, it } from "vitest";
import { parseDiscordInline, parseDiscordMarkdown } from "~/utils/discord-markdown";

describe("parseDiscordInline", () => {
	it("splits bold, code and mentions out of the text", () => {
		expect(
			parseDiscordInline("Added `free nitro` to **Bad Words** in <#general> for <@baddie>."),
		).toEqual([
			{ type: "text", content: "Added " },
			{ type: "code", content: "free nitro" },
			{ type: "text", content: " to " },
			{ type: "bold", content: "Bad Words" },
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
