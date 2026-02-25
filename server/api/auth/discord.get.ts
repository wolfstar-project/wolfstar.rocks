/* oxlint-disable node/prefer-global/buffer */
import type { APIUser, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { H3Event } from "h3";
import type { NuxtError } from "nuxt/app";
import { useLogger, createError } from "evlog";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const log = useLogger(event);
	const nextUrl = query.next as string | undefined;

	const authorizationParams: Record<string, string> = {
		prompt: "none",
	};
	if (nextUrl) {
		authorizationParams.state = Buffer.from(nextUrl).toString("base64");
	}

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

	return oauthHandler(event);
});
