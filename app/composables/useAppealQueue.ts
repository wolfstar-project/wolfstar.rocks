import type { MaybeRefOrGetter } from "vue";

/** What the decision routes answer with when they refuse a request, besides what the bot writes when it cannot do one. */
export type AppealDecisionErrorCode = AppealFailureCode | "unknown" | "invalid" | "generic";

export type AppealDecisionResult =
	/** `done` when the bot did it, `timeout` when it had not answered when the polling stopped. */
	{ ok: true; state: "done" | "timeout" } | { ok: false; code: AppealDecisionErrorCode };

/** A decision the bot answered after `decide` had stopped waiting, so had answered `timeout`. */
export type AppealLateResult = Exclude<AppealDecisionResult, { state: "timeout" }>;

/** How a decision waits for the bot: how often it asks, how long it asks, and how it waits. */
export interface AppealQueuePolling {
	/** In milliseconds. */
	interval?: number;
	/** In milliseconds. */
	timeout?: number;
	/**
	 * How long a decision is still asked about, less and less often, once
	 * `decide` stopped waiting for it. In milliseconds.
	 */
	followFor?: number;
	/** The longest pause between two of those questions. In milliseconds. */
	maxFollowInterval?: number;
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

function readStatus(error: unknown): unknown {
	return (error as { statusCode?: unknown } | null)?.statusCode;
}

/**
 * What asking for a request told: its outcome, that the guild has no such
 * request (404), or nothing, when the question itself failed (the network, a
 * rate limit, the server) and says nothing of the bot.
 */
type RequestRead = AppealRequestOutcome | "gone" | null;

/** The answer a read of the request settles a decision with, `null` while it does not. */
function settledBy(read: RequestRead): AppealLateResult | null {
	if (read === "gone") return { ok: false, code: "unknown" };
	if (read === null || read.state === "pending") return null;
	return read.state === "done"
		? { ok: true, state: "done" }
		: { ok: false, code: read.code ?? "failed" };
}

/** An answer of the queue, with the guild and filter it is of. */
interface AppealQueueSnapshot {
	response: AppealQueueResponse;
	scope: string;
}

/** The rows read after the first page, with the guild and filter they are of. */
interface AppealQueueMore {
	scope: string;
	entries: AppealQueueEntry[];
	/** Whether the last page read came back short, so there is nothing after it. */
	exhausted: boolean;
}

const EMPTY_COUNTS: Record<AppealStatus, number> = { accepted: 0, denied: 0, pending: 0 };

/** The rows of several pages, each appeal once: a row that moved between two reads is on both. */
function uniqueEntries(entries: readonly AppealQueueEntry[]): AppealQueueEntry[] {
	const byId = new Map<string, AppealQueueEntry>();
	for (const entry of entries) if (!byId.has(entry.id)) byId.set(entry.id, entry);
	return [...byId.values()];
}

function sleep(milliseconds: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, milliseconds);
	});
}

/**
 * The appeals of a guild for the review queue, newest first, a page at a time,
 * and the call that decides one.
 *
 * The first page is fetched for the guild and filter; `loadMore` reads the
 * next one from where the rows end and adds it below them, however many there
 * are. A change of filter or of guild starts from nothing.
 *
 * A decision is not made here or by the dashboard's server: the server asks the
 * bot, which does it and marks the request done, or with why it could not. So
 * `decide` asks again every second until the bot has answered or `timeout`
 * passed, and the list is fetched again whatever the answer was. A decision
 * the bot had not answered by then is still asked about, less often, for
 * `followFor`; when the bot answers, the list is fetched again and
 * `onLateResult` is told how it went.
 */
