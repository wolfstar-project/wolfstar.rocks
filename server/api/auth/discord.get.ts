import type { APIUser, RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import type { H3Event } from 'h3';
import { useLogger } from '~~/shared/utils/logger';

defineRouteMeta({
	openAPI: {
		tags: ['discord-api'],
		description: 'Discord OAuth2 callback',
		parameters: [
			{
				in: 'query',
				name: 'code',
				required: true,
				description: 'The authorization code returned by Discord'
			},
			{
				in: 'query',
				name: 'state',
				required: true,
				description: 'The state parameter returned by Discord'
			}
		]
	}
});

export default defineOAuthDiscordEventHandler({
	async onSuccess(
		event: H3Event,
		{
			user,
			tokens
		}: {
			user: APIUser;
			tokens: RESTPostOAuth2AccessTokenResult;
		}
	) {
		useLogger().info(`Discord OAuth success: ${user.global_name ?? user.username}\n${JSON.stringify(tokens)}`);
		// Save the user and tokens to the session
		await setUserSession(
			event,
			{
				user: {
					name: user.username ?? user.global_name,
					id: user.id,
					avatar: user.avatar ?? null
				},
				tokens,
				loggedInAt: new Date().getTime()
			},
			{
				maxAge: 60 * 60 * 24 * 7 // 1 week
			}
		);
		// Redirect to the home page
		return sendRedirect(event, '/');
	},

	async onError(event: H3Event, error: Error) {
		useLogger().error('Discord OAuth error', error);

		return sendError(
			event,
			createError({
				statusCode: 500,
				statusMessage: 'Discord OAuth error',
				data: error
			})
		);
	}
});
