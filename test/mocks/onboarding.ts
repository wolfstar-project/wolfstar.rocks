import type { OnboardingStage, OnboardingState } from "#shared/utils/onboarding";

/** A stage the bot can run, with the fields a test cares about set over it. */
export function createMockOnboardingStage(
	overrides: Partial<OnboardingStage> = {},
): OnboardingStage {
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

/** The onboarding of a guild with nothing blocked, with the fields a test cares about set over it. */
export function createMockOnboardingState(
	overrides: Partial<OnboardingState> = {},
): OnboardingState {
	return {
		blockers: [],
		enabled: true,
		logChannelId: null,
		messageChannelId: null,
		revision: 1,
		stages: [],
		week: { failed: 0, passed: 0, waiting: 0 },
		weekByStage: {},
		...overrides,
	};
}
