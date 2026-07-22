import {
	BOT_OAUTH_NEXT_STORAGE_KEY,
	buildBotDiscordAuthorizeUrl,
	resolveBotOauthRedirectUri,
	type BotOauthPrompt,
} from "#shared/utils/bot-oauth";

/**
 * Sapphire-plugin-api OAuth helpers (legacy dashboard auth).
 *
 * The browser POSTs Discord's authorization `code` to
 * `${NUXT_PUBLIC_API_BASE_URL}/oauth/callback` with `credentials: "include"`
 * so the bot can Set-Cookie `SAPPHIRE_AUTH` on the API origin.
 */
export function useBotOauth() {
	const runtimeConfig = useRuntimeConfig();
	const apiBaseUrl = computed(() =>
		String(runtimeConfig.public.apiBaseUrl || "").replace(/\/$/, ""),
	);

	function getRedirectUri(): string {
		if (import.meta.client) {
			return resolveBotOauthRedirectUri(window.location.origin);
		}
		return resolveBotOauthRedirectUri(useRequestURL().origin);
	}

	function buildAuthorizeUrl(prompt: BotOauthPrompt = "none"): string {
		const clientId = runtimeConfig.public.clientId;
		if (!clientId) {
			throw new Error("Discord client id is not configured");
		}
		return buildBotDiscordAuthorizeUrl({
			clientId: String(clientId),
			prompt,
			redirectUri: getRedirectUri(),
		});
	}

	function rememberNext(next: string) {
		if (!import.meta.client) {
			return;
		}
		sessionStorage.setItem(BOT_OAUTH_NEXT_STORAGE_KEY, next);
	}

	function consumeNext(fallback = "/"): string {
		if (!import.meta.client) {
			return fallback;
		}
		const stored = sessionStorage.getItem(BOT_OAUTH_NEXT_STORAGE_KEY);
		sessionStorage.removeItem(BOT_OAUTH_NEXT_STORAGE_KEY);
		return stored && isSafeRedirectPath(stored) ? stored : fallback;
	}

	function peekNext(): string | null {
		if (!import.meta.client) {
			return null;
		}
		return sessionStorage.getItem(BOT_OAUTH_NEXT_STORAGE_KEY);
	}

	/**
	 * Exchange the Discord OAuth code with the bot API. The response Set-Cookie
	 * attaches `SAPPHIRE_AUTH` to the API origin (e.g. localhost:8282).
	 */
	async function completeBotOauthCallback(code: string) {
		const base = apiBaseUrl.value;
		if (!base) {
			throw new Error("Bot API base URL is not configured");
		}
		const clientId = runtimeConfig.public.clientId;
		if (!clientId) {
			throw new Error("Discord client id is not configured");
		}

		return await $fetch(`${base}/oauth/callback`, {
			body: {
				clientId: String(clientId),
				code,
				redirectUri: getRedirectUri(),
			},
			credentials: "include",
			method: "POST",
		});
	}

	/** True when the browser already has a valid sapphire session cookie. */
	async function hasBotSession(): Promise<boolean> {
		const base = apiBaseUrl.value;
		if (!base) {
			return false;
		}
		try {
			await $fetch(`${base}/users/@me`, {
				credentials: "include",
				method: "GET",
			});
			return true;
		} catch {
			return false;
		}
	}

	/** Clear the sapphire cookie on the bot API origin. */
	async function logoutBotOauth() {
		const base = apiBaseUrl.value;
		if (!base) {
			return;
		}
		try {
			await $fetch(`${base}/oauth/logout`, {
				credentials: "include",
				method: "POST",
			});
		} catch {
			// Best-effort: dashboard sign-out should still clear better-auth.
		}
	}

	return {
		apiBaseUrl,
		buildAuthorizeUrl,
		completeBotOauthCallback,
		consumeNext,
		hasBotSession,
		logoutBotOauth,
		peekNext,
		rememberNext,
	};
}
