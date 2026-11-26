import type {
	OnboardingCounts,
	OnboardingStage,
	OnboardingStageInput,
} from "#shared/utils/onboarding";
import type { Snowflake } from "discord-api-types/v10";

/** The onboarding of a guild as the database holds it. */
export interface OnboardingRecord {
	/** Rises with every change of the log channel, the verification message or a stage. */
	revision: number;
	enabled: boolean;
	logChannelId: Snowflake | null;
	/** The channel of the bot's verification message; `null` when it posted none. */
	messageChannelId: Snowflake | null;
	/** In `position` order. */
	stages: OnboardingStage[];
}

/** The last seven days of the stages of a guild. */
export interface OnboardingWeek {
	week: OnboardingCounts;
	weekByStage: Record<string, OnboardingCounts>;
}

/** The writes of one change, inside its transaction. */
export interface OnboardingStoreWrites {
	insertStage(stage: OnboardingStageInput, position: number): Promise<OnboardingStage>;
	updateStage(stageId: string, stage: Partial<OnboardingStageInput>): Promise<void>;
	deleteStage(stageId: string): Promise<void>;
	/** Gives each stage its place: every ID, first to last. */
	setOrder(order: readonly string[]): Promise<void>;
	setLogChannel(channelId: Snowflake | null): Promise<void>;
}

export type OnboardingChange<Value, Refusal> =
	| { ok: true; value: Value }
	| { ok: false; error: Refusal };

/**
 * Where the onboarding of a guild is kept. The routes take the one that
 * reaches the database; the tests take one that keeps it in memory.
 */
export interface OnboardingStore {
	read(guildId: Snowflake): Promise<OnboardingRecord>;
	countWeek(guildId: Snowflake, now: number): Promise<OnboardingWeek>;
	/**
	 * Runs a change in one transaction, after it took the revision: the change
	 * runs only when the guild's onboarding is still at `revision`, and is
	 * otherwise answered with `conflict`, nothing written. `change` gets the
	 * record as it is inside the transaction; what it refuses is rolled back.
	 */
	change<Value, Refusal>(
		guildId: Snowflake,
		revision: number,
		change: (
			writes: OnboardingStoreWrites,
			current: OnboardingRecord,
		) => Promise<OnboardingChange<Value, Refusal>>,
	): Promise<OnboardingChange<Value, Refusal | { code: "conflict" }>>;
}
