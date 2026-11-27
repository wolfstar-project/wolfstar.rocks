import type { OnboardingStageInput } from "#shared/utils/onboarding";
import { describe, expect, it } from "vitest";
import {
	addOnboardingAnswer,
	createOnboardingStageDraft,
	moveOnboardingStage,
	onboardingDraftToInput,
	onboardingStageToDraft,
	removeOnboardingAnswer,
} from "~/utils/onboarding-stage-draft";

function makeInput(overrides: Partial<OnboardingStageInput> = {}): OnboardingStageInput {
	return {
		answers: [],
		challenge: "Button",
		enabled: true,
		failureAction: "None",
		failureTimeout: null,
		maxAttempts: 3,
		name: "Quick check",
		question: null,
		roleId: null,
		timeLimit: 600,
		trigger: "Join",
		...overrides,
	};
}

describe("onboardingDraftToInput", () => {
	it("sends a new stage as a button with three attempts and ten minutes", () => {
		const input = onboardingDraftToInput({
			...createOnboardingStageDraft(),
			name: "Quick check",
		});

		expect(input).toStrictEqual(makeInput());
	});

	it("sends the durations in whole seconds", () => {
		const input = onboardingDraftToInput({
			...createOnboardingStageDraft(),
			failureAction: "Timeout",
			failureTimeout: 3_600_000,
			timeLimit: 90_000,
		});

		expect(input.timeLimit).toBe(90);
		expect(input.failureTimeout).toBe(3600);
	});

	it("leaves out the question of a stage that asks none, and the length of a timeout it does not give", () => {
		const input = onboardingDraftToInput({
			...createOnboardingStageDraft(),
			answers: ["yes"],
			challenge: "Emoji",
			failureAction: "Kick",
			question: "Typed before the challenge changed",
		});

		expect(input.question).toBeNull();
		expect(input.answers).toStrictEqual([]);
		expect(input.failureTimeout).toBeNull();
	});
});

describe("onboardingStageToDraft", () => {
	it("gives back the stage it was made from", () => {
		const stage = makeInput({
			answers: ["yes", "I agree"],
			challenge: "Question",
			failureAction: "Timeout",
			failureTimeout: 1200,
			question: "Did you read the rules?",
			roleId: "200",
			timeLimit: 0,
			trigger: "NativeOnboarding",
		});

		expect(onboardingDraftToInput(onboardingStageToDraft(stage))).toStrictEqual(stage);
	});

	it("keeps one answer field to type in for a stage with no answer", () => {
		expect(onboardingStageToDraft(makeInput()).answers).toStrictEqual([""]);
	});
});

describe("the answers of a draft", () => {
	it("adds an answer field up to five", () => {
		let draft = createOnboardingStageDraft();
		for (let count = 0; count < 10; count++) draft = addOnboardingAnswer(draft);

		expect(draft.answers).toHaveLength(5);
	});

	it("removes the answer at a place, and keeps the last field", () => {
		const draft = { ...createOnboardingStageDraft(), answers: ["a", "b", "c"] };

		expect(removeOnboardingAnswer(draft, 1).answers).toStrictEqual(["a", "c"]);
		expect(removeOnboardingAnswer({ ...draft, answers: ["a"] }, 0).answers).toStrictEqual([""]);
	});
});

describe("moveOnboardingStage", () => {
	const ids = ["1", "2", "3"];

	it("swaps a stage with the one before or after it", () => {
		expect(moveOnboardingStage(ids, 1, -1)).toStrictEqual(["2", "1", "3"]);
		expect(moveOnboardingStage(ids, 1, 1)).toStrictEqual(["1", "3", "2"]);
	});

	it("moves nothing past an end of the sequence", () => {
		expect(moveOnboardingStage(ids, 0, -1)).toBeNull();
		expect(moveOnboardingStage(ids, 2, 1)).toBeNull();
	});
});
