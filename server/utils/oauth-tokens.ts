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
 *
 * Better Auth 1.7 replaced the `providerId` account selector with an explicit
 * union of `{ accountId }` (a database row id) and `{ useAccountCookie: true }`.
 * This deployment runs database-less — `account.storeAccountCookie` in
 * `server/auth.config.ts` keeps the Discord account in a signed cookie — so the
 * cookie is the only account source there is.
 */
export async function refreshSessionTokens(
	event: H3Event,
	options: { force?: boolean } = {},
): Promise<DiscordAccessToken | null> {
	const auth = serverAuth(event);

	try {
		const result = options.force
			? await auth.api.refreshToken({
					body: { useAccountCookie: true },
					headers: event.headers,
				})
			: await auth.api.getAccessToken({
					body: { useAccountCookie: true },
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
