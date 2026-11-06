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

	it("answers a coverage request with the words another one already takes", () => {
		expect(
			answerAutomodWordRequest({ id: 2, kind: "covered", words: ["bad", "*bad*"] }),
		).toStrictEqual({ id: 2, covered: [["bad", "*bad*"]] });
	});
});
