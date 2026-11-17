import type {
	SocialErrorCode,
	SocialState,
	SocialSubscription,
	SocialSubscriptionBody,
} from "#shared/utils/social";
import type { MaybeRefOrGetter } from "vue";

export type SocialResult<Value = void> =
	| { ok: true; value: Value }
	| { ok: false; code: SocialErrorCode };

/**
 * Where the Social module of a server stands. `ready` is the only state with
 * something to configure: the others say why there is nothing.
 */
export type SocialModuleStatus =
	| { kind: "loading" }
	/** The dashboard could not reach Staryl, or has no secret for it. */
	| { kind: "unavailable" }
	/** Staryl is not in the server, so nothing it holds would be posted. */
	| { kind: "not-installed" }
	| { kind: "ready"; state: SocialState };

function readErrorCode(error: unknown): SocialErrorCode {
	// The routes put their code in the `data` of the error they throw, which
	// ofetch exposes as the `data.data` of the `FetchError`.
	const code = (error as { data?: { data?: { code?: unknown } } } | null)?.data?.data?.code;
	return isSocialErrorCode(code) ? code : "generic";
}

/**
 * The Social module of a server: Staryl's switch and subscriptions, and the
 * calls that change them.
 *
 * Staryl holds all of it, so none is a key of `GuildData` and none is staged:
 * each call writes at once, reports whether it went through, and patches the
 * state with what the server answered.
 */
export function useSocialModule(guildId: MaybeRefOrGetter<string | null | undefined>) {
	const id = computed(() => toValue(guildId) ?? null);
	const base = computed(() => `/api/guilds/${id.value}/social`);

	const asyncData = usePersistedAsyncData(
		() => `guild:${id.value ?? "none"}:social`,
		() => (id.value ? $fetch<SocialState>(base.value) : Promise.resolve(null)),
		{
			default: (): SocialState | null => null,
			watch: [id],
		},
	);

	const state = computed<SocialState | null>(() => asyncData.data.value ?? null);

	const status = computed<SocialModuleStatus>(() => {
		// A kept answer is shown while it is fetched again, and after a fetch that failed.
		if (state.value) {
			return state.value.installed
				? { kind: "ready", state: state.value }
				: { kind: "not-installed" };
		}
		return asyncData.error.value ? { kind: "unavailable" } : { kind: "loading" };
	});

	async function run<Value>(request: () => Promise<Value>): Promise<SocialResult<Value>> {
		try {
			return { ok: true, value: await request() };
		} catch (error) {
			return { code: readErrorCode(error), ok: false };
		}
	}

	/**
	 * Shows the list a write answered with. Staryl answers `null` when the write
	 * went through and it could not read the list after: the list is then read again.
	 */
	function showSubscriptions(
		requestGuildId: string | null,
		subscriptions: SocialSubscription[] | null,
	) {
		if (subscriptions) patchState(requestGuildId, { subscriptions });
		else if (id.value === requestGuildId) void asyncData.refresh();
	}

	/** Patches the state, unless the admin opened another server meanwhile. */
	function patchState(requestGuildId: string | null, patch: Partial<SocialState>) {
		if (id.value === requestGuildId && state.value) {
			void rereadAfterWrite(
				asyncData,
				{ ...state.value, ...patch },
				() => id.value === requestGuildId,
			);
		}
	}

	/** Turns the module on or off. Off keeps every subscription. */
	async function setEnabled(enabled: boolean): Promise<SocialResult<boolean>> {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<{ enabled: boolean }, string, "PATCH">(base.value, {
				body: { enabled },
				method: "PATCH",
			}),
		);
		if (!result.ok) return result;

		patchState(requestGuildId, { enabled: result.value.enabled });
		return { ok: true, value: result.value.enabled };
	}

	/** Follows an account or a feed in a channel. */
	async function addSubscription(body: SocialSubscriptionBody): Promise<SocialResult> {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<{ subscriptions: SocialSubscription[] | null }, string, "POST">(
				`${base.value}/subscriptions`,
				{ body, method: "POST" },
			),
		);
		if (!result.ok) return result;

		showSubscriptions(requestGuildId, result.value.subscriptions);
		return { ok: true, value: undefined };
	}

	/** Stops a channel following an account or a feed. One that is already gone is as removed. */
	async function removeSubscription(
		subscription: Pick<SocialSubscription, "channelId" | "sourceId">,
	): Promise<SocialResult> {
		const requestGuildId = id.value;
		const { channelId, sourceId } = subscription;
		const result = await run(() =>
			$fetch<{ subscriptions: SocialSubscription[] | null }, string, "DELETE">(
				`${base.value}/subscriptions/${channelId}/${sourceId}`,
				{ method: "DELETE" },
			),
		);

		if (result.ok) {
			showSubscriptions(requestGuildId, result.value.subscriptions);
			return { ok: true, value: undefined };
		}
		if (result.code === "subscription-not-found" && state.value) {
			patchState(requestGuildId, {
				subscriptions: state.value.subscriptions.filter(
					(entry) => entry.channelId !== channelId || entry.sourceId !== sourceId,
				),
			});
		}
		return result;
	}

	return {
		addSubscription,
		refresh: asyncData.refresh,
		removeSubscription,
		setEnabled,
		state,
		status,
	};
}
