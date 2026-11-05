import { measureJoinGuardTrust, type JoinGuardTrustInput } from "#server/utils/join-guard/trust";
import { describe, expect, it } from "vitest";

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 10, 5);
const STAFF = 1 << 0;
const SPAMMER = 1 << 20;

/** An account that meets every level: old enough, off the list, linked, with a badge and an avatar. */
function input(overrides: Partial<JoinGuardTrustInput> = {}): JoinGuardTrustInput {
	return {
		accountCreatedAt: NOW - 30 * DAY,
		now: NOW,
		ruleAccountAgeMax: 7 * 86_400,
		checks: { connections: true, sharedBans: true },
		sharedBan: false,
		linkedAccounts: 2,
		publicFlags: STAFF,
		hasAvatar: true,
		minimumTrust: 3,
		...overrides,
	};
}

describe("measureJoinGuardTrust", () => {
	it("gives 3 to an account that meets every level, with nothing missing", () => {
		expect(measureJoinGuardTrust(input())).toStrictEqual({
			level: 3,
			linkedAccounts: 2,
			missing: [],
		});
	});

	it("gives 0 to an account younger than the age of the rule", () => {
		const trust = measureJoinGuardTrust(input({ accountCreatedAt: NOW - 2 * DAY }));
		expect(trust.level).toBe(0);
		expect(trust.missing).toStrictEqual(["accountAge"]);
	});

	it("gives 0 to an account on the shared ban list, when the guild checks it", () => {
		expect(measureJoinGuardTrust(input({ sharedBan: true })).missing).toStrictEqual([
			"sharedBan",
		]);
		expect(
			measureJoinGuardTrust(
				input({ sharedBan: true, checks: { connections: true, sharedBans: false } }),
			).level,
		).toBe(3);
	});

	it("counts the age as enough when the rule is gone or had no age condition", () => {
		expect(
			measureJoinGuardTrust(input({ accountCreatedAt: NOW - DAY, ruleAccountAgeMax: null }))
				.level,
		).toBe(3);
	});

	it("gives 1 to an account with no linked account, when the guild reads them", () => {
		const trust = measureJoinGuardTrust(input({ linkedAccounts: 0 }));
		expect(trust.level).toBe(1);
		expect(trust.missing).toStrictEqual(["linkedAccount"]);
	});

	it("asks nothing more for level 2 than level 1 when the guild does not read linked accounts", () => {
		const trust = measureJoinGuardTrust(
			input({
				linkedAccounts: 0,
				checks: { connections: false, sharedBans: true },
				minimumTrust: 2,
			}),
		);
		expect(trust).toStrictEqual({ level: 3, linkedAccounts: 0, missing: [] });
	});

	it("gives 2 to an account with no badge or with the default avatar", () => {
		expect(measureJoinGuardTrust(input({ publicFlags: 0 }))).toMatchObject({
			level: 2,
			missing: ["badges"],
		});
		expect(measureJoinGuardTrust(input({ hasAvatar: false }))).toMatchObject({
			level: 2,
			missing: ["avatar"],
		});
		expect(
			measureJoinGuardTrust(input({ publicFlags: 0, hasAvatar: false })).missing,
		).toStrictEqual(["badges", "avatar"]);
	});

	it("does not count the spammer flag as a badge", () => {
		expect(measureJoinGuardTrust(input({ publicFlags: SPAMMER })).missing).toStrictEqual([
			"badges",
		]);
	});

	it("names only what keeps the account below the guild's minimum", () => {
		const account = input({ linkedAccounts: 0, publicFlags: 0, hasAvatar: false });
		expect(measureJoinGuardTrust({ ...account, minimumTrust: 1 })).toStrictEqual({
			level: 1,
			linkedAccounts: 0,
			missing: [],
		});
		expect(measureJoinGuardTrust({ ...account, minimumTrust: 2 }).missing).toStrictEqual([
			"linkedAccount",
		]);
		expect(measureJoinGuardTrust({ ...account, minimumTrust: 3 }).missing).toStrictEqual([
			"linkedAccount",
			"badges",
			"avatar",
		]);
	});

	it("names the gaps of every level up to the minimum, a lower one included", () => {
		const trust = measureJoinGuardTrust(
			input({ accountCreatedAt: NOW - DAY, linkedAccounts: 0, hasAvatar: false }),
		);
		expect(trust.level).toBe(0);
		expect(trust.missing).toStrictEqual(["accountAge", "linkedAccount", "avatar"]);
	});
});
