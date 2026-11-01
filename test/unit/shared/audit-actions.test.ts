import { DASHBOARD_AUDIT_ACTIONS } from "#shared/audit/actions";
import { describe, expect, it } from "vitest";

describe("DASHBOARD_AUDIT_ACTIONS", () => {
	it("lists the access and command permissions actions in the activity feed", () => {
		expect(DASHBOARD_AUDIT_ACTIONS).toEqual(
			expect.arrayContaining([
				"guild.access.legacy-removed",
				"guild.command-permissions.update",
				"guild.command-permissions.access-denied",
			]),
		);
	});
});
