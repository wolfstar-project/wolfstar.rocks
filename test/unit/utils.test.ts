import { guildNameToAcronym } from "../../server/utils/shared";

describe("guildNameToAcronym", () => {
  const cases: Array<[string, string]> = [
    ["WolfStar Community", "WC"],
    ["Joe's Bar", "JB"],
    ["7th Heaven", "7H"],
    ["🎉 Party Squad", "PS"],
    ["123", "123"],
    ["a b c d e", "ABC"], // truncated to MAX_LEN (3)
    ["", ""],
    ["   ", ""],
    ["!!!", "!!!"], // symbol-only -> last-resort grapheme fallback (trim to 3)
    ["O’Connor's Pub", "OP"], // curly apostrophe + trailing 's handling
    ["—💥", "—💥".slice(0, 3).toUpperCase()], // no alphanum -> grapheme fallback
    ["İstanbul Büyükşehir", "İB"], // Unicode dotted I and multi-word
  ];

  for (const [input, expected] of cases) {
    it(`returns "${expected}" for "${input}"`, () => {
      expect(guildNameToAcronym(input)).toBe(expected);
    });
  }

  it("always returns uppercase and max length 3", () => {
    const result = guildNameToAcronym("lowercase example guild name");
    expect(result).toBe(result.toUpperCase());
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("falls back to first alphanumerics when words contain only symbols", () => {
    expect(guildNameToAcronym("*** A! B?")).toBe("AB");
  });
});
