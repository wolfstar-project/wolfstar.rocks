import type { OnboardingStage } from "#shared/utils/onboarding";
import { describe, expect, it } from "vitest";
import {
	formatOnboardingDuration,
	onboardingBlockerLine,
	onboardingStageChips,
	onboardingVerdictHint,
	onboardingWriteErrorMessage,
	readOnboardingWriteError,
	type OnboardingNames,
	type OnboardingText,
} from "~/utils/onboarding";
import guilds from "../../../../i18n/locales/en/guilds.json";

// The English source, read the way the app's `ts` and `tc` read it: `{name}`
// is replaced, and a `zero | one | other` string is picked by its count.
function lookup(key: string): string {
	let node: unknown = guilds;
	for (const part of key.split(".")) {
		node = (node as Record<string, unknown> | undefined)?.[part];
	}
	if (typeof node !== "string") throw new Error(`No English string for ${key}`);
	return node;
}

function interpolate(text: string, params: Record<string, string | number> = {}): string {
	return text.replaceAll(/\{(\w+)\}/g, (match, name: string) =>
		name in params ? String(params[name]) : match,
	);
}

const text: OnboardingText = {
	list: (items) => new Intl.ListFormat("en", { type: "conjunction" }).format(items),
	tc: (key, params) => {
		const values = typeof params === "number" ? { count: params } : params;
		const count = Number(values.count);
		const forms = lookup(key).split(" | ");
		const form = forms.length === 3 ? forms[count === 0 ? 0 : count === 1 ? 1 : 2] : forms[0];
		return interpolate(form ?? "", values);
	},
	ts: (key, params) => interpolate(lookup(key), params),
};

const names: OnboardingNames = {
	channel: (id) => (id === "300" ? "mod-log" : null),
	role: (id) => (id === "200" ? "Member" : null),
};

function makeStage(overrides: Partial<OnboardingStage> = {}): OnboardingStage {
	return {
		answers: [],
		challenge: "Emoji",
		createdAt: 0,
		enabled: true,
		failureAction: "None",
		failureTimeout: null,
		id: "1",
		maxAttempts: 3,
		name: "Are you human?",
		position: 0,
		question: null,
		roleId: null,
		timeLimit: 600,
		trigger: "Join",
		...overrides,
	};
}

const stages = [
	makeStage({ id: "1", name: "Are you human?" }),
	makeStage({ id: "2", name: "Server rules" }),
	makeStage({ id: "3", name: "Quick check" }),
];

describe("formatOnboardingDuration", () => {
	it.each([
		[60, "1 min"],
		[600, "10 min"],
		[3600, "1 h"],
		[7200, "2 h"],
		[5400, "90 min"],
		[86_400, "1 day"],
		[2_419_200, "28 days"],
	])("writes %i seconds as %s", (seconds, expected) => {
		expect(formatOnboardingDuration(seconds, text)).toBe(expected);
	});
});

describe("onboardingStageChips", () => {
	it("tags when, what, the role and what a failure costs", () => {
		const chips = onboardingStageChips(
			makeStage({ failureAction: "Kick", roleId: "200" }),
			text,
			names,
		);

		expect(chips).toStrictEqual([
			{ text: "On join", tone: "neutral" },
			{ text: "Emoji", tone: "neutral" },
			{ text: "Gives @Member", tone: "neutral" },
			{ text: "Kick on failure", tone: "error" },
		]);
	});

	it("leaves the role out of a stage that gives none, and writes a timeout's duration", () => {
		const chips = onboardingStageChips(
			makeStage({
				challenge: "Question",
				failureAction: "Timeout",
				failureTimeout: 600,
				trigger: "NativeOnboarding",
			}),
			text,
			names,
		);

		expect(chips).toStrictEqual([
			{ text: "After Discord's onboarding", tone: "neutral" },
			{ text: "Question", tone: "neutral" },
			{ text: "Timeout 10 min on failure", tone: "warning" },
		]);
	});

	it("says a role is deleted when the server no longer has it", () => {
		const chips = onboardingStageChips(makeStage({ roleId: "999" }), text, names);

		expect(chips.map((chip) => chip.text)).toContain("Gives @deleted role");
	});
});

