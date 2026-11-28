import type {
	OnboardingReadinessInput,
	OnboardingStage,
	OnboardingStageInput,
	OnboardingStageProblem,
} from "#shared/utils/onboarding";
import {
	blockedOnboardingStageIds,
	findOnboardingCaptchaWait,
	onboardingReadiness,
	onboardingVerdict,
	parseOnboardingStage,
} from "#shared/utils/onboarding";
import { describe, expect, it } from "vitest";

function makeInput(overrides: Partial<OnboardingStageInput> = {}): OnboardingStageInput {
	return {
		answers: [],
		challenge: "Button",
		enabled: true,
		failureAction: "None",
		failureTimeout: null,
		maxAttempts: 3,
		name: "Are you human?",
		question: null,
		roleId: null,
		timeLimit: 600,
		trigger: "Join",
		...overrides,
	};
}

function makeStage(overrides: Partial<OnboardingStage> = {}): OnboardingStage {
	return { ...makeInput(), createdAt: 0, id: "1", position: 0, ...overrides };
}

function makeReadiness(
	overrides: Partial<OnboardingReadinessInput> = {},
): OnboardingReadinessInput {
	return {
		bot: {
			highestRolePosition: 10,
			kickMembers: true,
			manageRoles: true,
			moderateMembers: true,
		},
		captchaAvailable: true,
		community: true,
		logChannel: null,
		messagePosted: true,
		nativeOnboarding: true,
		roles: [{ id: "200", managed: false, position: 5 }],
		stages: [makeStage()],
		...overrides,
	};
}

describe("parseOnboardingStage", () => {
	it("trims the name and keeps a stage the bot can run", () => {
		const result = parseOnboardingStage(makeInput({ name: "  Quick check  " }));

		expect(result).toStrictEqual({ ok: true, value: makeInput({ name: "Quick check" }) });
	});

	it.each<[string, Partial<OnboardingStageInput>, OnboardingStageProblem]>([
		["an empty name", { name: "   " }, "name"],
		["a name past 32 characters", { name: "x".repeat(33) }, "name"],
		["the captcha, when the site cannot check one", { challenge: "Captcha" }, "captcha"],
		["a question with no text", { challenge: "Question", answers: ["yes"] }, "question"],
		[
			"a question past 200 characters",
			{ challenge: "Question", question: "x".repeat(201), answers: ["yes"] },
			"question",
		],
		["a question with no answer", { challenge: "Question", question: "Ready?" }, "answers"],
		[
			"a question with only blank answers",
			{ challenge: "Question", question: "Ready?", answers: ["  ", ""] },
			"answers",
		],
		[
			"an answer past 100 characters",
			{ challenge: "Question", question: "Ready?", answers: ["x".repeat(101)] },
			"answers",
		],
		[
			"more than 5 answers",
			{ challenge: "Question", question: "Ready?", answers: ["a", "b", "c", "d", "e", "f"] },
			"answers",
		],
		["no attempt", { maxAttempts: 0 }, "attempts"],
		["more than 5 attempts", { maxAttempts: 6 }, "attempts"],
		["half an attempt", { maxAttempts: 1.5 }, "attempts"],
		["a time limit under a minute", { timeLimit: 30 }, "timeLimit"],
		["a time limit past a day", { timeLimit: 86_401 }, "timeLimit"],
		["a timeout with no duration", { failureAction: "Timeout" }, "failureTimeout"],
		[
			"a timeout past 28 days",
			{ failureAction: "Timeout", failureTimeout: 2_419_201 },
			"failureTimeout",
		],
	])("refuses %s", (_label, overrides, problem) => {
		expect(parseOnboardingStage(makeInput(overrides))).toStrictEqual({ ok: false, problem });
	});

	it("keeps the captcha of a stage that already has it", () => {
		const stage = makeInput({ challenge: "Captcha", enabled: false });

		expect(parseOnboardingStage(stage, { keepsCaptcha: true })).toStrictEqual({
			ok: true,
			value: stage,
		});
	});

	it("gives a stage the captcha when the site checks one", () => {
		const stage = makeInput({ challenge: "Captcha" });

		expect(parseOnboardingStage(stage, { captchaAvailable: true })).toStrictEqual({
			ok: true,
			value: stage,
		});
	});

	it("accepts no time limit", () => {
		expect(parseOnboardingStage(makeInput({ timeLimit: 0 })).ok).toBe(true);
	});

	it("trims the answers and drops the blank and repeated ones, whatever the case", () => {
		const result = parseOnboardingStage(
			makeInput({
				answers: [" Yes ", "yes", "", "I agree"],
				challenge: "Question",
				question: "  Did you read the rules? ",
			}),
		);

		expect(result).toStrictEqual({
			ok: true,
			value: makeInput({
				answers: ["Yes", "I agree"],
				challenge: "Question",
				question: "Did you read the rules?",
			}),
		});
	});

	it("drops the question of a stage that asks none", () => {
		const result = parseOnboardingStage(
			makeInput({ answers: ["yes"], challenge: "Emoji", question: "Left over" }),
		);

		expect(result).toStrictEqual({ ok: true, value: makeInput({ challenge: "Emoji" }) });
	});

	it("drops the timeout's duration of a stage that does not time out", () => {
		const result = parseOnboardingStage(
			makeInput({ failureAction: "Kick", failureTimeout: 600 }),
		);

		expect(result).toStrictEqual({ ok: true, value: makeInput({ failureAction: "Kick" }) });
	});
});

