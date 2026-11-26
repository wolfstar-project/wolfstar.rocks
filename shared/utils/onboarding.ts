/**
 * The onboarding of a guild: the stages a new member must pass before they are
 * in, each with a challenge, and what tells an administrator which of them the
 * bot cannot run yet.
 *
 * The bot (wolfstar-project/wolfstar#418) owns the tables and runs the stages
 * in Discord. This file holds what the dashboard, its routes and the bot's
 * panel share: the limits, the reader of a stage, and the readiness check.
 * Nothing here touches the database or Discord.
 */
import type { Snowflake } from "discord-api-types/v10";

/** The most stages a guild has. */
export const MaximumOnboardingStages = 5;

/** The longest texts, in characters, and the most answers a question takes. */
export const OnboardingLimits = {
	/** The name of a stage, 1 to 32. */
	stageName: 32,
	/** The text of a `Question` challenge, 1 to 200. */
	question: 200,
	/** One accepted answer, 1 to 100. */
	answer: 100,
	/** The accepted answers of a question, 1 to 5. */
	answers: 5,
} as const;

/** How many times a member may answer wrong before the stage fails. */
export const OnboardingAttempts = { minimum: 1, maximum: 5 } as const;

/** How long a member has to pass a stage, in seconds; `0` sets no limit. */
export const OnboardingTimeLimitSeconds = { minimum: 60, maximum: 86_400 } as const;

/** How long the `Timeout` failure action lasts, in seconds: Discord's own range, up to 28 days. */
export const OnboardingFailureTimeoutSeconds = { minimum: 60, maximum: 2_419_200 } as const;

/** When a stage starts, the `OnboardingStageTrigger` enum. */
export const OnboardingStageTriggers = ["Join", "NativeOnboarding"] as const;
export type OnboardingStageTrigger = (typeof OnboardingStageTriggers)[number];

/** What a stage asks of the member, the `OnboardingChallenge` enum. */
export const OnboardingChallenges = ["Button", "Emoji", "Question", "Captcha"] as const;
export type OnboardingChallenge = (typeof OnboardingChallenges)[number];

/**
 * The challenges an administrator can pick today. `Captcha` is in the contract
 * and waits for the verification page to serve it.
 */
export const OfferedOnboardingChallenges = [
	"Button",
	"Emoji",
	"Question",
] as const satisfies readonly OnboardingChallenge[];

/** What WolfStar does to a member who fails a stage, the `OnboardingFailureAction` enum. */
export const OnboardingFailureActions = ["None", "Kick", "Timeout"] as const;
export type OnboardingFailureAction = (typeof OnboardingFailureActions)[number];

/** A stage as an administrator edits it, with the names of its columns. */
export interface OnboardingStageInput {
	name: string;
	enabled: boolean;
	trigger: OnboardingStageTrigger;
	challenge: OnboardingChallenge;
	/** The text of a `Question`; `null` for the other challenges. */
	question: string | null;
	/** The accepted answers of a `Question`, compared whatever the case; empty for the others. */
	answers: string[];
	maxAttempts: number;
	/** In seconds; `0` sets no limit. */
	timeLimit: number;
	/** The role the member gets when they pass. */
	roleId: Snowflake | null;
	failureAction: OnboardingFailureAction;
	/** In seconds, for `Timeout`; `null` for the other actions. */
	failureTimeout: number | null;
}

/** A stage as it is stored. */
export interface OnboardingStage extends OnboardingStageInput {
	id: string;
	/** Its place in the sequence, from 0. */
	position: number;
	/** In milliseconds. */
	createdAt: number;
}

/**
 * Why the editor or the routes refuse a stage, in the order the editor shows
 * them.
 */
export type OnboardingStageProblem =
	| "name"
	| "captcha"
	| "question"
	| "answers"
	| "attempts"
	| "timeLimit"
	| "failureTimeout";

export type OnboardingStageParse =
	| { ok: true; value: OnboardingStageInput }
	| { ok: false; problem: OnboardingStageProblem };

function isWholeNumberIn(value: number, range: { minimum: number; maximum: number }): boolean {
	return Number.isInteger(value) && value >= range.minimum && value <= range.maximum;
}

/** The answers as they are stored: trimmed, without the blank ones and the repeats. */
function normalizeAnswers(answers: readonly string[]): string[] {
	const seen = new Set<string>();
	const kept: string[] = [];
	for (const answer of answers) {
		const trimmed = answer.trim();
		const key = trimmed.toLowerCase();
		if (trimmed.length === 0 || seen.has(key)) continue;
		seen.add(key);
		kept.push(trimmed);
	}
	return kept;
}

type QuestionParse =
	| { ok: true; question: string | null; answers: string[] }
	| { ok: false; problem: "question" | "answers" };