export function useAppealQueue(
	{
		guildId,
		filter,
		onLateResult,
	}: {
		guildId: MaybeRefOrGetter<string | null | undefined>;
		filter: MaybeRefOrGetter<AppealQueueFilter>;
		onLateResult?: (result: AppealLateResult, decision: AppealDecision) => void;
	},
	{
		interval = 1000,
		timeout = 20_000,
		followFor = 10 * 60_000,
		maxFollowInterval = 30_000,
		wait = sleep,
	}: AppealQueuePolling = {},
) {
	const id = computed(() => toValue(guildId) ?? null);
	const currentFilter = computed(() => toValue(filter));

	// What an answer is for: a change of key keeps the answer of the last key on
	// `data` until the next arrives, so each answer says which guild and filter
	// it is of, and is only shown for those.
	const scope = computed(() => `${id.value ?? "none"}:${currentFilter.value}`);

	function fetchPage(guild: string, offset: number, limit: number) {
		return $fetch<AppealQueueResponse>(`/api/guilds/${guild}/appeals`, {
			query: { limit, offset, status: currentFilter.value },
		});
	}

	const asyncData = usePersistedAsyncData(
		() => `guild:${id.value ?? "none"}:appeals:queue:${currentFilter.value}`,
		async (): Promise<AppealQueueSnapshot | undefined> => {
			const requested = scope.value;
			if (!id.value) return undefined;
			const response = await fetchPage(id.value, 0, AppealQueuePageSize);
			return { response, scope: requested };
		},
		{ watch: [id, currentFilter] },
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

	const more = shallowRef<AppealQueueMore>({ scope: scope.value, entries: [], exhausted: false });
	const isLoadingMore = ref(false);
	/** Whether the last page asked for after the first could not be read. */
	const loadMoreFailed = ref(false);
	watch(scope, (value) => {
		more.value = { scope: value, entries: [], exhausted: false };
		loadMoreFailed.value = false;
	});
	const moreEntries = computed(() =>
		more.value.scope === scope.value ? more.value.entries : [],
	);

	const firstEntries = computed(() => response.value?.entries ?? []);
	const entries = computed(() => uniqueEntries([...firstEntries.value, ...moreEntries.value]));
	const total = computed(() => response.value?.total ?? 0);
	const counts = computed(() => response.value?.counts ?? EMPTY_COUNTS);
	const canReview = computed(() => response.value?.canReview ?? false);
	const hasMore = computed(
		() =>
			entries.value.length < total.value &&
			!(more.value.scope === scope.value && more.value.exhausted),
	);

	/** Counts the refreshes, so a page asked for before one is dropped. */
	let generation = 0;

	/** Reads the next page, from where the rows end, and adds it below them. */
	async function loadMore(): Promise<void> {
		const guild = id.value;
		const requested = scope.value;
		if (!guild || isLoadingMore.value || response.value === null) return;

		const kept = moreEntries.value;
		const started = generation;
		isLoadingMore.value = true;
		loadMoreFailed.value = false;
		try {
			const page = await fetchPage(
				guild,
				firstEntries.value.length + kept.length,
				AppealQueuePageSize,
			);
			// A refresh read the list again meanwhile: this page's offset no longer follows it.
			if (scope.value !== requested || generation !== started) return;
			more.value = {
				scope: requested,
				entries: [...kept, ...page.entries],
				exhausted: page.entries.length < AppealQueuePageSize,
			};
		} catch {
			if (scope.value === requested) loadMoreFailed.value = true;
		} finally {
			isLoadingMore.value = false;
		}
	}

	/** Reads `count` rows after the first page again, as many to a request as the API takes. */
	async function rereadMore(guild: string, count: number): Promise<AppealQueueMore["entries"]> {
		const rows: AppealQueueEntry[] = [];
		const end = AppealQueuePageSize + count;
		for (let offset = AppealQueuePageSize; offset < end; offset += MaximumAppealQueueLimit) {
			const limit = Math.min(MaximumAppealQueueLimit, end - offset);
			const page = await fetchPage(guild, offset, limit);
			rows.push(...page.entries);
			if (page.entries.length < limit) break;
		}
		return rows;
	}

	/** Fetches the first page again, then the rows read after it, so the list keeps its length. */
	async function refresh(): Promise<void> {
		const guild = id.value;
		const requested = scope.value;
		const count = moreEntries.value.length;
		generation += 1;
		await asyncData.refresh();
		// A page asked for while the first one was read again took the old
		// list's offset: dropped too, once the new first page is in.
		generation += 1;
		if (!guild || count === 0 || scope.value !== requested) return;
		try {
			const rows = await rereadMore(guild, count);
			if (scope.value !== requested) return;
			more.value = { scope: requested, entries: rows, exhausted: rows.length < count };
			loadMoreFailed.value = false;
		} catch {
			if (scope.value === requested) loadMoreFailed.value = true;
		}
	}

	/** The appeal whose decision is being made or waited for. */
	const busyId = ref<string | null>(null);

	async function readRequest(guild: string, requestId: string): Promise<RequestRead> {
		try {
			return await $fetch<AppealRequestOutcome>(
				`/api/guilds/${guild}/appeals/requests/${requestId}`,
			);
		} catch (error) {
			return readStatus(error) === 404 ? "gone" : null;
		}
	}

	/**
	 * Asks for the request until the bot has done it, or refused it, or the time
	 * is up. A question that failed says nothing of the bot, so it is asked again.
	 */
	async function settle(guild: string, requestId: string): Promise<AppealDecisionResult> {
		for (let elapsed = interval; elapsed <= timeout; elapsed += interval) {
			await wait(interval);
			const result = settledBy(await readRequest(guild, requestId));
			if (result) return result;
		}
		return { ok: true, state: "timeout" };
	}

	let isDisposed = false;
	if (getCurrentScope()) onScopeDispose(() => (isDisposed = true));

	/** Keeps asking for a request `settle` gave up on, less and less often, until the bot answers. */
	async function follow(guild: string, requestId: string, decision: AppealDecision) {
		let pause = Math.min(interval * 2, maxFollowInterval);
		let waited = 0;
		while (waited < followFor) {
			await wait(pause);
			waited += pause;
			if (isDisposed) return;
			const result = settledBy(await readRequest(guild, requestId));
			if (result) {
				if (id.value === guild) await refresh();
				onLateResult?.(result, decision);
				return;
			}
			pause = Math.min(pause * 2, maxFollowInterval);
		}
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
				if (result.ok && result.state === "timeout")
					void follow(guild, requestId, decision);
			} catch (error) {
				result = { ok: false, code: readErrorCode(error) };
			}
			// Whatever the answer, the list may be out of date: another moderator
			// decided it, the bot did, or the bot has not yet.
			await refresh();
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
		hasMore,
		isLoadingMore,
		loadMore,
		loadMoreFailed,
		refresh,
		status: asyncData.status,
		total,
	};
}
