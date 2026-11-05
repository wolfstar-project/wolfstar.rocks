import { assertJoinGuardRolesDiffer } from "#server/utils/join-guard/settings";
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
