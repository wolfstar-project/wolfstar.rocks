import type { H3Event } from "h3";

/**
 * Discord access token, kept in this repo's existing `access_token` shape
 * (matching `RESTPostOAuth2AccessTokenResult`) so `discord/oauth.ts` and
 * `discord/index.ts` don't need to be renamed throughout.
 */
export interface DiscordAccessToken {
	access_token: string;
}

/**
 * Returns the current user's Discord access token, transparently refreshed by
 * Better Auth if expired. `null` when the user has no linked Discord account
 * (not signed in, or the account/session is no longer valid).
 */
export async function refreshSessionTokens(
	event: H3Event,
	options: { force?: boolean } = {},
): Promise<DiscordAccessToken | null> {
	const auth = serverAuth(event);

	try {
		const result = options.force
			? await auth.api.refreshToken({
					body: { providerId: "discord" },
					headers: event.headers,
				})
			: await auth.api.getAccessToken({
					body: { providerId: "discord" },
					headers: event.headers,
				});

		if (!result.accessToken) {
			return null;
		}
		return { access_token: result.accessToken };
	} catch {
		return null;
	}
}
