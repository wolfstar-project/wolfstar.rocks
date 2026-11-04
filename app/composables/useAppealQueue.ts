import type {
	AppealDecision,
	AppealFailureCode,
	AppealQueueFilter,
	AppealQueueResponse,
	AppealRequestOutcome,
	AppealStatus,
} from "#shared/utils/appeal-queue";
import type { MaybeRefOrGetter } from "vue";

/** What the decision routes answer with when they refuse a request, besides what the bot writes when it cannot do one. */
export type AppealDecisionErrorCode = AppealFailureCode | "unknown" | "invalid" | "generic";

export type AppealDecisionResult =
	/** `done` when the bot did it, `timeout` when it had not answered when the polling stopped. */
	{ ok: true; state: "done" | "timeout" } | { ok: false; code: AppealDecisionErrorCode };

/** How a decision waits for the bot: how often it asks, how long it asks, and how it waits. */
export interface AppealQueuePolling {
	/** In milliseconds. */
	interval?: number;
	/** In milliseconds. */
	timeout?: number;
	wait?: (milliseconds: number) => Promise<void>;
}

const ROUTE_ERROR_CODES = new Set<string>(["unknown", "decided", "noAccess", "invalid"]);

function readErrorCode(error: unknown): AppealDecisionErrorCode {
	// The routes put their code in the `data` of the error they throw, which
	// ofetch exposes as the `data.data` of the `FetchError`.
	const data = (error as { data?: { data?: { code?: unknown } } } | null)?.data?.data;
	const code = data?.code;
	return typeof code === "string" && ROUTE_ERROR_CODES.has(code)
		? (code as AppealDecisionErrorCode)
		: "generic";
}

/** An answer of the queue, with the guild and filter it is of. */
interface AppealQueueSnapshot {
	response: AppealQueueResponse;
	scope: string;
}

const EMPTY_COUNTS: Record<AppealStatus, number> = { accepted: 0, denied: 0, pending: 0 };

/**
 * The appeals of a guild for the review queue, newest first, and the call that
 * decides one.
 *
 * A decision is not made here or by the dashboard's server: the server asks the
 * bot, which does it and marks the request done, or with why it could not. So
 * `decide` asks again every second until the bot has answered, and the list is
 * fetched again whatever the answer was.
 *
 * Rows already on the screen stay while the next page of the same filter
 * loads; a change of filter or of guild starts from nothing.
 */
export function useAppealQueue(
	{
		guildId,
		filter,
		limit,
	}: {
		guildId: MaybeRefOrGetter<string | null | undefined>;
		filter: MaybeRefOrGetter<AppealQueueFilter>;
		limit: MaybeRefOrGetter<number>;
	},
	{
		interval = 1000,
		timeout = 20_000,
		wait = (milliseconds: number) =>
			new Promise<void>((resolve) => {
				setTimeout(resolve, milliseconds);
			}),
	}: AppealQueuePolling = {},
) {
	const id = computed(() => toValue(guildId) ?? null);
	const currentFilter = computed(() => toValue(filter));
	const currentLimit = computed(() => toValue(limit));

	// What an answer is for: a change of key keeps the answer of the last key on
	// `data` until the next arrives, so each answer says which guild and filter
	// it is of, and is only shown for those.
	const scope = computed(() => `${id.value ?? "none"}:${currentFilter.value}`);

	const asyncData = usePersistedAsyncData(
		() =>
			`guild:${id.value ?? "none"}:appeals:queue:${currentFilter.value}:${currentLimit.value}`,
		async (): Promise<AppealQueueSnapshot | undefined> => {
			const requested = scope.value;
			if (!id.value) return undefined;
			const response = await $fetch<AppealQueueResponse>(`/api/guilds/${id.value}/appeals`, {
				query: { limit: currentLimit.value, status: currentFilter.value },
			});
			return { response, scope: requested };
		},
		{ watch: [id, currentFilter, currentLimit] },
	);

	// The last answer of this guild and filter, kept in case the cache gives none.
	const held = shallowRef<AppealQueueSnapshot | null>(null);
	watch(asyncData.data, (value) => {
		if (value) held.value = value;
	});

	const response = computed<AppealQueueResponse | null>(() => {
		const current = asyncData.data.value;
		if (current?.scope === scope.value) return current.response;
		return held.value?.scope === scope.value ? held.value.response : null;
	});

	const entries = computed(() => response.value?.entries ?? []);
	const total = computed(() => response.value?.total ?? 0);
	const counts = computed(() => response.value?.counts ?? EMPTY_COUNTS);
	const canReview = computed(() => response.value?.canReview ?? false);

	/** The appeal whose decision is being made or waited for. */
	const busyId = ref<string | null>(null);

	async function readRequest(
		guild: string,
		requestId: string,
	): Promise<AppealRequestOutcome | null> {
		try {
			return await $fetch<AppealRequestOutcome>(
				`/api/guilds/${guild}/appeals/requests/${requestId}`,
			);
		} catch {
			return null;
		}
	}

	/** Asks for the request until the bot has done it, or refused it, or the time is up. */
	async function settle(guild: string, requestId: string): Promise<AppealDecisionResult> {
		for (let elapsed = interval; elapsed <= timeout; elapsed += interval) {
			await wait(interval);
			const outcome = await readRequest(guild, requestId);
			if (outcome === null) return { ok: false, code: "generic" };
			if (outcome.state === "done") return { ok: true, state: "done" };
			if (outcome.state === "failed") return { ok: false, code: outcome.code ?? "failed" };
		}
		return { ok: true, state: "timeout" };
	}

	/**
	 * Asks the bot to accept or deny an appeal, and waits for it.
	 *
	 * @param reason - What the member reads in the direct message; none when blank.
	 */
	async function decide(
		appealId: string,
		decision: AppealDecision,
		reason = "",
	): Promise<AppealDecisionResult> {
		const guild = id.value;
		if (!guild) return { ok: false, code: "generic" };

		busyId.value = appealId;
		try {
			const trimmed = reason.trim();
			const body = trimmed ? { decision, reason: trimmed } : { decision };
			let result: AppealDecisionResult;
			try {
				const { requestId } = await $fetch<{ requestId: string }>(
					`/api/guilds/${guild}/appeals/${appealId}/decision`,
					{ body, method: "POST" },
				);
				result = await settle(guild, requestId);
			} catch (error) {
				result = { ok: false, code: readErrorCode(error) };
			}
			// Whatever the answer, the list may be out of date: another moderator
			// decided it, the bot did, or the bot has not yet.
			await asyncData.refresh();
			return result;
		} finally {
			busyId.value = null;
		}
	}

	return {
		busyId,
		canReview,
		counts,
		decide,
		entries,
		error: asyncData.error,
		refresh: asyncData.refresh,
		status: asyncData.status,
		total,
	};
}
