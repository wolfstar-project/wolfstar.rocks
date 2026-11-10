import type { MaybeRefOrGetter } from "vue";

/** Why the page refused to pass the member before writing anything for the bot. */
export type JoinGuardPassRefusal =
	| "unavailable"
	| "notWaiting"
	| "sharedBan"
	| "trust"
	| "captcha"
	| "captchaUnavailable"
	| "rateLimited"
	| "generic";

/** Where the member's own verification stands on the page. */
export type JoinGuardPassState =
	| { state: "idle" }
	| { state: "sending" }
	| JoinGuardRequestOutcome
	| { state: "refused"; code: JoinGuardPassRefusal };

const REFUSAL_CODES = new Set<string>([
	"unavailable",
	"notWaiting",
	"sharedBan",
	"trust",
	"captcha",
	"captchaUnavailable",
]);

function readRefusal(error: unknown): JoinGuardPassRefusal {
	if (readJoinGuardRouteStatus(error) === 429) return "rateLimited";
	const code = readJoinGuardRouteCode(error);
	return code !== null && REFUSAL_CODES.has(code) ? (code as JoinGuardPassRefusal) : "generic";
}

/**
 * The verification page of a guild for whoever opens it: signed out, the
 * guild and what its page checks; signed in, where the member stands and how
 * much the account is trusted, and the call that passes the checkpoint.
 * Passing writes a `Pass` request the bot acts on, so the page asks for it
 * until the bot let the member in or said why not.
 */
export function useJoinGuardVerify(
	guildId: MaybeRefOrGetter<string>,
	polling: JoinGuardPolling = {},
) {
	const id = computed(() => toValue(guildId));
	// The page reads the session here, so it has one place that tells who opens it.
	const { loggedIn, ready } = useUserSession();
	const signedIn = computed(() => loggedIn.value);

	const asyncData = useLazyAsyncData(
		() => `verify:${id.value}:${signedIn.value ? "member" : "guest"}`,
		() => $fetch<JoinGuardVerifyResponse>(`/api/verify/${id.value}`),
		{ server: false, watch: [id, signedIn] },
	);

	/** The member's page, once the route answered for a signed-in member. */
	const page = computed<JoinGuardVerifyPage | null>(() => {
		const response = asyncData.data.value;
		return response && response.signedIn !== false ? response : null;
	});
	/** The guild and its checks, whoever asked. */
	const guest = computed<Pick<JoinGuardVerifyGuestPage, "guild" | "checks"> | null>(() => {
		const response = asyncData.data.value;
		return response ? { checks: response.checks, guild: response.guild } : null;
	});

	const pass = ref<JoinGuardPassState>({ state: "idle" });

	async function verify(turnstileToken: string | null): Promise<JoinGuardPassState> {
		const guild = id.value;
		pass.value = { state: "sending" };
		const body: JoinGuardVerifyBody = turnstileToken ? { turnstileToken } : {};
		let requestId: string;
		try {
			({ id: requestId } = await $fetch<{ id: string }>(`/api/verify/${guild}`, {
				body,
				method: "POST",
			}));
		} catch (error) {
			pass.value = { code: readRefusal(error), state: "refused" };
			// What keeps the account below the minimum, or where the member
			// stands, may have changed.
			void asyncData.refresh();
			return pass.value;
		}
		pass.value = await settleJoinGuardRequest(
			() => $fetch<JoinGuardRequestState>(`/api/verify/${guild}/requests/${requestId}`),
			polling,
		);
		if (pass.value.state === "done") void asyncData.refresh();
		return pass.value;
	}

	return {
		error: asyncData.error,
		guest,
		page,
		pass,
		ready: computed(() => ready.value),
		refresh: asyncData.refresh,
		signedIn,
		status: asyncData.status,
		verify,
	};
}
