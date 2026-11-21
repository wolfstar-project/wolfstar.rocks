import type { H3Event } from "h3";
import { COMMAND_PERMISSIONS_SCOPE } from "#shared/utils/command-permissions";
import { ofetch } from "ofetch";

const CURRENT_AUTHORIZATION_URL = "https://discord.com/api/v10/oauth2/@me";

type ScopeFetcher = (
	url: string,
	options: { headers: Record<string, string> },
) => Promise<{ scopes?: readonly string[] }>;

/**
 * The scopes a user's Discord token carries, from `GET /oauth2/@me`. The
 * account cookie keeps the scope of the first sign-in only, so this is the
 * only place that knows what a later sign-in granted. No scope when Discord
 * refuses the token; the token is never logged.
 */
export async function readTokenScopes(
	accessToken: string,
	fetcher: ScopeFetcher = (url, options) => ofetch<{ scopes?: string[] }>(url, options),
): Promise<readonly string[]> {
	try {
		const { scopes } = await fetcher(CURRENT_AUTHORIZATION_URL, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return scopes ?? [];
	} catch {
		return [];
	}
}

declare module "h3" {
	interface H3EventContext {
		/** Whether the user's token may edit command permissions, once asked in the request. */
		commandPermissionsScope?: Promise<boolean>;
	}
}

/** Whether the signed-in user's token may edit the bot's command permissions. */
export function hasCommandPermissionsScope(event: H3Event): Promise<boolean> {
	event.context.commandPermissionsScope ??= (async () => {
		const tokens = await event.context.$authorization.resolveServerTokens();
		if (!tokens?.access_token) return false;
		return (await readTokenScopes(tokens.access_token)).includes(COMMAND_PERMISSIONS_SCOPE);
	})();
	return event.context.commandPermissionsScope;
}
