import type { ReadonlyGuildData } from "#server/database/settings/types";
import type { APIGuildMember } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";

const ROLE = "300000000000000001";

vi.mock("#server/utils/shared", () => ({
	useApi: () => ({
		guilds: { getRoles: vi.fn(async () => [{ id: ROLE, position: 3 }]) },
	}),
}));

import { PermissionNodeManager } from "#server/database/settings/structures/PermissionNodeManager";

describe("PermissionNodeManager", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"fetchCommands",
			vi.fn(async () => []),
		);
	});

	it("never runs a dashboard access entry as a command node", async () => {
		const settings = {
			id: "guild-1",
			permissionsRoles: [{ id: ROLE, allow: [], deny: [], dashboard: "deny" }],
			permissionsUsers: [{ id: "user-1", allow: [], deny: [], dashboard: "allow" }],
		} as unknown as ReadonlyGuildData;
		const manager = new PermissionNodeManager(settings);
		const member = { user: { id: "user-1" }, roles: [ROLE] } as unknown as APIGuildMember;

		await expect(manager.run(member, "settings")).resolves.toBeNull();
		expect(manager.has(ROLE)).toBe(false);
	});
});
