import type { ConfigurationNotice } from "#shared/utils/settings-transfer";
import { getNoticesDigest } from "#shared/utils/settings-transfer";
import { describe, expect, it } from "vitest";

const notice = (rule: string): ConfigurationNotice => ({
	kind: "ruleFailed",
	path: `settings.selfmod.${rule.toLowerCase()}`,
	rule,
	reason: "The server already has 25 rules.",
});

describe("getNoticesDigest", () => {
	it("is the same for the same notices, in any order", () => {
		expect(getNoticesDigest([notice("Links"), notice("Invites")])).toBe(
			getNoticesDigest([notice("Invites"), notice("Links")]),
		);
	});

	it("differs when a notice is added or changed", () => {
		const one = getNoticesDigest([notice("Links")]);
		expect(getNoticesDigest([notice("Links"), notice("Invites")])).not.toBe(one);
		expect(getNoticesDigest([notice("Invites")])).not.toBe(one);
		expect(getNoticesDigest([])).not.toBe(one);
	});

	it("stays short however many notices there are", () => {
		const many = Array.from({ length: 5000 }, (_, index) => notice(`Rule ${index}`));
		expect(getNoticesDigest(many).length).toBeLessThanOrEqual(16);
	});
});
