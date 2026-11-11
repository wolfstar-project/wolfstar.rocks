import {
	assertJoinGuardRolesDiffer,
	findUnmanageableJoinGuardRole,
} from "#server/utils/join-guard/settings";
import { describe, expect, it } from "vitest";

const PENDING = "234567890123456789";
const VERIFIED = "234567890123456790";

function refusal(run: () => void) {
	try {
		run();
	} catch (error) {
		return error;
	}
	return null;
}

describe("assertJoinGuardRolesDiffer", () => {
	const current = { joinGuardPendingRole: PENDING, joinGuardVerifiedRole: null };

	it("refuses one role for the pending and the verified roles, with 422", () => {
		expect(
			refusal(() => assertJoinGuardRolesDiffer(current, { joinGuardVerifiedRole: PENDING })),
		).toMatchObject({ status: 422, code: "join-guard-same-roles" });
		expect(
			refusal(() =>
				assertJoinGuardRolesDiffer(
					{ joinGuardPendingRole: null, joinGuardVerifiedRole: null },
					{ joinGuardPendingRole: VERIFIED, joinGuardVerifiedRole: VERIFIED },
				),
			),
		).toMatchObject({ status: 422 });
	});

	it("lets two roles, a role reset, and a change of other keys through", () => {
		expect(
			refusal(() => assertJoinGuardRolesDiffer(current, { joinGuardVerifiedRole: VERIFIED })),
		).toBeNull();
		expect(
			refusal(() =>
				assertJoinGuardRolesDiffer(
					{ joinGuardPendingRole: PENDING, joinGuardVerifiedRole: PENDING },
					{ joinGuardPendingRole: null },
				),
			),
		).toBeNull();
		expect(
			refusal(() =>
				assertJoinGuardRolesDiffer(
					{ joinGuardPendingRole: PENDING, joinGuardVerifiedRole: PENDING },
					{ joinGuardEnabled: true },
				),
			),
		).toBeNull();
	});
});

describe("findUnmanageableJoinGuardRole", () => {
	const GUILD = "100000000000000000";
	const BOT_ROLE = "300000000000000001";
	const roles = [
		{ id: GUILD, position: 0 },
		{ id: "300000000000000002", position: 2 },
		{ id: BOT_ROLE, position: 5, managed: true },
		{ id: "300000000000000003", position: 3, managed: true },
		{ id: "300000000000000004", position: 8 },
	];
	const find = (...ids: string[]) => findUnmanageableJoinGuardRole(GUILD, roles, [BOT_ROLE], ids);

	it("takes a role below the bot's highest that no integration manages", () => {
		expect(find("300000000000000002")).toBeNull();
	});

	it("refuses a role at or above the bot's highest, a managed one, @everyone and an unknown one", () => {
		expect(find("300000000000000004")).toBe("300000000000000004");
		expect(find(BOT_ROLE)).toBe(BOT_ROLE);
		expect(find("300000000000000003")).toBe("300000000000000003");
		expect(find(GUILD)).toBe(GUILD);
		expect(find("999999999999999999")).toBe("999999999999999999");
	});
});
