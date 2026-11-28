import type {
	OnboardingChallenge,
	OnboardingFailureAction,
	OnboardingStageInput,
	OnboardingStageProblem,
	OnboardingStageTrigger,
} from "#shared/utils/onboarding";
import { OnboardingLimits } from "#shared/utils/onboarding";

/**
 * A stage as the editor holds it: the durations in milliseconds, as the
 * duration field edits them, the question kept while another challenge is
 * picked, and always one answer field to type in.
 */
export interface OnboardingStageDraft {
	name: string;
	enabled: boolean;
	trigger: OnboardingStageTrigger;
	challenge: OnboardingChallenge;
	question: string;
	answers: string[];
	maxAttempts: number;
	/** In milliseconds; `0` sets no limit. */
	timeLimit: number;
	roleId: string | null;
	failureAction: OnboardingFailureAction;
	/** In milliseconds. */
	failureTimeout: number;
}

const MillisecondsPerSecond = 1000;
const DefaultFailureTimeoutSeconds = 600;

/** The stage the editor opens on for a new one: a button, three attempts, ten minutes. */
export function createOnboardingStageDraft(): OnboardingStageDraft {
	return {
		answers: [""],
		challenge: "Button",
		enabled: true,
		failureAction: "None",
		failureTimeout: DefaultFailureTimeoutSeconds * MillisecondsPerSecond,
		maxAttempts: 3,
		name: "",
		question: "",
		roleId: null,
		timeLimit: 600 * MillisecondsPerSecond,
		trigger: "Join",
	};
}

/** A stored stage as the editor holds it. */
export function onboardingStageToDraft(stage: OnboardingStageInput): OnboardingStageDraft {
	return {
		answers: stage.answers.length > 0 ? [...stage.answers] : [""],
		challenge: stage.challenge,
		enabled: stage.enabled,
		failureAction: stage.failureAction,
		failureTimeout:
			(stage.failureTimeout ?? DefaultFailureTimeoutSeconds) * MillisecondsPerSecond,
		maxAttempts: stage.maxAttempts,
		name: stage.name,
		question: stage.question ?? "",
		roleId: stage.roleId,
		timeLimit: stage.timeLimit * MillisecondsPerSecond,
		trigger: stage.trigger,
	};
}

/**
 * What the editor sends: the durations in whole seconds, and the question and
 * the timeout's length only for the challenge and the action that use them.
 */
export function onboardingDraftToInput(draft: OnboardingStageDraft): OnboardingStageInput {
	const asksQuestion = draft.challenge === "Question";
	return {
		answers: asksQuestion ? draft.answers : [],
		challenge: draft.challenge,
		enabled: draft.enabled,
		failureAction: draft.failureAction,
		failureTimeout:
			draft.failureAction === "Timeout"
				? Math.round(draft.failureTimeout / MillisecondsPerSecond)
				: null,
		maxAttempts: draft.maxAttempts,
		name: draft.name,
		question: asksQuestion ? draft.question : null,
		roleId: draft.roleId,
		timeLimit: Math.round(draft.timeLimit / MillisecondsPerSecond),
		trigger: draft.trigger,
	};
}

/** The draft with one more answer field, up to the most a question takes. */
export function addOnboardingAnswer(draft: OnboardingStageDraft): OnboardingStageDraft {
	if (draft.answers.length >= OnboardingLimits.answers) return draft;
	return { ...draft, answers: [...draft.answers, ""] };
}

/** The draft without the answer at `index`; the last field stays, emptied. */
export function removeOnboardingAnswer(
	draft: OnboardingStageDraft,
	index: number,
): OnboardingStageDraft {
	const answers = draft.answers.filter((_, position) => position !== index);
	return { ...draft, answers: answers.length > 0 ? answers : [""] };
}

/** The IDs of the stages with the one at `index` moved one place up or down, or `null` at an end. */
export function moveOnboardingStage(
	ids: readonly string[],
	index: number,
	direction: -1 | 1,
): string[] | null {
	const target = index + direction;
	const moved = ids[index];
	const swapped = ids[target];
	if (moved === undefined || swapped === undefined) return null;

	const order = [...ids];
	order[index] = swapped;
	order[target] = moved;
	return order;
}

// Literal keys, one per problem, so the i18n report sees each.
export const ONBOARDING_PROBLEM_KEYS = {
	answers: "guild_settings.onboarding.problems.answers",
	attempts: "guild_settings.onboarding.problems.attempts",
	captcha: "guild_settings.onboarding.problems.captcha",
	failureTimeout: "guild_settings.onboarding.problems.failureTimeout",
	name: "guild_settings.onboarding.problems.name",
	question: "guild_settings.onboarding.problems.question",
	timeLimit: "guild_settings.onboarding.problems.timeLimit",
} as const satisfies Record<OnboardingStageProblem, string>;
