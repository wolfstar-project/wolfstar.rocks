import type {
	EligibleAppeal,
	EligibleCase,
	EligibleForm,
} from "#server/utils/my-appeals/eligibility";
import type { MyAppealCaseType } from "#shared/utils/my-appeals";
import {
	cooldownEnd,
	decideCaseOpening,
	findAppealableCases,
	findCasesInCourse,
	getAppealFormAccess,
	isAppealableType,
} from "#server/utils/my-appeals/eligibility";
import { AppealCaseTypes } from "#shared/utils/appeal-forms";
import { describe, expect, it } from "vitest";

// Ported from the bot's `tests/lib/moderation/appealForms.test.ts` and
// `appeals.test.ts`, so the list says what the bot answers when the appeal is sent.

const day = 86_400_000;
const now = Date.UTC(2026, 10, 1);

const typeSettings = {
	appealsEnabled: true,
	appealsBans: true,
	appealsMutes: false,
	appealsTimeouts: true,
};
const limits = { appealsCooldownDays: 7, appealsMaxActive: 1 };
const settings = { ...typeSettings, appealsMutes: true, ...limits };

function form(overrides: Partial<EligibleForm> = {}): EligibleForm {
	return { enabled: true, types: [], requiredRoles: [], restrictedRoles: [], ...overrides };
}

function caseOf(
	id: number,
	type: MyAppealCaseType,
	state: "open" | "undo" | "completed" | "archived" = "open",
): EligibleCase {
	return {
		id,
		type,
		undo: state === "undo",
		completed: state === "completed",
		archived: state === "archived",
	};
}

function appeal(overrides: Partial<EligibleAppeal> = {}): EligibleAppeal {
	return { caseId: 99, status: "pending", createdAt: now - day, decidedAt: null, ...overrides };
}

function access(overrides: Partial<Parameters<typeof getAppealFormAccess>[0]> = {}) {
	return getAppealFormAccess({
		form: form(),
		settings: limits,
		roles: [],
		cases: [caseOf(1, "Ban")],
		appeals: [],
		now,
		...overrides,
	});
}

describe("isAppealableType", () => {
	it("takes only the kinds the settings turn on, and none when appeals are off", () => {
		expect(isAppealableType(typeSettings, "Ban")).toBe(true);
		expect(isAppealableType(typeSettings, "Mute")).toBe(false);
		expect(isAppealableType(typeSettings, "Timeout")).toBe(true);
		expect(isAppealableType({ ...typeSettings, appealsEnabled: false }, "Ban")).toBe(false);
	});
});

describe("findAppealableCases", () => {
	it("keeps the latest case in course of each kind the server takes", () => {
		const cases = [
			caseOf(1, "Ban", "completed"),
			caseOf(2, "Ban"),
			caseOf(3, "Timeout", "undo"),
			caseOf(4, "Mute"),
		];

		expect(findAppealableCases(cases, typeSettings).map((item) => item.id)).toStrictEqual([2]);
	});

	it("drops a kind whose latest case ended, even if an older one did not", () => {
		const cases = [caseOf(1, "Ban"), caseOf(2, "Ban", "completed")];

		expect(findAppealableCases(cases, typeSettings)).toStrictEqual([]);
	});
});

describe("findCasesInCourse", () => {
	it("lists the kinds the server does not take, newest first, and skips the archived", () => {
		const cases = [caseOf(1, "Mute"), caseOf(2, "Ban"), caseOf(3, "Timeout", "archived")];

		expect(findCasesInCourse(cases).map((item) => item.id)).toStrictEqual([2, 1]);
	});
});

