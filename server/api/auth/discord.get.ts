import consola from 'consola/browser';
import type { APIUser, RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import type { H3Event, H3Error } from 'h3';
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
		consola.info('Discord OAuth success:', user);
		// Save the user and tokens to the session
		await setUserSession(
			event,
			{
				user: {
					name: user.username ?? user.global_name,
					id: user.id,
					avatar: user.avatar ?? null
				},
				tokens
			},
			{
				maxAge: 60 * 60 * 24 * 7 // 1 week
			}
		);
		return sendRedirect(event, '/');
	},
	// Optional, will return a json error and 401 status code by default
	onError(event: H3Event, error: H3Error) {
		consola.error('GitHub OAuth error:', error);
		return sendRedirect(event, '/');
	}
});
