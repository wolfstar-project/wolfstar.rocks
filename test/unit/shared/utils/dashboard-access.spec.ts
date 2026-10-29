import {
	classifyLegacyNode,
	createDashboardEntry,
	isDashboardEntry,
	resolveDashboardAccess,
	stripLegacyNodes,
	type PermissionEntry,
} from "#shared/utils/dashboard-access";
import { describe, expect, it } from "vitest";

const USER = "200000000000000001";
const ROLE_HIGH = "300000000000000001";
const ROLE_LOW = "300000000000000002";
const ROLE_GONE = "300000000000000099";

const guildRoles = [
	{ id: ROLE_HIGH, position: 5 },
	{ id: ROLE_LOW, position: 2 },
];

describe("createDashboardEntry", () => {
	it("keeps the empty lists the bot iterates", () => {
		expect(createDashboardEntry("1", "deny")).toEqual({
			id: "1",
			allow: [],
			deny: [],
			dashboard: "deny",
		});
	});
});

describe("isDashboardEntry", () => {
	it("tells a dashboard entry from a legacy node", () => {
		expect(isDashboardEntry(createDashboardEntry("1", "allow"))).toBe(true);
		expect(isDashboardEntry({ id: "1", allow: ["settings"], deny: [] })).toBe(false);
	});
});

describe("resolveDashboardAccess", () => {
	const subject = { userId: USER, roleIds: [ROLE_HIGH, ROLE_LOW] };

	it("lets the member's own entry win over their roles", () => {
		const access = resolveDashboardAccess(
			subject,
			{
				users: [createDashboardEntry(USER, "deny")],
				roles: [createDashboardEntry(ROLE_HIGH, "allow")],
			},
			guildRoles,
		);
		expect(access).toBe("deny");
	});

	it("takes the highest role with an entry", () => {
		const roles = [
			createDashboardEntry(ROLE_HIGH, "deny"),
			createDashboardEntry(ROLE_LOW, "allow"),
		];
		expect(resolveDashboardAccess(subject, { users: [], roles }, guildRoles)).toBe("deny");

		const swapped = [
			{ id: ROLE_HIGH, position: 1 },
			{ id: ROLE_LOW, position: 9 },
		];
		expect(resolveDashboardAccess(subject, { users: [], roles }, swapped)).toBe("allow");
	});

	it("ignores an entry for a role the server no longer has", () => {
		const access = resolveDashboardAccess(
			{ userId: USER, roleIds: [ROLE_GONE] },
			{ users: [], roles: [createDashboardEntry(ROLE_GONE, "allow")] },
			guildRoles,
		);
		expect(access).toBeNull();
	});

	it("ignores legacy nodes", () => {
		const access = resolveDashboardAccess(
			subject,
			{
				users: [{ id: USER, allow: ["*"], deny: [] }],
				roles: [{ id: ROLE_HIGH, allow: [], deny: ["settings"] }],
			},
			guildRoles,
		);
		expect(access).toBeNull();
	});

	it("returns null without entries", () => {
		expect(resolveDashboardAccess(subject, { users: [], roles: [] }, guildRoles)).toBeNull();
	});
});

describe("classifyLegacyNode", () => {
	it("imports a node on settings and drops the other commands", () => {
		expect(classifyLegacyNode({ id: "1", allow: ["settings", "ban"], deny: [] })).toEqual({
			kind: "importable",
			access: "allow",
			dropped: ["ban"],
		});
	});

	it("reads a deny on the Management category as a deny", () => {
		expect(classifyLegacyNode({ id: "1", allow: [], deny: ["Management.*"] })).toEqual({
			kind: "importable",
			access: "deny",
			dropped: [],
		});
	});

	it("lets allow win when both lists match", () => {
		expect(classifyLegacyNode({ id: "1", allow: ["*"], deny: ["settings"] })).toMatchObject({
			kind: "importable",
			access: "allow",
		});
	});

	it("imports the old command name and the wildcard", () => {
		expect(classifyLegacyNode({ id: "1", allow: ["conf"], deny: [] }).kind).toBe("importable");
		expect(classifyLegacyNode({ id: "1", allow: ["*"], deny: [] }).kind).toBe("importable");
	});

	it("refuses a node that never names the dashboard", () => {
		expect(classifyLegacyNode({ id: "1", allow: ["Moderation.*"], deny: [] })).toEqual({
			kind: "not-convertible",
		});
	});
});

describe("stripLegacyNodes", () => {
	it("keeps only the dashboard entries, in order", () => {
		const entries: PermissionEntry[] = [
			createDashboardEntry("1", "allow"),
			{ id: "2", allow: ["settings"], deny: [] },
			createDashboardEntry("3", "deny"),
		];
		expect(stripLegacyNodes(entries).map((entry) => entry.id)).toEqual(["1", "3"]);
	});
});