function parseQuestion(input: OnboardingStageInput): QuestionParse {
	if (input.challenge !== "Question") return { answers: [], ok: true, question: null };

	const question = (input.question ?? "").trim();
	if (question.length === 0 || question.length > OnboardingLimits.question) {
		return { ok: false, problem: "question" };
	}

	const answers = normalizeAnswers(input.answers);
	const fits =
		answers.length > 0 &&
		answers.length <= OnboardingLimits.answers &&
		answers.every((answer) => answer.length <= OnboardingLimits.answer);
	return fits ? { answers, ok: true, question } : { ok: false, problem: "answers" };
}

/**
 * Reads a stage into the one the bot can run, or the first reason it cannot:
 * the name and the answers are trimmed, and the fields a challenge or a
 * failure action does not use are emptied, so a stored stage never carries
 * the question of a challenge it no longer has.
 */
export function parseOnboardingStage(input: OnboardingStageInput): OnboardingStageParse {
	const name = input.name.trim();
	if (name.length === 0 || name.length > OnboardingLimits.stageName) {
		return { ok: false, problem: "name" };
	}
	if (input.challenge === "Captcha") return { ok: false, problem: "captcha" };

	const question = parseQuestion(input);
	if (!question.ok) return question;

	if (!isWholeNumberIn(input.maxAttempts, OnboardingAttempts)) {
		return { ok: false, problem: "attempts" };
	}
	if (input.timeLimit !== 0 && !isWholeNumberIn(input.timeLimit, OnboardingTimeLimitSeconds)) {
		return { ok: false, problem: "timeLimit" };
	}

	const timesOut = input.failureAction === "Timeout";
	if (
		timesOut &&
		(input.failureTimeout === null ||
			!isWholeNumberIn(input.failureTimeout, OnboardingFailureTimeoutSeconds))
	) {
		return { ok: false, problem: "failureTimeout" };
	}

	return {
		ok: true,
		value: {
			...input,
			answers: question.answers,
			failureTimeout: timesOut ? input.failureTimeout : null,
			name,
			question: question.question,
		},
	};
}

// -----------------------------------------------------------------------------
// Readiness
// -----------------------------------------------------------------------------

/** The permissions of the bot a stage can need, by Discord's names. */
export type OnboardingBotPermission = "ManageRoles" | "KickMembers" | "ModerateMembers";

/**
 * What keeps a stage, or the log, from working, with what an administrator
 * needs to fix it. A blocker of the log channel blocks no stage.
 */
export type OnboardingBlocker =
	| { code: "noVerificationMessage" }
	| { code: "communityOff"; stageIds: string[] }
	| { code: "nativeOnboardingOff"; stageIds: string[] }
	| { code: "captchaUnavailable"; stageIds: string[] }
	| { code: "missingPermission"; permission: OnboardingBotPermission; stageIds: string[] }
	| { code: "roleMissing"; stageId: string }
	| { code: "roleUnmanageable"; stageId: string; roleId: Snowflake }
	| { code: "logChannelMissing" }
	| { code: "logPermissions"; missing: string[] };

type ReadinessStage = Pick<
	OnboardingStage,
	"id" | "enabled" | "trigger" | "challenge" | "roleId" | "failureAction"
>;

export interface OnboardingReadinessInput {
	stages: readonly ReadinessStage[];
	/** Whether the bot's verification message is in a channel of the guild. */
	messagePosted: boolean;
	/** Whether the guild has Discord's Community. */
	community: boolean;
	/** Whether Discord's own onboarding is on in the guild. */
	nativeOnboarding: boolean;
	bot: {
		manageRoles: boolean;
		kickMembers: boolean;
		moderateMembers: boolean;
		/** The position of the bot's highest role: it gives only the roles below it. */
		highestRolePosition: number;
	};
	roles: readonly { id: Snowflake; position: number; managed: boolean }[];
	/**
	 * The log channel: `null` when none is set, not `found` when it is gone,
	 * otherwise the permissions the bot lacks in it.
	 */
	logChannel: null | { found: false } | { found: true; missing: readonly string[] };
}

function idsOf(stages: readonly ReadinessStage[]): string[] {
	return stages.map((stage) => stage.id);
}

function discordBlockers(
	stages: readonly ReadinessStage[],
	input: OnboardingReadinessInput,
): OnboardingBlocker[] {
	const waiting = idsOf(stages.filter((stage) => stage.trigger === "NativeOnboarding"));
	if (waiting.length === 0) return [];
	// One step at a time: Discord's onboarding cannot be on before Community is.
	if (!input.community) return [{ code: "communityOff", stageIds: waiting }];
	return input.nativeOnboarding ? [] : [{ code: "nativeOnboardingOff", stageIds: waiting }];
}

function permissionBlockers(
	stages: readonly ReadinessStage[],
	bot: OnboardingReadinessInput["bot"],
): OnboardingBlocker[] {
	const needs: [OnboardingBotPermission, boolean, readonly ReadinessStage[]][] = [
		["ManageRoles", bot.manageRoles, stages.filter((stage) => stage.roleId !== null)],
		["KickMembers", bot.kickMembers, stages.filter((stage) => stage.failureAction === "Kick")],
		[
			"ModerateMembers",
			bot.moderateMembers,
			stages.filter((stage) => stage.failureAction === "Timeout"),
		],
	];
	return needs
		.filter(([, held, needing]) => !held && needing.length > 0)
		.map(([permission, , needing]) => ({
			code: "missingPermission",
			permission,
			stageIds: idsOf(needing),
		}));
}

