import type { APIUser, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { H3Event } from "h3";
import type { NuxtError } from "nuxt/app";
import { createOAuthState } from "#server/utils/oauth-state";
import { isSafeRedirectPath } from "#shared/utils/redirect";
import { createError, useLogger } from "evlog";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const log = useLogger(event);
	const nextUrl = query.next as string | undefined;

	// Validate next URL — fall back to "/" if unsafe (prevents open redirect)
	const safeRedirectUrl = nextUrl && isSafeRedirectPath(nextUrl) ? nextUrl : "/";

	// Generate signed state + nonce for CSRF protection
	const { state, nonce } = await createOAuthState(safeRedirectUrl);

	const authorizationParams: Record<string, string> = {
		prompt: "none",
		state,
	};

	// Create OAuth handler with dynamic state
	const oauthHandler = defineOAuthDiscordEventHandler({
		config: {
			authorizationParams,
			scope: ["guilds.members.read"],
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
				},
			});

			log.info("User authenticated with Discord", {
				userId: user.id,
				username: user.username,
			});
		},
	});

	// Set nonce in httpOnly cookie for CSRF verification on callback
	setCookie(event, "oauth_nonce", nonce, {
		httpOnly: true,
		secure: true,
		sameSite: "none", // Must be "none" so it's sent in cross-site redirect
		maxAge: 5 * 60, // 5 minutes (matches state TTL)
		path: "/",
	});

	return oauthHandler(event);
});
