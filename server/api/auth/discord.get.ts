/* oxlint-disable node/prefer-global/buffer */
import type { APIUser, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { H3Event } from "h3";
import type { NuxtError } from "nuxt/app";

defineRouteMeta({
	openAPI: {
		description:
			"Handles the OAuth2 callback from Discord after user authorization. Exchanges the authorization code for access tokens and establishes a user session.",
		operationId: "discordOAuthCallback",
		parameters: [
			{
				description: "The authorization code returned by Discord after user consent",
				in: "query",
				name: "code",
				required: true,
				schema: { type: "string" },
			},
			{
				description: "The state parameter for CSRF protection, must match the original request",
				in: "query",
				name: "state",
				required: true,
				schema: { type: "string" },
			},
		],
		responses: {
			302: { description: "Redirect to the dashboard on successful authentication" },
			400: { description: "Invalid or missing authorization code or state" },
			500: { description: "Failed to exchange code for tokens or fetch user data" },
		},
		summary: "Discord OAuth2 callback",
		tags: ["Authentication"],
	},
});

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
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
			throw createError({
				message: error.message,
				status: 500,
				statusText: "Discord OAuth error",
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
		},
	});

	return oauthHandler(event);
});