describe("getAppealFormAccess", () => {
	it("opens the form with its cases when nothing is against it", () => {
		expect(access()).toMatchObject({ open: true, cases: [{ id: 1 }] });
	});

	it("locks a disabled form", () => {
		expect(access({ form: form({ enabled: false }) })).toStrictEqual({
			open: false,
			lock: "disabled",
		});
	});

	it("has nothing to appeal with a form for bans when the member only has a mute", () => {
		const result = access({
			form: form({ types: [AppealCaseTypes.Ban] }),
			cases: [caseOf(1, "Mute")],
		});

		expect(result).toStrictEqual({ open: false, lock: "noEligibleCase" });
	});

	it("offers only the bans with a form for bans", () => {
		const cases = [caseOf(1, "Mute"), caseOf(2, "Ban")];

		expect(access({ form: form({ types: [AppealCaseTypes.Ban] }), cases })).toMatchObject({
			open: true,
			cases: [{ id: 2 }],
		});
	});

	it("does not offer a case that was appealed already", () => {
		expect(access({ appeals: [appeal({ caseId: 1, status: "accepted" })] })).toStrictEqual({
			open: false,
			lock: "noEligibleCase",
		});
	});

	it("reads a user who is not a member as missing a required role and holding no restricted one", () => {
		expect(access({ form: form({ requiredRoles: ["5"] }), roles: null })).toStrictEqual({
			open: false,
			lock: "missingRole",
		});
		expect(access({ form: form({ restrictedRoles: ["5"] }), roles: null })).toMatchObject({
			open: true,
		});
	});

	it("lets a restricted role win over a required one", () => {
		const result = access({
			form: form({ requiredRoles: ["5"], restrictedRoles: ["6"] }),
			roles: ["5", "6"],
		});

		expect(result).toStrictEqual({ open: false, lock: "restrictedRole" });
	});

	it("ends a seven-day cooldown four days from now after a denial three days ago", () => {
		const denied = appeal({ status: "denied", decidedAt: now - 3 * day });

		expect(access({ appeals: [denied] })).toStrictEqual({
			open: false,
			lock: "cooldown",
			until: now + 4 * day,
		});
	});

	it("does not wait after a denial when the server has no cooldown", () => {
		const denied = appeal({ status: "denied", decidedAt: now - 3 * day });

		expect(
			access({ appeals: [denied], settings: { ...limits, appealsCooldownDays: 0 } }),
		).toMatchObject({
			open: true,
		});
	});

	it("takes no more appeals once as many are pending as allowed", () => {
		expect(access({ appeals: [appeal()] })).toStrictEqual({ open: false, lock: "maxActive" });
		expect(
			access({ appeals: [appeal()], settings: { ...limits, appealsMaxActive: 2 } }),
		).toMatchObject({
			open: true,
		});
	});
});

describe("cooldownEnd", () => {
	it("counts from the latest denial, from when it was sent when it has no decision date", () => {
		const appeals = [
			appeal({ status: "denied", decidedAt: now - 5 * day }),
			appeal({ status: "denied", createdAt: now - 2 * day }),
			appeal({ status: "accepted", decidedAt: now }),
		];

		expect(cooldownEnd(appeals, limits)).toBe(now + 5 * day);
	});

	it("is null without a denial", () => {
		expect(cooldownEnd([appeal()], limits)).toBeNull();
	});
});

describe("decideCaseOpening", () => {
	function decide(overrides: Partial<Parameters<typeof decideCaseOpening>[0]> = {}) {
		const entry = overrides.entry ?? caseOf(1, "Ban");
		return decideCaseOpening({
			entry,
			settings,
			block: null,
			forms: [],
			roles: [],
			cases: [entry],
			appeals: [],
			now,
			...overrides,
		});
	}

	it("opens a case the built-in form takes when the server set up no form", () => {
		expect(decide()).toStrictEqual({ status: "open" });
	});

	it("closes every case of a blocked member, with the reason the server gave", () => {
		expect(decide({ block: { reason: "Spam" } })).toStrictEqual({
			status: "closed",
			reason: "blocked",
			detail: "Spam",
			againAt: null,
		});
	});

	it("says appeals are off before the kind is checked", () => {
		expect(decide({ settings: { ...settings, appealsEnabled: false } })).toMatchObject({
			reason: "off",
		});
	});

	it("says the server takes no appeal for a kind it turned off", () => {
		expect(decide({ settings: { ...settings, appealsBans: false } })).toMatchObject({
			reason: "type",
		});
	});

	it("says when the member can appeal again after a recent denial of another case", () => {
		const denied = appeal({ caseId: 7, status: "denied", decidedAt: now - day });

		expect(decide({ appeals: [denied] })).toStrictEqual({
			status: "closed",
			reason: "cooldown",
			detail: null,
			againAt: now + 6 * day,
		});
	});

	it("says the member waits on too many appeals", () => {
		expect(decide({ appeals: [appeal({ caseId: 7 })] })).toMatchObject({
			reason: "maxActive",
			againAt: null,
		});
	});

	it("reads a form closed by roles, or a form for another kind, as no form", () => {
		expect(decide({ forms: [form({ requiredRoles: ["5"] })] })).toMatchObject({
			reason: "noForm",
		});
		expect(decide({ forms: [form({ types: [AppealCaseTypes.Mute] })] })).toMatchObject({
			reason: "noForm",
		});
	});

	it("ignores the cooldown of a form that does not take the kind", () => {
		const forms = [
			form({ types: [AppealCaseTypes.Mute], enabled: true }),
			form({ types: [AppealCaseTypes.Ban], enabled: false }),
		];
		const mute = caseOf(2, "Mute");
		const denied = appeal({ caseId: 7, status: "denied", decidedAt: now - day });

		expect(decide({ forms, cases: [caseOf(1, "Ban"), mute], appeals: [denied] })).toMatchObject(
			{
				reason: "noForm",
			},
		);
	});

	it("opens a case when one of the forms that take it is open", () => {
		const forms = [form({ enabled: false }), form({ types: [AppealCaseTypes.Ban] })];

		expect(decide({ forms })).toStrictEqual({ status: "open" });
	});
});
