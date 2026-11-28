import type {
	OnboardingSettingsBody,
	OnboardingStageCreateBody,
	OnboardingStageOrderBody,
	OnboardingStagePatchBody,
} from "#shared/schemas/onboarding";
import type { OnboardingStageInput, OnboardingState } from "#shared/utils/onboarding";
import type { MaybeRefOrGetter } from "vue";
import type { OnboardingWriteError } from "~/utils/onboarding";

export type OnboardingWriteResult =
	| { ok: true; value: OnboardingState }
	| { ok: false; error: OnboardingWriteError };

/**
 * The onboarding of a guild: its stages, its log channel, this week's counts
 * and what is blocked, and the calls that change it.
 *
 * The stages are rows of their own rather than keys of `GuildData`, so they do
 * not go through the staged-changes bar: each call writes at once. The server
 * answers every read and every write with the whole configuration, and the
 * page shows that answer.
 *
 * Every write sends the revision the page read. When another administrator, or
 * the bot's panel in Discord, changed the onboarding since, the server refuses
 * the write and `conflict` turns on until {@linkcode reload} reads it again.
 */
export function useOnboarding(guildId: MaybeRefOrGetter<string | null | undefined>) {
	const id = computed(() => toValue(guildId) ?? null);
	const base = computed(() => `/api/guilds/${id.value}/onboarding`);

	const asyncData = usePersistedAsyncData(
		() => `guild:${id.value ?? "none"}:onboarding`,
		async (): Promise<OnboardingState | null> => {
			if (!id.value) return null;
			return $fetch<OnboardingState>(base.value);
		},
		{
			default: (): OnboardingState | null => null,
			watch: [id],
		},
	);

	const state = computed(() => asyncData.data.value ?? null);
	const conflict = ref(false);

	// A conflict belongs to the guild it happened in.
	watch(id, () => {
		conflict.value = false;
	});

	function revision(): number {
		return state.value?.revision ?? 0;
	}

	/**
	 * Runs a write and shows its answer, unless another guild was opened while
	 * the request was in flight: the answer would land in its page.
	 */
	async function write(request: () => Promise<OnboardingState>): Promise<OnboardingWriteResult> {
		const requestGuildId = id.value;
		const stillShown = () => id.value === requestGuildId;
		try {
			const value = await request();
			if (stillShown()) void rereadAfterWrite(asyncData, value, stillShown);
			return { ok: true, value };
		} catch (caught) {
			const error = readOnboardingWriteError(caught);
			if (error.code === "conflict" && stillShown()) conflict.value = true;
			return { error, ok: false };
		}
	}

	// A write sends the revision the administrator saw. The editor passes the
	// one it opened on: the page may read again behind it, and the draft would
	// otherwise be sent with a revision it never saw.
	function createStage(stage: OnboardingStageInput, readRevision = revision()) {
		const body: OnboardingStageCreateBody = { revision: readRevision, stage };
		return write(() =>
			$fetch<OnboardingState>(`${base.value}/stages`, { body, method: "POST" }),
		);
	}

	function updateStage(
		stageId: string,
		stage: Partial<OnboardingStageInput>,
		readRevision = revision(),
	) {
		const body: OnboardingStagePatchBody = { revision: readRevision, stage };
		return write(() =>
			$fetch<OnboardingState>(`${base.value}/stages/${stageId}`, { body, method: "PATCH" }),
		);
	}

	function deleteStage(stageId: string, readRevision = revision()) {
		return write(() =>
			$fetch<OnboardingState>(`${base.value}/stages/${stageId}`, {
				method: "DELETE",
				query: { revision: readRevision },
			}),
		);
	}

	/** Puts the stages in a new order: every stage's ID, first to last. */
	function reorderStages(order: string[]) {
		const body: OnboardingStageOrderBody = { order, revision: revision() };
		return write(() =>
			$fetch<OnboardingState>(`${base.value}/stages/order`, { body, method: "PUT" }),
		);
	}

	function setLogChannel(logChannelId: string | null) {
		const body: OnboardingSettingsBody = { logChannelId, revision: revision() };
		return write(() => $fetch<OnboardingState>(base.value, { body, method: "PATCH" }));
	}

	/** Reads the onboarding again after a conflict, and ends the conflict when the read went through. */
	async function reload(): Promise<void> {
		await asyncData.refresh();
		if (!asyncData.error.value) conflict.value = false;
	}

	return {
		conflict: readonly(conflict),
		createStage,
		deleteStage,
		error: asyncData.error,
		refresh: asyncData.refresh,
		reload,
		reorderStages,
		setLogChannel,
		state,
		status: asyncData.status,
		updateStage,
	};
}

/** What the Onboarding section hands to its cards. */
export type OnboardingModule = ReturnType<typeof useOnboarding>;