describe("onboardingReadiness", () => {
	it("finds nothing blocked when the server and the bot have what the stages need", () => {
		expect(onboardingReadiness(makeReadiness())).toStrictEqual([]);
	});

	it("ignores a stage that is off", () => {
		const blockers = onboardingReadiness(
			makeReadiness({
				community: false,
				stages: [makeStage({ enabled: false, trigger: "NativeOnboarding" })],
			}),
		);

		expect(blockers).toStrictEqual([]);
	});

	it("asks for the verification message once a stage is on", () => {
		expect(onboardingReadiness(makeReadiness({ messagePosted: false }))).toStrictEqual([
			{ code: "noVerificationMessage" },
		]);
	});

	it("names the stages that wait for Discord's onboarding in a server with no Community", () => {
		const blockers = onboardingReadiness(
			makeReadiness({
				community: false,
				nativeOnboarding: false,
				stages: [
					makeStage({ id: "1" }),
					makeStage({ id: "2", trigger: "NativeOnboarding" }),
					makeStage({ id: "3", trigger: "NativeOnboarding" }),
				],
			}),
		);

		// One step at a time: Discord's onboarding cannot be on before Community is.
		expect(blockers).toStrictEqual([{ code: "communityOff", stageIds: ["2", "3"] }]);
	});

	it("names the stages that wait for Discord's onboarding while it is off", () => {
		const blockers = onboardingReadiness(
			makeReadiness({
				nativeOnboarding: false,
				stages: [makeStage({ id: "2", trigger: "NativeOnboarding" })],
			}),
		);

		expect(blockers).toStrictEqual([{ code: "nativeOnboardingOff", stageIds: ["2"] }]);
	});

	it("names each permission the bot lacks, with the stages that need it", () => {
		const blockers = onboardingReadiness(
			makeReadiness({
				bot: {
					highestRolePosition: 10,
					kickMembers: false,
					manageRoles: false,
					moderateMembers: false,
				},
				stages: [
					makeStage({ id: "1", roleId: "200" }),
					makeStage({ failureAction: "Kick", id: "2" }),
					makeStage({ failureAction: "Timeout", failureTimeout: 600, id: "3" }),
				],
			}),
		);

		expect(blockers).toStrictEqual([
			{ code: "missingPermission", permission: "ManageRoles", stageIds: ["1"] },
			{ code: "missingPermission", permission: "KickMembers", stageIds: ["2"] },
			{ code: "missingPermission", permission: "ModerateMembers", stageIds: ["3"] },
		]);
	});

	it("tells a role that is gone from a role the bot cannot give", () => {
		const blockers = onboardingReadiness(
			makeReadiness({
				roles: [
					{ id: "200", managed: false, position: 10 },
					{ id: "300", managed: true, position: 2 },
				],
				stages: [
					makeStage({ id: "1", roleId: "999" }),
					makeStage({ id: "2", roleId: "200" }),
					makeStage({ id: "3", roleId: "300" }),
				],
			}),
		);

		expect(blockers).toStrictEqual([
			{ code: "roleMissing", stageId: "1" },
			{ code: "roleUnmanageable", roleId: "200", stageId: "2" },
			{ code: "roleUnmanageable", roleId: "300", stageId: "3" },
		]);
	});

	it("names a stage with the captcha when the site cannot check one", () => {
		const stages = [makeStage({ challenge: "Captcha", id: "4" })];

		expect(
			onboardingReadiness(makeReadiness({ captchaAvailable: false, stages })),
		).toStrictEqual([{ code: "captchaUnavailable", stageIds: ["4"] }]);
		expect(onboardingReadiness(makeReadiness({ stages }))).toStrictEqual([]);
	});

	it("reports the log channel even when no stage is on", () => {
		const gone = onboardingReadiness(
			makeReadiness({ logChannel: { found: false }, stages: [] }),
		);
		const locked = onboardingReadiness(
			makeReadiness({
				logChannel: { found: true, missing: ["SendMessages", "EmbedLinks"] },
				stages: [],
			}),
		);

		expect(gone).toStrictEqual([{ code: "logChannelMissing" }]);
		expect(locked).toStrictEqual([
			{ code: "logPermissions", missing: ["SendMessages", "EmbedLinks"] },
		]);
	});
});

