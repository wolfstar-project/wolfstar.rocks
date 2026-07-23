import { isBotOauthState } from "#shared/utils/bot-oauth";

const AUTH_CALLBACK_PATH = "/api/auth/callback/discord";

/**
 * Returns the Better Auth callback URL only for a response sent by the OAuth
 * provider with Better Auth CSRF state. Sapphire bot-oauth hops use a
 * `ws_next.*` state (post-login path) and must fall through to the Vue page.
 * Browser navigations after Better Auth completes have no state and also fall
 * through.
 */
export function resolveOAuthProviderCallbackRedirect(query: URLSearchParams): string | null {
	const state = query.get("state");
	if (!state || isBotOauthState(state)) {
		return null;
	}
	return `${AUTH_CALLBACK_PATH}?${query.toString()}`;
}
