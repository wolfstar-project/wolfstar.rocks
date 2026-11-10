import { describe, expect, it } from "vitest";
import { CONSENT_COOKIE_IDS, readConsentedIds } from "~/utils/consent";

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
