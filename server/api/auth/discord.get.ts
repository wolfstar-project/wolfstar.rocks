import consola from 'consola/browser';
import type { APIUser, RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import type { H3Event } from 'h3';
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
		consola.info(`Discord OAuth success: ${user.global_name ?? user.username}\n${JSON.stringify(tokens)}`);
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
		return sendRedirect(event, '/');
	},

	async onError(event: H3Event, error: Error) {
		consola.error('Discord OAuth error', error);
		return sendRedirect(event, `/auth/callback?error=${encodeURIComponent(error.message)}`);
	}
});
