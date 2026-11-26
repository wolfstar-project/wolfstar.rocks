import type {
	OnboardingRecord,
	OnboardingStore,
	OnboardingStoreWrites,
} from "#server/utils/onboarding/store";
import type { OnboardingStage } from "#shared/utils/onboarding";

/**
 * An {@link OnboardingStore} that keeps one guild's onboarding in memory, with
 * the database's rules: a change runs only at the revision the record has, a
 * refused change leaves nothing behind, and a change that went through raises
 * the revision by one.
 */
export function createMemoryOnboardingStore(initial: Partial<OnboardingRecord> = {}) {
	let record: OnboardingRecord = {
		enabled: true,
		logChannelId: null,
		messageChannelId: null,
		revision: 0,
		stages: [],
		...initial,
	};
	let nextId = record.stages.length + 1;

	function writesOn(draft: OnboardingRecord): OnboardingStoreWrites {
		return {
			deleteStage: async (stageId) => {
				draft.stages = draft.stages.filter((stage) => stage.id !== stageId);
			},
			insertStage: async (input, position) => {
				const stage: OnboardingStage = {
					...input,
					createdAt: 0,
					id: String(nextId++),
					position,
				};
				draft.stages = [...draft.stages, stage];
				return stage;
			},
			setLogChannel: async (channelId) => {
				draft.logChannelId = channelId;
			},
			setOrder: async (order) => {
				draft.stages = order.flatMap((id, position) => {
					const stage = draft.stages.find((entry) => entry.id === id);
					return stage ? [{ ...stage, position }] : [];
				});
			},
			updateStage: async (stageId, patch) => {
				draft.stages = draft.stages.map((stage) =>
					stage.id === stageId ? { ...stage, ...patch } : stage,
				);
			},
		};
	}

	const store: OnboardingStore = {
		change: async (_guildId, revision, change) => {
			if (revision !== record.revision) return { error: { code: "conflict" }, ok: false };

			const draft = structuredClone(record);
			const result = await change(writesOn(draft), structuredClone(record));
			if (result.ok) record = { ...draft, revision: record.revision + 1 };
			return result;
		},
		countWeek: async () => ({ week: { failed: 0, passed: 0, waiting: 0 }, weekByStage: {} }),
		read: async () => structuredClone(record),
	};

	return {
		/** The record as it is stored now. */
		record: () => structuredClone(record),
		store,
	};
}
