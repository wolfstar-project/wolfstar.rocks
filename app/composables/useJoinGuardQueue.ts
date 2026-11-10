import type { MaybeRefOrGetter } from "vue";

/** Why the website could not even write a request, before the bot saw it. */
export type JoinGuardRequestRefusal = "notWaiting" | "unknown" | "invalid" | "generic";

/** Where a request of a row stands, while it is sent and once it ended. */
export type JoinGuardRowRequest = { kind: "Verify" | "Kick" } & (
	| { state: "sending" }
	| JoinGuardActionResult
);

/** How a request ended, or why it was never written. */
export type JoinGuardActionResult =
	| JoinGuardRequestOutcome
	| { state: "refused"; code: JoinGuardRequestRefusal };

const REFUSAL_CODES = new Set<string>(["notWaiting", "unknown", "invalid"]);

function readRefusal(error: unknown): JoinGuardRequestRefusal {
	const code = readJoinGuardRouteCode(error);
	return code !== null && REFUSAL_CODES.has(code) ? (code as JoinGuardRequestRefusal) : "generic";
}

const EMPTY_COUNTS: Record<JoinGuardQueueFilter, number> = {
	all: 0,
	Banned: 0,
	Kicked: 0,
	Verified: 0,
	Waiting: 0,
};

interface QueueSnapshot {
	page: JoinGuardQueuePage;
	scope: string;
}

/**
 * The checkpoint queue of a guild: the members the guard stopped in the last
 * seven days, newest first, a page at a time, and the requests a moderator
 * writes for the bot from it.
 *
 * The website never verifies or kicks anyone itself: it writes a request the
 * bot acts on, then asks for it until the bot marks it done or says why it
 * could not, backing off between the looks. Each row keeps where its request
 * stands, so it shows "Sending…" and then the bot's answer.
 */
export function useJoinGuardQueue(
	{
		guildId,
		filter,
	}: {
		guildId: MaybeRefOrGetter<string | null | undefined>;
		filter: MaybeRefOrGetter<JoinGuardQueueFilter>;
	},
	polling: JoinGuardPolling = {},
) {
	const id = computed(() => toValue(guildId) ?? null);
	const currentFilter = computed(() => toValue(filter));
	// An answer says which guild and filter it is of, as the key's change keeps
	// the last answer on `data` until the next one arrives.
	const scope = computed(() => `${id.value ?? "none"}:${currentFilter.value}`);

	const asyncData = usePersistedAsyncData(
		() => `guild:${id.value ?? "none"}:joinguard:queue:${currentFilter.value}`,
		async (): Promise<QueueSnapshot | undefined> => {
			const requested = scope.value;
			if (!id.value) return undefined;
			const page = await $fetch<JoinGuardQueuePage>(
				`/api/guilds/${id.value}/joinguard/checkpoints`,
				{ query: { status: currentFilter.value } },
			);
			return { page, scope: requested };
		},
		{ watch: [id, currentFilter] },
	);

	const firstPage = computed<JoinGuardQueuePage | null>(() => {
		const current = asyncData.data.value;
		return current?.scope === scope.value ? current.page : null;
	});

	// The pages after the first, loaded one by one; a new first page drops them.
	const laterEntries = shallowRef<JoinGuardQueueEntry[]>([]);
	const laterCursor = ref<string | null | undefined>(undefined);
	const loadingMore = ref(false);
	watch([scope, () => asyncData.data.value], () => {
		laterEntries.value = [];
		laterCursor.value = undefined;
	});

	const entries = computed(() => {
		const first = firstPage.value?.entries ?? [];
		const seen = new Set(first.map((entry) => entry.id));
		return [...first, ...laterEntries.value.filter((entry) => !seen.has(entry.id))];
	});
	const nextCursor = computed(() =>
		laterCursor.value === undefined ? (firstPage.value?.nextCursor ?? null) : laterCursor.value,
	);
	const counts = computed(() => firstPage.value?.counts ?? EMPTY_COUNTS);
	const waiting = computed(() => firstPage.value?.waiting ?? 0);

	async function loadMore() {
		const cursor = nextCursor.value;
		const guild = id.value;
		if (!cursor || !guild || loadingMore.value) return;
		const requested = scope.value;
		loadingMore.value = true;
		try {
			const page = await $fetch<JoinGuardQueuePage>(
				`/api/guilds/${guild}/joinguard/checkpoints`,
				{ query: { cursor, status: currentFilter.value } },
			);
			if (scope.value !== requested) return;
			laterEntries.value = [...laterEntries.value, ...page.entries];
			laterCursor.value = page.nextCursor;
		} finally {
			loadingMore.value = false;
		}
	}

	/** Where the request of each row stands, by the row's id. */
	const rowRequests = ref<Record<string, JoinGuardRowRequest>>({});

	function readRequest(guild: string, requestId: string) {
		return () =>
			$fetch<JoinGuardRequestState>(`/api/guilds/${guild}/joinguard/requests/${requestId}`);
	}

	/** Writes a request for the bot and waits until it is done, refused, or too long. */
	async function send(body: JoinGuardModeratorRequestBody): Promise<JoinGuardActionResult> {
		const guild = id.value;
		if (!guild) return { code: "generic", state: "refused" };
		let requestId: string;
		try {
			({ id: requestId } = await $fetch<{ id: string }>(
				`/api/guilds/${guild}/joinguard/requests`,
				{ body, method: "POST" },
			));
		} catch (error) {
			return { code: readRefusal(error), state: "refused" };
		}
		return settleJoinGuardRequest(readRequest(guild, requestId), polling);
	}

	/**
	 * Asks the bot to verify or kick a member who waits, and waits for it. The
	 * list is read again afterwards, whatever the answer: the row may have
	 * moved on, by this request or another.
	 */
	async function act(
		checkpointId: string,
		kind: "Verify" | "Kick",
		reason = "",
	): Promise<JoinGuardActionResult> {
		if (rowRequests.value[checkpointId]?.state === "sending") {
			return { code: "generic", state: "refused" };
		}
		rowRequests.value = { ...rowRequests.value, [checkpointId]: { kind, state: "sending" } };
		const trimmed = reason.trim();
		const body: JoinGuardModeratorRequestBody =
			kind === "Verify"
				? { checkpointId, kind }
				: trimmed
					? { checkpointId, kind, reason: trimmed }
					: { checkpointId, kind };
		const result = await send(body);
		rowRequests.value = { ...rowRequests.value, [checkpointId]: { ...result, kind } };
		await asyncData.refresh();
		return result;
	}

	/** Asks the bot to post the checkpoint's button in its channel. */
	const postingButton = ref(false);
	async function postButton(): Promise<JoinGuardActionResult> {
		postingButton.value = true;
		try {
			return await send({ kind: "PostButton" });
		} finally {
			postingButton.value = false;
		}
	}

	return {
		act,
		counts,
		entries,
		error: asyncData.error,
		hasMore: computed(() => nextCursor.value !== null),
		loadMore,
		loadingMore,
		postButton,
		postingButton,
		refresh: asyncData.refresh,
		rowRequests,
		status: asyncData.status,
		waiting,
	};
}
