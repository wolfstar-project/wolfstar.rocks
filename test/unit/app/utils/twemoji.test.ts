import { describe, expect, it } from "vitest";
import { TWEMOJI_VERSION, twemojiFileName, twemojiUrl } from "~/utils/twemoji";

describe("twemojiFileName", () => {
	it("is the code points of the emoji in lowercase hex", () => {
		expect(twemojiFileName("😀")).toBe("1f600");
		expect(twemojiFileName("👍🏽")).toBe("1f44d-1f3fd");
		expect(twemojiFileName("🇮🇹")).toBe("1f1ee-1f1f9");
	});

	it("leaves out the variation selector of an emoji that is one character", () => {
		expect(twemojiFileName("❤️")).toBe("2764");
		expect(twemojiFileName("1️⃣")).toBe("31-20e3");
	});

	it("keeps the variation selector inside a joined sequence", () => {
		expect(twemojiFileName("🏳️‍🌈")).toBe("1f3f3-fe0f-200d-1f308");
		expect(twemojiFileName("👩‍💻")).toBe("1f469-200d-1f4bb");
	});

	it("uses the name the image has when it differs from the rule", () => {
		expect(twemojiFileName("👁️‍🗨️")).toBe("1f441-200d-1f5e8");
	});
});

describe("twemojiUrl", () => {
	it("points at the versioned image of the emoji", () => {
		expect(twemojiUrl("😀")).toBe(
			`https://cdn.jsdelivr.net/gh/jdecked/twemoji@${TWEMOJI_VERSION}/assets/svg/1f600.svg`,
		);
	});
});
