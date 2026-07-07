import type { APIUser, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { H3Event } from "h3";
import type { NuxtError } from "nuxt/app";
import { invalidateCurrentUserCache } from "#server/utils/discord/cache";
import { createOAuthState, verifyOAuthState } from "#server/utils/oauth-state";
import { oauthStateInvalid, userLogin } from "#shared/audit/actions";
import { isSafeRedirectPath } from "#shared/utils/redirect";
import { createError, useLogger, withAuditMethods } from "evlog";

/**
 * Verifies the OAuth CSRF state on the callback request and throws a 400 when
 * it is missing or invalid.
 *
 * This MUST run before the authorization code is exchanged and the session is
 * created: once `setUserSession` authenticates the browser the mutation cannot
 * be undone, so an invalid state has to fail the request before that point.
 * The nonce + redirect cookies are intentionally left in place so the later
 * `/api/auth/verify-state` call can consume them to resolve the redirect URL.
 */
async function assertValidOAuthState(event: H3Event): Promise<void> {
	const log = withAuditMethods(useLogger(event));
	const { state } = getQuery(event);
	const nonce = getCookie(event, "oauth_nonce");
	const storedRedirectUrl = getCookie(event, "oauth_redirect");

	if (typeof state !== "string" || !nonce || !storedRedirectUrl) {
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
}

export default defineWrappedResponseHandler(
	async (event) => {
		const query = getQuery(event);
		const log = withAuditMethods(useLogger(event));

		const authorizationParams: Record<string, string> = { prompt: "none" };

		if (query.code) {
			// OAuth callback: verify the CSRF state before the code is exchanged
			// and a session is created (see assertValidOAuthState). The nonce +
			// redirect cookies set during initiation are reused here.
			await assertValidOAuthState(event);
		} else {
			// OAuth initiation (no code present): generate state + cookies. We must
			// NOT overwrite the nonce/redirect cookies on the later code-exchange
			// request, which is why this only runs during initiation.
			const nextUrl = query.next as string | undefined;

			// Validate next URL — fall back to "/" if unsafe (prevents open redirect)
			const safeRedirectUrl = nextUrl && isSafeRedirectPath(nextUrl) ? nextUrl : "/";

			// Generate signed state + nonce for CSRF protection
			const { state, nonce } = await createOAuthState(safeRedirectUrl);
			authorizationParams.state = state;

			// Set nonce in httpOnly cookie for CSRF verification on callback
			setCookie(event, "oauth_nonce", nonce, {
				httpOnly: true,
				secure: true,
				sameSite: "none", // Must be "none" so it's sent in cross-site redirect
				maxAge: 5 * 60, // 5 minutes (matches state TTL)
				path: "/",
			});

			// Store redirect URL separately — not embedded in state, but HMAC-bound
			setCookie(event, "oauth_redirect", safeRedirectUrl, {
				httpOnly: true,
				secure: true,
				sameSite: "none",
				maxAge: 5 * 60,
				path: "/",
			});
		}

		const oauthHandler = defineOAuthDiscordEventHandler({
			config: {
				authorizationParams,
				scope: ["guilds.members.read", "email"],
			},

			async onError(_event: H3Event, error: NuxtError) {
				log.error("Discord OAuth error", { error });
				throw createError({
					message: "Failed to authenticate with Discord. Please try again.",
					status: 500,
					why: "Failed to exchange authorization code for tokens or fetch user data from Discord",
					cause: error,
				});
			},

			async onSuccess(
				event: H3Event,
				{
					user,
					tokens,
				}: {
					user: APIUser;
					tokens: RESTPostOAuth2AccessTokenResult;
				},
			) {
				await setUserSession(event, {
					loggedInAt: Date.now(),
					secure: {
						tokens,
					},
					user: {
						avatar: user.avatar ?? null,
						globalName: user.global_name,
						id: user.id,
						name: user.global_name ?? user.username,
						username: user.username,
						email: user.email ?? null,
					},
				});

				const cacheInvalidation = invalidateCurrentUserCache(user.id).catch((error) => {
					log.error("Failed to invalidate current user cache after login", {
						error,
						userId: user.id,
					});
				});
				event.waitUntil?.(cacheInvalidation);

				log.set({ user: { id: user.id, username: user.username } });
				log.audit(
					userLogin({
						actor: { type: "user", id: user.id, displayName: user.username },
						outcome: "success",
					}),
				);
				log.info("User authenticated with Discord");
			},
		});

		return oauthHandler(event);
	},
	{
		auth: false,
		rateLimit: { enabled: true, limit: 3, window: seconds(10) },
	},
);
