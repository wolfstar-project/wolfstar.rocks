import type { GuildData, ReadonlyGuildData } from "#server/database/settings/types";
import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import { assertCanEditDashboardAccess } from "#server/utils/dashboard-access";
import { createDashboardEntry } from "#shared/utils/dashboard-access";
import { describe, expect, it } from "vitest";

const OWNER = "100000000000000001";
const ADMIN = "100000000000000002";
const HELPER = "100000000000000003";
const ADMIN_ROLE = "300000000000000001";

const guild = {
	id: "900000000000000001",
	owner_id: OWNER,
	roles: [{ id: ADMIN_ROLE, name: "Admins", permissions: "32", position: 4 }],
} as unknown as APIGuild;

function member(id: string, roles: string[], permissions: string): APIGuildMember {
	return { user: { id }, roles, permissions } as unknown as APIGuildMember;
}

const owner = member(OWNER, [], "0");
// Manage Server = 32n
const admin = member(ADMIN, [ADMIN_ROLE], "32");
const helper = member(HELPER, [], "0");

function settings(partial: Partial<GuildData> = {}): ReadonlyGuildData {
	return {
		rolesAdmin: [],
		permissionsUsers: [],
		permissionsRoles: [],
		...partial,
	} as unknown as ReadonlyGuildData;
}

function attempt(
	who: APIGuildMember,
	current: ReadonlyGuildData,
	changes: Partial<GuildData>,
): unknown {
	try {
		assertCanEditDashboardAccess(guild, who, current, changes);
		return null;
	} catch (error) {
		return error;
	}
}

describe("assertCanEditDashboardAccess", () => {
	it("lets the owner write any rule, a deny on themselves included", () => {
		const changes = { permissionsUsers: [createDashboardEntry(OWNER, "deny")] };
		expect(attempt(owner, settings(), changes)).toBeNull();
	});

	it("lets a member who manages the server write rules", () => {
		const changes = { permissionsUsers: [createDashboardEntry(HELPER, "allow")] };
		expect(attempt(admin, settings(), changes)).toBeNull();
	});

	it("refuses a member let in by a rule alone", () => {
		const current = settings({ permissionsUsers: [createDashboardEntry(HELPER, "allow")] });
		const changes = {
			permissionsUsers: [
				createDashboardEntry(HELPER, "allow"),
				createDashboardEntry("100000000000000009", "allow"),
			],
		};
		const error = attempt(helper, current, changes) as { status?: number; why?: string };
		expect(error?.status).toBe(403);
		expect(error?.why).toMatch(/only the owner or a member who can manage the server/i);
	});

	it("refuses a rule that would keep out the member who writes it", () => {
		const changes = { permissionsUsers: [createDashboardEntry(ADMIN, "deny")] };
		const error = attempt(admin, settings(), changes) as { status?: number; why?: string };
		expect(error?.status).toBe(409);
		expect(error?.why).toMatch(/lock you out/i);
	});

	it("refuses a deny on the writer's highest role when nothing of theirs allows", () => {
		const changes = { permissionsRoles: [createDashboardEntry(ADMIN_ROLE, "deny")] };
		const error = attempt(admin, settings(), changes) as { status?: number };
		expect(error?.status).toBe(409);
	});

	it("does nothing when the change holds no access rules", () => {
		expect(attempt(helper, settings(), { rolesAdmin: [ADMIN_ROLE] })).toBeNull();
	});
});
