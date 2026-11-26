import type {
	OnboardingChange,
	OnboardingRecord,
	OnboardingStore,
} from "#server/utils/onboarding/store";
import type { Snowflake } from "discord-api-types/v10";
import {
	MaximumOnboardingStages,
	parseOnboardingStage,
	type OnboardingStage,
	type OnboardingStageInput,
	type OnboardingStageProblem,
} from "#shared/utils/onboarding";

/**
 * Why a change of the onboarding is refused: another write came first, the
 * guild has its five stages, a name is taken, the stage is gone, the body
 * makes no sense, or the stage is one the bot could not run.
 */
export type OnboardingRefusal =
	| { code: "conflict" | "limit" | "nameTaken" | "unknown" | "invalid" }
	| { code: "stage"; problem: OnboardingStageProblem };

type StageRefusal = Exclude<OnboardingRefusal, { code: "conflict" }>;
type StageChange<Value> = Promise<OnboardingChange<Value, OnboardingRefusal>>;

function refuse(error: StageRefusal): { ok: false; error: StageRefusal } {
	return { error, ok: false };
}

function nameTaken(record: OnboardingRecord, name: string, ignoreId: string | null): boolean {
	const lower = name.toLowerCase();
	return record.stages.some(
		(stage) => stage.id !== ignoreId && stage.name.toLowerCase() === lower,
	);
}

/** The fields of a stored stage an administrator edits. */
function inputOf(stage: OnboardingStage): OnboardingStageInput {
	const { id: _id, position: _position, createdAt: _createdAt, ...input } = stage;
	return input;
}

/**
 * Creates a stage after the ones the guild has. Refused past five stages, for
 * a name another stage has whatever its case, and for a stage the bot could
 * not run.
 */
export function createOnboardingStage(
	store: OnboardingStore,
	guildId: Snowflake,
	revision: number,
	input: OnboardingStageInput,
): StageChange<OnboardingStage> {
	const parsed = parseOnboardingStage(input);
	if (!parsed.ok) {
		return Promise.resolve(refuse({ code: "stage", problem: parsed.problem }));
	}

	return store.change(guildId, revision, async (writes, current) => {
		if (current.stages.length >= MaximumOnboardingStages) return refuse({ code: "limit" });
		if (nameTaken(current, parsed.value.name, null)) return refuse({ code: "nameTaken" });

		const stage = await writes.insertStage(parsed.value, current.stages.length);
		return { ok: true, value: stage };
	});
}

/**
 * Edits a stage. The fields that change are read with the ones the stage has,
 * so a change that leaves the stage one the bot could not run is refused: a
 * `Question` challenge set on a stage with no question, for one.
 *
 * @returns The stage before and after, for the audit trail.
 */
export function updateOnboardingStage(
	store: OnboardingStore,
	guildId: Snowflake,
	revision: number,
	stageId: string,
	patch: Partial<OnboardingStageInput>,
): StageChange<{ before: OnboardingStage; after: OnboardingStage }> {
	return store.change(guildId, revision, async (writes, current) => {
		const before = current.stages.find((stage) => stage.id === stageId);
		if (!before) return refuse({ code: "unknown" });

		const parsed = parseOnboardingStage({ ...inputOf(before), ...patch });
		if (!parsed.ok) return refuse({ code: "stage", problem: parsed.problem });
		if (nameTaken(current, parsed.value.name, stageId)) return refuse({ code: "nameTaken" });

		await writes.updateStage(stageId, parsed.value);
		return { ok: true, value: { after: { ...before, ...parsed.value }, before } };
	});
}

/**
 * Deletes a stage, and closes the gap it leaves in the sequence.
 * @returns The stage that was deleted, for the audit trail.
 */
export function deleteOnboardingStage(
	store: OnboardingStore,
	guildId: Snowflake,
	revision: number,
	stageId: string,
): StageChange<OnboardingStage> {
	return store.change(guildId, revision, async (writes, current) => {
		const stage = current.stages.find((entry) => entry.id === stageId);
		if (!stage) return refuse({ code: "unknown" });

		await writes.deleteStage(stageId);
		await writes.setOrder(
			current.stages.filter((entry) => entry.id !== stageId).map((entry) => entry.id),
		);
		return { ok: true, value: stage };
	});
}

/**
 * Puts the stages in a new order. The order names every stage of the guild
 * once: anything else is not an order of these stages.
 *
 * @returns The names of the stages, before and after, for the audit trail.
 */
export function reorderOnboardingStages(
	store: OnboardingStore,
	guildId: Snowflake,
	revision: number,
	order: readonly string[],
): StageChange<{ before: string[]; after: string[] }> {
	return store.change(guildId, revision, async (writes, current) => {
		const ids = current.stages.map((stage) => stage.id);
		const named = new Set(order);
		const isOrderOfThese =
			order.length === ids.length &&
			named.size === ids.length &&
			ids.every((id) => named.has(id));
		if (!isOrderOfThese) return refuse({ code: "invalid" });

		await writes.setOrder(order);
		const nameOf = (id: string) => current.stages.find((stage) => stage.id === id)?.name ?? id;
		return { ok: true, value: { after: order.map(nameOf), before: ids.map(nameOf) } };
	});
}

/**
 * Sets the log channel, or none. Whether the bot can post there is the
 * route's to check first, with Discord.
 *
 * @returns The channel before, for the audit trail.
 */
export function setOnboardingLogChannel(
	store: OnboardingStore,
	guildId: Snowflake,
	revision: number,
	channelId: Snowflake | null,
): StageChange<{ before: Snowflake | null }> {
	return store.change(guildId, revision, async (writes, current) => {
		await writes.setLogChannel(channelId);
		return { ok: true, value: { before: current.logChannelId } };
	});
}