describe("blockedOnboardingStageIds", () => {
	const stages = [
		makeStage({ id: "1" }),
		makeStage({ id: "2" }),
		makeStage({ enabled: false, id: "3" }),
	];

	it("blocks the stages a blocker names", () => {
		const blocked = blockedOnboardingStageIds(
			[
				{ code: "communityOff", stageIds: ["2"] },
				{ code: "roleMissing", stageId: "1" },
			],
			stages,
		);

		expect([...blocked].toSorted()).toStrictEqual(["1", "2"]);
	});

	it("blocks every stage that is on while there is no verification message", () => {
		const blocked = blockedOnboardingStageIds([{ code: "noVerificationMessage" }], stages);

		expect([...blocked].toSorted()).toStrictEqual(["1", "2"]);
	});

	it("blocks no stage for a problem of the log channel", () => {
		const blocked = blockedOnboardingStageIds(
			[{ code: "logPermissions", missing: ["SendMessages"] }],
			stages,
		);

		expect(blocked.size).toBe(0);
	});
});

describe("onboardingVerdict", () => {
	const stages = [makeStage({ id: "1" }), makeStage({ id: "2" })];

	it("says the module is off before anything else", () => {
		const verdict = onboardingVerdict({
			blockers: [{ code: "noVerificationMessage" }],
			enabled: false,
			stages,
		});

		expect(verdict).toStrictEqual({ kind: "off" });
	});

	it("says no stage is on", () => {
		const verdict = onboardingVerdict({
			blockers: [],
			enabled: true,
			stages: [makeStage({ enabled: false })],
		});

		expect(verdict).toStrictEqual({ kind: "empty" });
	});

	it("counts the blocked stages", () => {
		const verdict = onboardingVerdict({
			blockers: [{ code: "roleMissing", stageId: "2" }],
			enabled: true,
			stages,
		});

		expect(verdict).toStrictEqual({ kind: "blocked", stages: 1 });
	});

	it("says ready when only the log channel has a problem", () => {
		const verdict = onboardingVerdict({
			blockers: [{ code: "logChannelMissing" }],
			enabled: true,
			stages,
		});

		expect(verdict).toStrictEqual({ kind: "ready" });
	});
});

describe("findOnboardingCaptchaWait", () => {
	const captcha = makeStage({ challenge: "Captcha", id: "7", name: "Captcha", timeLimit: 600 });
	const row = { createdAt: 1_000_000, id: "40", stageId: "7", status: "Waiting" as const };
	const now = row.createdAt + 60_000;
	const base = {
		enabled: true,
		joinedAt: row.createdAt - 1000,
		now,
		rows: [row],
		stages: [captcha],
	};

	it("finds the Captcha stage the member waits at, with when its time runs out", () => {
		expect(findOnboardingCaptchaWait(base)).toStrictEqual({
			expiresAt: new Date(row.createdAt + 600_000).toISOString(),
			stageName: "Captcha",
			verificationId: "40",
		});
	});

	it("has no end for a stage with no time limit", () => {
		const stages = [{ ...captcha, timeLimit: 0 }];

		expect(findOnboardingCaptchaWait({ ...base, stages })?.expiresAt).toBe(null);
	});

	it("picks the newest row when Discord cannot say when the member joined", () => {
		const older = { ...row, createdAt: row.createdAt - 86_400_000, id: "39" };
		const stages = [{ ...captcha, timeLimit: 0 }];

		const wait = findOnboardingCaptchaWait({
			...base,
			joinedAt: null,
			rows: [older, row],
			stages,
		});

		expect(wait?.verificationId).toBe("40");
	});

	it.each([
		["the onboarding is off", { enabled: false }],
		["the row does not wait", { rows: [{ ...row, status: "Passed" as const }] }],
		[
			"the stage is another challenge",
			{ stages: [{ ...captcha, challenge: "Button" as const }] },
		],
		["the stage is off", { stages: [{ ...captcha, enabled: false }] }],
		["the stage is gone", { rows: [{ ...row, stageId: null }] }],
		["the time ran out", { now: row.createdAt + 600_000 }],
		["the row is of a stay before the member joined again", { joinedAt: row.createdAt + 5000 }],
	])("finds nothing when %s", (_label, overrides) => {
		expect(findOnboardingCaptchaWait({ ...base, ...overrides })).toBe(null);
	});
});
