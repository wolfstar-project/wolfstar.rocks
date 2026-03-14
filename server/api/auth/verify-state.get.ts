import { verifyOAuthState } from "#server/utils/oauth-state";
import { isSafeRedirectPath } from "#shared/utils/redirect";

/**
 * GET /api/auth/verify-state?state=<token>
 *
 * Verifies the signed OAuth CSRF state and returns the stored redirect URL.
 * Reads the nonce and redirect URL from httpOnly cookies set during OAuth
 * initiation, then clears both cookies regardless of outcome.
 *
 * Returns { redirectUrl } on success, or 400 on invalid/missing state.
 */
export default defineEventHandler(async (event) => {
	const { state } = getQuery(event);
	const nonce = getCookie(event, "oauth_nonce");
	const storedRedirectUrl = getCookie(event, "oauth_redirect");

	// Always clear cookies after one use to prevent replay attacks
	deleteCookie(event, "oauth_nonce", { path: "/" });
	deleteCookie(event, "oauth_redirect", { path: "/" });

	if (!state || typeof state !== "string" || !nonce || !storedRedirectUrl) {
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request",
			message: "State verification failed",
		});
	}

	const isValid = await verifyOAuthState(state, nonce, storedRedirectUrl);

	if (!isValid) {
		throw createError({
			statusCode: 400,
			statusMessage: "Bad Request",
			message: "State verification failed",
		});
	}

	// Re-validate the URL one final time (defence-in-depth against cookie tampering)
	const redirectUrl = isSafeRedirectPath(storedRedirectUrl) ? storedRedirectUrl : "/";

	return { redirectUrl };
});
