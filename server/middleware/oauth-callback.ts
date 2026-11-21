import {
	OAUTH_PROVIDER_CALLBACK_PATH,
	resolveOAuthProviderCallbackRedirect,
} from "#server/utils/oauth-callback";

/**
 * Hands Discord's OAuth response over to Better Auth.
 *
 * The Discord application is registered against `/oauth/callback`, which is an
 * app page, not a Better Auth route. This middleware forwards the provider's
 * response (query carrying `state` plus `code`/`error`) to
 * `/api/auth/callback/discord`; Better Auth then validates the state, exchanges
 * the code, sets the session cookie, and redirects back to the same page with
 * `?next=` so the Vue page can show the result.
 */
export default defineEventHandler((event) => {
	const requestURL = getRequestURL(event);
	if (requestURL.pathname !== OAUTH_PROVIDER_CALLBACK_PATH) {
		return;
	}

	const redirectURL = resolveOAuthProviderCallbackRedirect(requestURL.searchParams);
	if (redirectURL) {
		return sendRedirect(event, redirectURL);
	}
});
