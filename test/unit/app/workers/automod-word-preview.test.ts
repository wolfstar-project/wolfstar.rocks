import { describe, expect, it, vi } from "vitest";

// The worker registers its listener on the global scope when it loads.
vi.stubGlobal("addEventListener", vi.fn());
vi.stubGlobal("postMessage", vi.fn());

const { answerAutomodWordRequest } = await import("../../../../app/workers/automod-word-preview");

describe("the word preview worker", () => {
	it("answers a match request with the parts of the text the words take", () => {
		expect(
			answerAutomodWordRequest({ id: 1, kind: "matches", words: ["bad"], text: "so b.a.d!" }),
		).toStrictEqual({ id: 1, matches: [{ start: 3, end: 8 }] });
	});

	// The bot replaces look-alike characters before it matches: the preview
	// must catch what the bot catches, at the offsets of the text as written.
	it("catches a word written with look-alike characters, as the bot does", () => {
		const text = "so b\u{FF41}d!";
		expect(
			answerAutomodWordRequest({ id: 3, kind: "matches", words: ["bad"], text }),
		).toStrictEqual({ id: 3, matches: [{ start: 3, end: 6 }] });
	});

	it("answers an examples request with the messages a word takes and lets through", () => {
		const answer = answerAutomodWordRequest({ id: 4, kind: "examples", word: "bad" });

		expect(answer).toMatchObject({ id: 4 });
		const examples = "examples" in answer ? (answer.examples ?? []) : [];
		expect(examples.map(({ kind }) => kind)).toContain("plain");
	});

	it("answers a coverage request with the words another one already takes", () => {
		expect(
			answerAutomodWordRequest({ id: 2, kind: "covered", words: ["bad", "*bad*"] }),
		).toStrictEqual({ id: 2, covered: [["bad", "*bad*"]] });
	});
});