describe("onboardingBlockerLine", () => {
	const context = { logChannelId: "300", stages };

	it("names one stage by its place and its name", () => {
		const line = onboardingBlockerLine(
			{ code: "communityOff", stageIds: ["2"] },
			context,
			text,
			names,
		);

		expect(line).toStrictEqual({
			fix: "In Discord, open Server Settings, then Enable Community. Then turn on Onboarding there.",
			title: "Stage 2 “Server rules” waits for Discord's onboarding, and this server has no Community.",
		});
	});

	it("names several stages in the order of the sequence", () => {
		const line = onboardingBlockerLine(
			{ code: "nativeOnboardingOff", stageIds: ["3", "1"] },
			context,
			text,
			names,
		);

		expect(line.title).toBe(
			"Stage 1 “Are you human?” and Stage 3 “Quick check” wait for Discord's onboarding, which is off in this server.",
		);
	});

	it("names the permission as Discord's settings do", () => {
		const line = onboardingBlockerLine(
			{ code: "missingPermission", permission: "ModerateMembers", stageIds: ["2"] },
			context,
			text,
			names,
		);

		expect(line).toStrictEqual({
			fix: "In Discord, open Server Settings, then Roles, and give WolfStar's role Timeout Members.",
			title: "WolfStar lacks Timeout Members, which Stage 2 “Server rules” needs.",
		});
	});

	it("names the role the bot cannot give", () => {
		const line = onboardingBlockerLine(
			{ code: "roleUnmanageable", roleId: "200", stageId: "1" },
			context,
			text,
			names,
		);

		expect(line.title).toBe(
			"WolfStar cannot give @Member in Stage 1 “Are you human?”: the role is above its own, or another app manages it.",
		);
		expect(line.fix).toBe(
			"In Discord, move WolfStar's role above @Member, or pick another role for the stage.",
		);
	});

	it("names the log channel and every permission the bot lacks in it", () => {
		const line = onboardingBlockerLine(
			{ code: "logPermissions", missing: ["ViewChannel", "SendMessages"] },
			context,
			text,
			names,
		);

		expect(line.title).toBe(
			"WolfStar cannot post in #mod-log: it lacks View Channel and Send Messages.",
		);
	});

	it("asks for the verification message", () => {
		const line = onboardingBlockerLine({ code: "noVerificationMessage" }, context, text, names);

		expect(line.title).toBe("WolfStar has no verification message in this server.");
	});
});

describe("onboardingVerdictHint", () => {
	it.each([
		[{ kind: "off" }, "Onboarding is off. New members get in with no challenge."],
		[{ kind: "empty" }, "No stage is on. New members get in with no challenge."],
		[
			{ kind: "blocked", stages: 1 },
			"1 stage is blocked. Members stop there until it is fixed.",
		],
		[
			{ kind: "blocked", stages: 2 },
			"2 stages are blocked. Members stop there until they are fixed.",
		],
		[{ kind: "ready" }, "Every stage that is on can run."],
	] as const)("reads %o", (verdict, expected) => {
		expect(onboardingVerdictHint(verdict, text)).toBe(expected);
	});
});

function fetchError(data: Record<string, unknown>) {
	return { data: { data }, statusCode: 400 };
}

describe("readOnboardingWriteError", () => {
	it.each(["conflict", "limit", "nameTaken", "unknown", "invalid", "logChannel", "role"])(
		"reads the code %s",
		(code) => {
			expect(readOnboardingWriteError(fetchError({ code }))).toStrictEqual({ code });
		},
	);

	it("reads the problem of a stage the bot could not run", () => {
		const error = readOnboardingWriteError(fetchError({ code: "stage", problem: "answers" }));

		expect(error).toStrictEqual({ code: "stage", problem: "answers" });
	});

	it("reads the permissions the bot lacks in the log channel", () => {
		const error = readOnboardingWriteError(
			fetchError({ code: "logPermissions", missing: ["ViewChannel", "SendMessages"] }),
		);

		expect(error).toStrictEqual({
			code: "logPermissions",
			missing: ["ViewChannel", "SendMessages"],
		});
	});

	it.each([
		["a failed connection", new TypeError("Failed to fetch")],
		["a code it does not know", fetchError({ code: "teapot" })],
		["a stage problem it does not know", fetchError({ code: "stage", problem: "colour" })],
		["nothing", null],
	])("reads %s as a generic failure", (_label, error) => {
		expect(readOnboardingWriteError(error)).toStrictEqual({ code: "generic" });
	});
});

describe("onboardingWriteErrorMessage", () => {
	it("says which permissions the bot lacks in the channel that was picked", () => {
		const message = onboardingWriteErrorMessage(
			{ code: "logPermissions", missing: ["SendMessages", "EmbedLinks"] },
			{ logChannelId: "300" },
			text,
			names,
		);

		expect(message).toBe(
			"WolfStar cannot post in #mod-log: it lacks Send Messages and Embed Links. The log channel was not changed.",
		);
	});

	it("says the problem of a stage as the editor does", () => {
		const message = onboardingWriteErrorMessage(
			{ code: "stage", problem: "question" },
			{ logChannelId: null },
			text,
			names,
		);

		expect(message).toBe("Write the question, 200 characters at most.");
	});

	it("says a conflict asks for a reload", () => {
		const message = onboardingWriteErrorMessage(
			{ code: "conflict" },
			{ logChannelId: null },
			text,
			names,
		);

		expect(message).toBe(
			"Another administrator changed the onboarding. Reload it, then try again.",
		);
	});
});
