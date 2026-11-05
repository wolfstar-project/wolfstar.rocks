import { JoinGuardConnectionsScope } from "#shared/utils/join-guard";

/** What Better Auth's `signIn.social()` is called with for the verification page. */
export interface VerifySignInOptions {
	provider: "discord";
	callbackURL: string;
	errorCallbackURL: string;
	/** Asked on top of the provider's own scopes; left out when nothing extra is needed. */
	scopes?: string[];
}

/**
 * The sign-in the verification page of a guild starts: through Discord, back
 * to `/verify/<guild>` by the OAuth callback page, and, when the guild reads
 * linked accounts, with the `connections` scope on top of the usual ones.
 *
 * It works for a member who is signed in already: Better Auth runs the OAuth
 * flow again and writes the new token, which carries `connections`, into the
 * account cookie. The provider's own options stay as they are (`prompt:
 * "consent"`, the redirect URI built from the site URL); only the scopes of
 * this one authorization request change.
 *
 * Use it with the action handle, which never throws:
 *
 * ```ts
 * const signIn = useSignIn("social");
 * await signIn.execute(verifySignInOptions(guildId, { connections: page.checks.connections }));
 * ```
 *
 * @param guildId The guild of the page, a Discord ID.
 * @param options.connections Whether to ask for `connections`: when the guild
 * reads linked accounts (`checks.connections`), or the page answered
 * `needsConnections`.
 */
export function verifySignInOptions(
	guildId: string,
	options: { connections: boolean },
): VerifySignInOptions {
	const next = `/verify/${encodeURIComponent(guildId)}`;
	return {
		provider: "discord",
		callbackURL: `/oauth/callback?next=${encodeURIComponent(next)}`,
		errorCallbackURL: "/oauth/callback",
		...(options.connections ? { scopes: [JoinGuardConnectionsScope] } : {}),
	};
}
