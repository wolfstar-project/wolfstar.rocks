import type { JoinGuardVerifyResponse } from "#shared/utils/join-guard";
import { readJoinGuardVerifyGuildParam } from "#server/utils/join-guard/route";
import {
	readJoinGuardVerifyGuestPage,
	readJoinGuardVerifyPage,
	throwJoinGuardVerifyError,
} from "#server/utils/join-guard/verify";

/**
 * `GET /api/verify/:guild`: what the verification page of a guild shows.
 * Signed in, a `JoinGuardVerifyPage` (`signedIn: true`); signed out, a
 * `JoinGuardVerifyGuestPage` (`signedIn: false`) with only the guild and what
 * its page checks, for the sign-in card. 404 `{ code: "unknownGuild" }` for a
 * guild neither the bot nor the member is in (signed out: the bot is not in it).
 */
export default defineWrappedResponseHandler(
	async (event): Promise<JoinGuardVerifyResponse> => {
		const guildId = readJoinGuardVerifyGuildParam(event);
		setResponseHeader(event, "Cache-Control", "private, no-store");

		// Signed in or not: the route takes both, so it reads the session itself.
		const session = await getUserSession(event).catch(() => null);
		const page = session?.user
			? readJoinGuardVerifyPage(event, guildId)
			: readJoinGuardVerifyGuestPage(guildId);
		return page.catch(throwJoinGuardVerifyError);
	},
	{
		auth: false,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
