import type { APIUser, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { H3Event } from "h3";
import type { NuxtError } from "nuxt/app";
import { createOAuthState } from "#server/utils/oauth-state";
import { isSafeRedirectPath } from "#shared/utils/redirect";
import { createError, useLogger } from "evlog";

export default defineWrappedResponseHandler(
	async (event) => {
		const query = getQuery(event);
		const log = useLogger(event);

		const authorizationParams: Record<string, string> = { prompt: "none" };

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
		}

		const oauthHandler = defineOAuthDiscordEventHandler({
			config: {
				authorizationParams,
				scope: ["guilds.members.read"],
			},

			async onError(_event: H3Event, error: NuxtError) {
				log.error("Discord OAuth error");
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
					},
				});

				log.set({ user: { id: user.id, username: user.username } });
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
