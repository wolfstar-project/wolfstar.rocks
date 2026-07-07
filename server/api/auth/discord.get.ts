import type { APIUser, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { H3Event } from "h3";
import type { NuxtError } from "nuxt/app";
import { invalidateCurrentUserCache } from "#server/utils/discord/cache";
import { createOAuthState, verifyOAuthState } from "#server/utils/oauth-state";
import { oauthStateInvalid, userLogin } from "#shared/audit/actions";
import { isSafeRedirectPath } from "#shared/utils/redirect";
import { createError, useLogger, withAuditMethods } from "evlog";

export default defineWrappedResponseHandler(
	async (event) => {
		const query = getQuery(event);
		const log = withAuditMethods(useLogger(event));

		const authorizationParams: Record<string, string> = { prompt: "none" };

		// Redirect URL returned to the client after a successful code exchange.
		// Populated during the callback leg from the HMAC-bound cookie.
		let callbackRedirectUrl = "/";

		// Only generate state + cookies during OAuth initiation (no code present).
		// When callback.vue calls this endpoint again to exchange the code, we must
		// NOT overwrite the nonce/redirect cookies set during initiation.
		if (!query.code) {
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
		} else {
			// Callback leg: verify and consume the CSRF state BEFORE any code
			// exchange or session mutation. A failed state must never change
			// authentication state.
			const state = query.state;
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
			callbackRedirectUrl = isSafeRedirectPath(storedRedirectUrl) ? storedRedirectUrl : "/";
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

		// Initiation leg: the handler redirects the browser to Discord.
		if (!query.code) {
			return oauthHandler(event);
		}

		// Callback leg: run the code exchange (creates the session via
		// onSuccess), then give the client the safe destination from the
		// HMAC-bound cookie so no separate post-session state check is needed.
		await oauthHandler(event);
		return { redirectUrl: callbackRedirectUrl };
	},
	{
		auth: false,
		rateLimit: { enabled: true, limit: 3, window: seconds(10) },
	},
);