function roleBlockers(
	stages: readonly ReadinessStage[],
	input: OnboardingReadinessInput,
): OnboardingBlocker[] {
	// Without Manage Roles the bot gives no role at all: that blocker says it.
	if (!input.bot.manageRoles) return [];

	const blockers: OnboardingBlocker[] = [];
	for (const stage of stages) {
		if (stage.roleId === null) continue;
		const role = input.roles.find((candidate) => candidate.id === stage.roleId);
		if (!role) {
			blockers.push({ code: "roleMissing", stageId: stage.id });
		} else if (role.managed || role.position >= input.bot.highestRolePosition) {
			blockers.push({ code: "roleUnmanageable", roleId: role.id, stageId: stage.id });
		}
	}
	return blockers;
}

function logBlockers(logChannel: OnboardingReadinessInput["logChannel"]): OnboardingBlocker[] {
	if (logChannel === null) return [];
	if (!logChannel.found) return [{ code: "logChannelMissing" }];
	return logChannel.missing.length > 0
		? [{ code: "logPermissions", missing: [...logChannel.missing] }]
		: [];
}

/**
 * What the bot cannot do with the onboarding as it is set up: only the stages
 * that are on count, and the log channel counts whatever the stages.
 */
export function onboardingReadiness(input: OnboardingReadinessInput): OnboardingBlocker[] {
	const stages = input.stages.filter((stage) => stage.enabled);
	const captcha = idsOf(stages.filter((stage) => stage.challenge === "Captcha"));

	return [
		...(stages.length > 0 && !input.messagePosted
			? [{ code: "noVerificationMessage" } as const]
			: []),
		...discordBlockers(stages, input),
		...(captcha.length > 0 ? [{ code: "captchaUnavailable", stageIds: captcha } as const] : []),
		...permissionBlockers(stages, input.bot),
		...roleBlockers(stages, input),
		...logBlockers(input.logChannel),
	];
}

function blockedBy(blocker: OnboardingBlocker, enabled: readonly string[]): readonly string[] {
	switch (blocker.code) {
		case "noVerificationMessage":
			return enabled;
		case "communityOff":
		case "nativeOnboardingOff":
		case "captchaUnavailable":
		case "missingPermission":
			return blocker.stageIds;
		case "roleMissing":
		case "roleUnmanageable":
			return [blocker.stageId];
		case "logChannelMissing":
		case "logPermissions":
			return [];
	}
}

/** The stages the blockers keep from working. */
export function blockedOnboardingStageIds(
	blockers: readonly OnboardingBlocker[],
	stages: readonly Pick<OnboardingStage, "id" | "enabled">[],
): Set<string> {
	const enabled = stages.filter((stage) => stage.enabled).map((stage) => stage.id);
	return new Set(blockers.flatMap((blocker) => blockedBy(blocker, enabled)));
}

/** The one line of the section's banner: off, no stage on, some blocked, or ready. */
export type OnboardingVerdict =
	| { kind: "off" }
	| { kind: "empty" }
	| { kind: "blocked"; stages: number }
	| { kind: "ready" };

export function onboardingVerdict(input: {
	enabled: boolean;
	stages: readonly Pick<OnboardingStage, "id" | "enabled">[];
	blockers: readonly OnboardingBlocker[];
}): OnboardingVerdict {
	if (!input.enabled) return { kind: "off" };
	if (!input.stages.some((stage) => stage.enabled)) return { kind: "empty" };

	const blocked = blockedOnboardingStageIds(input.blockers, input.stages).size;
	return blocked > 0 ? { kind: "blocked", stages: blocked } : { kind: "ready" };
}

// -----------------------------------------------------------------------------
// What the routes answer
// -----------------------------------------------------------------------------

/** How many members passed, failed and wait at a stage. */
export interface OnboardingCounts {
	passed: number;
	failed: number;
	waiting: number;
}

/**
 * `GET /api/guilds/:guild/onboarding`, and the answer of every write: the
 * whole configuration, so the page replaces its copy.
 */
export interface OnboardingState {
	/** Rises with every change; a write sends the one it read, and an old one is refused. */
	revision: number;
	/** The module's switch, the `onboardingEnabled` setting. */
	enabled: boolean;
	logChannelId: Snowflake | null;
	/** Where the bot posted its verification message; `null` when it posted none. */
	messageChannelId: Snowflake | null;
	/** In `position` order. */
	stages: OnboardingStage[];
	/** The last seven days, every stage together, the deleted ones too. */
	week: OnboardingCounts;
	/** The last seven days of each stage, by its ID. */
	weekByStage: Record<string, OnboardingCounts>;
	blockers: OnboardingBlocker[];
}
