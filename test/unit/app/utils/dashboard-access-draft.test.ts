import { createDashboardEntry, type PermissionEntry } from "#shared/utils/dashboard-access";
import { describe, expect, it } from "vitest";
import { importLegacy, joinAccess, splitAccess } from "~/utils/dashboard-access-draft";

const A = "300000000000000001";
const B = "300000000000000002";
const LEGACY = "300000000000000003";

const entries: PermissionEntry[] = [
	createDashboardEntry(A, "allow"),
	createDashboardEntry(B, "deny"),
	{ id: LEGACY, allow: ["settings", "ban"], deny: [] },
];

describe("splitAccess", () => {
	it("reads the allowed and denied ids, leaving legacy nodes out", () => {
		expect(splitAccess(entries)).toEqual({ allow: [A], deny: [B] });
	});
});

describe("joinAccess", () => {
	it("round-trips with splitAccess and keeps the legacy nodes after the rules", () => {
		const { allow, deny } = splitAccess(entries);
		expect(joinAccess(allow, deny, entries)).toEqual(entries);
	});

	it("replaces a legacy node whose id gets a rule", () => {
		const joined = joinAccess([A, LEGACY], [B], entries);
		expect(joined.filter((entry) => entry.id === LEGACY)).toEqual([
			createDashboardEntry(LEGACY, "allow"),
		]);
	});

	it("keeps an id in both lists as a deny", () => {
		expect(joinAccess([A], [A], [])).toEqual([createDashboardEntry(A, "deny")]);
	});
});

describe("importLegacy", () => {
	it("turns an importable node into its dashboard rule, in place", () => {
		expect(importLegacy(entries, LEGACY)[2]).toEqual(createDashboardEntry(LEGACY, "allow"));
	});

	it("leaves a node that is not convertible alone", () => {
		const other: PermissionEntry[] = [{ id: LEGACY, allow: ["Moderation.*"], deny: [] }];
		expect(importLegacy(other, LEGACY)).toEqual(other);
	});
});
