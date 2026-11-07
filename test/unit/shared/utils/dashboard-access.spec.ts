import {
	classifyLegacyNode,
	createAccessEntry,
	isAccessEntry,
	resolveAccess,
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

describe("createAccessEntry", () => {
	it("keeps the empty lists the bot iterates", () => {
		expect(createAccessEntry("1", "deny")).toEqual({
			id: "1",
			allow: [],
			deny: [],
			dashboard: "deny",
		});
	});
});

describe("isAccessEntry", () => {
	it("tells a dashboard entry from a legacy node", () => {
		expect(isAccessEntry(createAccessEntry("1", "allow"))).toBe(true);
		expect(isAccessEntry({ id: "1", allow: ["settings"], deny: [] })).toBe(false);
	});
});

describe("resolveAccess", () => {
	const subject = { userId: USER, roleIds: [ROLE_HIGH, ROLE_LOW] };

	it("lets the member's own entry win over their roles", () => {
		const access = resolveAccess(
			subject,
			{
				users: [createAccessEntry(USER, "deny")],
				roles: [createAccessEntry(ROLE_HIGH, "allow")],
			},
			guildRoles,
		);
		expect(access).toBe("deny");
	});

	it("takes the highest role with an entry", () => {
		const roles = [createAccessEntry(ROLE_HIGH, "deny"), createAccessEntry(ROLE_LOW, "allow")];
		expect(resolveAccess(subject, { users: [], roles }, guildRoles)).toBe("deny");

		const swapped = [
			{ id: ROLE_HIGH, position: 1 },
			{ id: ROLE_LOW, position: 9 },
		];
		expect(resolveAccess(subject, { users: [], roles }, swapped)).toBe("allow");
	});

	it("ignores an entry for a role the server no longer has", () => {
		const access = resolveAccess(
			{ userId: USER, roleIds: [ROLE_GONE] },
			{ users: [], roles: [createAccessEntry(ROLE_GONE, "allow")] },
			guildRoles,
		);
		expect(access).toBeNull();
	});

	it("ignores legacy nodes", () => {
		const access = resolveAccess(
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
		expect(resolveAccess(subject, { users: [], roles: [] }, guildRoles)).toBeNull();
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
			createAccessEntry("1", "allow"),
			{ id: "2", allow: ["settings"], deny: [] },
			createAccessEntry("3", "deny"),
		];
		expect(stripLegacyNodes(entries).map((entry) => entry.id)).toEqual(["1", "3"]);
	});
});
