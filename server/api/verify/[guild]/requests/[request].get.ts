import type { JoinGuardRequestState } from "#shared/utils/join-guard";
import { JoinGuardQueueError, readJoinGuardRequestState } from "#server/utils/join-guard/queue";
import {
	readJoinGuardRowParam,
	readJoinGuardVerifyGuildParam,
	throwJoinGuardQueueError,
} from "#server/utils/join-guard/route";
import { readVerifyMemberId } from "#server/utils/join-guard/verify";

/**
 * `GET /api/verify/:guild/requests/:request` (signed in): whether the bot has
 * let the member in yet, and why it could not (a `JoinGuardRequestState`),
 * which the page polls. Only the member's own `Pass` requests are read: 404
 * `{ code: "unknown" }` for any other.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<JoinGuardRequestState> => {
		const guildId = readJoinGuardVerifyGuildParam(event);
		const requestId = readJoinGuardRowParam(event, "request");
		const userId = await readVerifyMemberId(event);

		const state = await readJoinGuardRequestState(guildId, requestId, { userId });
		if (state === null) throwJoinGuardQueueError(new JoinGuardQueueError("unknown"));

		setResponseHeader(event, "Cache-Control", "private, no-store");
		return state;
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 5, window: seconds(1) },
	},
);
