import { verifyOAuthState } from "#server/utils/oauth-state";
import { oauthStateInvalid } from "#shared/audit/actions";
import { isSafeRedirectPath } from "#shared/utils/redirect";
import { createError, useLogger, withAuditMethods } from "evlog";

/**
 * GET /api/auth/verify-state?state=<token>
 *
 * Verifies the signed OAuth CSRF state and returns the stored redirect URL.
 * Reads the nonce and redirect URL from httpOnly cookies set during OAuth
 * initiation, then clears both cookies regardless of outcome.
 *
 * Returns { redirectUrl } on success, or 400 on invalid/missing state.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const log = withAuditMethods(useLogger(event));
		const { state } = getQuery(event);
		const nonce = getCookie(event, "oauth_nonce");
		const storedRedirectUrl = getCookie(event, "oauth_redirect");

		// Always clear cookies after one use to prevent replay attacks
		deleteCookie(event, "oauth_nonce", { path: "/" });
		deleteCookie(event, "oauth_redirect", { path: "/" });

		if (!state || typeof state !== "string" || !nonce || !storedRedirectUrl) {
			log.audit(
				oauthStateInvalid({
					actor: { type: "system", id: "oauth-flow" },
					outcome: "denied",
					reason: "missing-fields",
				}),
			);
			throw createError({
				message: "State verification failed",
				status: 400,
				why: "Required parameters (state, nonce, or redirect URL) are missing or invalid",
				fix: "Restart the login flow from the beginning",
			});
		}

		const result = await verifyOAuthState(state, nonce, storedRedirectUrl);

		if (!result.valid) {
			log.audit(
				oauthStateInvalid({
					actor: { type: "system", id: "oauth-flow" },
					outcome: "denied",
					reason: result.reason,
				}),
			);
			throw createError({
				message: "State verification failed",
				status: 400,
				why: "The OAuth state signature is invalid or has expired",
				fix: "Restart the login flow from the beginning",
			});
		}

		// Re-validate the URL one final time (defence-in-depth against cookie tampering)
		const redirectUrl = isSafeRedirectPath(storedRedirectUrl) ? storedRedirectUrl : "/";

		return { redirectUrl };
	},
	{
		auth: false,
		rateLimit: { enabled: true, limit: 5, window: seconds(10) },
	},
);
