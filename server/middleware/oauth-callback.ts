import { resolveOAuthProviderCallbackRedirect } from "#server/utils/oauth-callback";

export default defineEventHandler((event) => {
	const requestURL = getRequestURL(event);
	if (requestURL.pathname !== "/oauth/callback") {
		return;
	}

	const redirectURL = resolveOAuthProviderCallbackRedirect(requestURL.searchParams);
	if (redirectURL) {
		return sendRedirect(event, redirectURL);
	}
});
