import { describe, expect, it } from "vitest";
import { hexToHsv, hsvToHex, normalizeHex } from "~/utils/color-convert";

describe("normalizeHex", () => {
	it("writes a colour as #RRGGBB in capitals", () => {
		expect(normalizeHex("#3208cb")).toBe("#3208CB");
		expect(normalizeHex("3208cb")).toBe("#3208CB");
		expect(normalizeHex(" #fa0 ")).toBe("#FFAA00");
	});

	it("refuses what is not a colour", () => {
		for (const input of ["", "#12", "#12345", "#1234567", "#ggg", "blue"]) {
			expect(normalizeHex(input)).toBeNull();
		}
	});
});

describe("hexToHsv / hsvToHex", () => {
	it("reads the primaries", () => {
		expect(hexToHsv("#FF0000")).toStrictEqual({ h: 0, s: 100, v: 100 });
		expect(hexToHsv("#00FF00")).toStrictEqual({ h: 120, s: 100, v: 100 });
		expect(hexToHsv("#0000FF")).toStrictEqual({ h: 240, s: 100, v: 100 });
		expect(hexToHsv("#FFFFFF")).toStrictEqual({ h: 0, s: 0, v: 100 });
		expect(hexToHsv("#000000")).toStrictEqual({ h: 0, s: 0, v: 0 });
	});

	it("writes them back", () => {
		expect(hsvToHex({ h: 0, s: 100, v: 100 })).toBe("#FF0000");
		expect(hsvToHex({ h: 120, s: 100, v: 100 })).toBe("#00FF00");
		expect(hsvToHex({ h: 240, s: 100, v: 100 })).toBe("#0000FF");
		expect(hsvToHex({ h: 0, s: 0, v: 50 })).toBe("#808080");
	});

	it("keeps any colour through a round trip", () => {
		for (const hex of [
			"#3208CB",
			"#1572B8",
			"#7B6BCC",
			"#56B69F",
			"#9ECA67",
			"#EE8558",
			"#123456",
		]) {
			expect(hsvToHex(hexToHsv(hex))).toBe(hex);
		}
	});

	it("keeps the values inside their range", () => {
		expect(hsvToHex({ h: 400, s: 140, v: -20 })).toBe("#000000");
		expect(hsvToHex({ h: -60, s: 100, v: 100 })).toBe("#FF00FF");
	});
});
