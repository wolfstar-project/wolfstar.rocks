import { describe, expect, it } from "vitest";
import { CONSENT_COOKIE_IDS, readConsentedIds, readDocumentCookie } from "~/utils/consent";

const allIds = Object.values(CONSENT_COOKIE_IDS);

describe("readConsentedIds", () => {
	it("is empty before any choice", () => {
		expect(
			readConsentedIds({ consentGiven: undefined, enabledIds: undefined, allIds }),
		).toEqual([]);
	});

	it("returns the ids the visitor turned on", () => {
		expect(
			readConsentedIds({ consentGiven: allIds.join(""), enabledIds: "s~v~c~r", allIds }),
		).toEqual(["s", "v", "c", "r"]);
	});

	it("ignores a choice made before the cookie groups changed", () => {
		expect(readConsentedIds({ consentGiven: "svc", enabledIds: "s~v~c", allIds })).toEqual([]);
	});

	it("ignores a declined choice", () => {
		expect(readConsentedIds({ consentGiven: "0", enabledIds: undefined, allIds })).toEqual([]);
	});
});

describe("readDocumentCookie", () => {
	const cookies = "a=1; ncc_c=svcr; ncc_e=s~v~c~r; quoted=%22svcr%22";

	it("reads a plain value", () => {
		expect(readDocumentCookie("ncc_c", cookies)).toBe("svcr");
		expect(readDocumentCookie("ncc_e", cookies)).toBe("s~v~c~r");
	});

	it("unwraps a JSON-quoted string", () => {
		expect(readDocumentCookie("quoted", cookies)).toBe("svcr");
	});

	it("is undefined for a value that does not decode", () => {
		expect(readDocumentCookie("ncc_c", "ncc_c=%E0%A4%A")).toBeUndefined();
	});

	it("is undefined for a cookie that is not set", () => {
		expect(readDocumentCookie("missing", cookies)).toBeUndefined();
	});
});
