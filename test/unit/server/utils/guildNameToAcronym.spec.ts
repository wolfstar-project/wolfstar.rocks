import { describe, it, expect } from "vitest";
import { guildNameToAcronym } from "../../../../server/utils/guildNameToAcronym";

describe("guildNameToAcronym", () => {
	const cases: [string, string][] = [
		["WolfStar Community", "WC"],
		["Joe's Bar", "JB"],
		["7th Heaven", "7H"],
		["🎉 Party Squad", "PS"],
		["123", "123"],
		["a b c d e", "ABC"], // Truncated to MAX_LEN (3)
		["", ""],
		["   ", ""],
		["!!!", "!!!"], // Symbol-only -> last-resort grapheme fallback (trim to 3)
		["O’Connor's Pub", "OP"], // Curly apostrophe + trailing 's handling
		["—💥", "—💥".slice(0, 3).toUpperCase()], // No alphanum -> grapheme fallback
	];

	for (const [input, expected] of cases) {
		it(`returns "${expected}" for "${input}"`, () => {
			expect(guildNameToAcronym(input)).toBe(expected);
		});
	}

	it("handles dotted-I (İstanbul Büyükşehir) in a Unicode-safe way", () => {
		const result = guildNameToAcronym("İstanbul Büyükşehir");
		// Some environments/implementations normalize dotted 'İ' to plain 'I' — accept either
		expect(["İB", "IB"]).toContain(result);
	});

	it("always returns uppercase and max length 3", () => {
		const result = guildNameToAcronym("lowercase example guild name");
		expect(result).toBe(result.toUpperCase());
		expect(result.length).toBeLessThanOrEqual(3);
	});

	it("falls back to first alphanumerics when words contain only symbols", () => {
		expect(guildNameToAcronym("*** A! B?")).toBe("AB");
	});
});
