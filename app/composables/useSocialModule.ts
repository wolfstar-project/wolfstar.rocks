import type {
	SocialEditBody,
	SocialErrorCode,
	SocialState,
	SocialSubscription,
	SocialSubscriptionBody,
	SocialTwitchBody,
	SocialTwitchSubscription,
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
			$fetch<{ enabled: boolean }>(base.value, {
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
			$fetch<{ subscriptions: SocialSubscription[] | null }>(`${base.value}/subscriptions`, {
				body,
				method: "POST",
			}),
		);
		if (!result.ok) return result;

		showSubscriptions(requestGuildId, result.value.subscriptions);
		return { ok: true, value: undefined };
	}

	/**
	 * Moves a subscription to another channel or changes its message. One that is gone answers
	 * `subscription-not-found`, and the list is read again so the page stops showing it.
	 */
	async function editSubscription(
		subscription: Pick<SocialSubscription, "channelId" | "sourceId">,
		body: SocialEditBody,
	): Promise<SocialResult> {
		const requestGuildId = id.value;
		const { channelId, sourceId } = subscription;
		const result = await run(() =>
			$fetch<{ subscriptions: SocialSubscription[] | null }>(
				`${base.value}/subscriptions/${channelId}/${sourceId}`,
				{ body, method: "PATCH" },
			),
		);

		if (result.ok) {
			showSubscriptions(requestGuildId, result.value.subscriptions);
			return { ok: true, value: undefined };
		}
		if (result.code === "subscription-not-found") showSubscriptions(requestGuildId, null);
		return result;
	}

	/** Stops a channel following an account or a feed. One that is already gone is as removed. */
	async function removeSubscription(
		subscription: Pick<SocialSubscription, "channelId" | "sourceId">,
	): Promise<SocialResult> {
		const requestGuildId = id.value;
		const { channelId, sourceId } = subscription;
		const result = await run(() =>
			$fetch<{ subscriptions: SocialSubscription[] | null }>(
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

	/** Shows the Twitch live list a write answered with, or reads it again when there is none. */
	function showTwitch(requestGuildId: string | null, twitch: SocialTwitchSubscription[] | null) {
		if (twitch) patchState(requestGuildId, { twitch });
		else if (id.value === requestGuildId) void asyncData.refresh();
	}

	/** Notifies a channel when a streamer goes live or offline. */
	async function addTwitch(body: SocialTwitchBody): Promise<SocialResult> {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<{ twitch: SocialTwitchSubscription[] | null }>(`${base.value}/twitch`, {
				body,
				method: "POST",
			}),
		);
		if (!result.ok) return result;

		showTwitch(requestGuildId, result.value.twitch);
		return { ok: true, value: undefined };
	}

	/** Moves a Twitch live notification to another channel or changes its message. */
	async function editTwitch(
		subscription: Pick<SocialTwitchSubscription, "channelId"> & { subscriptionId: string },
		body: SocialEditBody,
	): Promise<SocialResult> {
		const requestGuildId = id.value;
		const { channelId, subscriptionId } = subscription;
		const result = await run(() =>
			$fetch<{ twitch: SocialTwitchSubscription[] | null }>(
				`${base.value}/twitch/${channelId}/${subscriptionId}`,
				{ body, method: "PATCH" },
			),
		);

		if (result.ok) {
			showTwitch(requestGuildId, result.value.twitch);
			return { ok: true, value: undefined };
		}
		if (result.code === "subscription-not-found") showTwitch(requestGuildId, null);
		return result;
	}

	/** Stops a channel's Twitch live notification. One that is already gone is as removed. */
	async function removeTwitch(
		subscription: Pick<SocialTwitchSubscription, "channelId"> & { subscriptionId: string },
	): Promise<SocialResult> {
		const requestGuildId = id.value;
		const { channelId, subscriptionId } = subscription;
		const result = await run(() =>
			$fetch<{ twitch: SocialTwitchSubscription[] | null }>(
				`${base.value}/twitch/${channelId}/${subscriptionId}`,
				{ method: "DELETE" },
			),
		);

		if (result.ok) {
			showTwitch(requestGuildId, result.value.twitch);
			return { ok: true, value: undefined };
		}
		if (result.code === "subscription-not-found" && state.value) {
			patchState(requestGuildId, {
				twitch: state.value.twitch.filter(
					(entry) =>
						entry.channelId !== channelId || entry.subscriptionId !== subscriptionId,
				),
			});
		}
		return result;
	}

	return {
		addSubscription,
		addTwitch,
		editSubscription,
		editTwitch,
		refresh: asyncData.refresh,
		removeSubscription,
		removeTwitch,
		setEnabled,
		state,
		status,
	};
}
