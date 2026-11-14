import type { JoinGuardRequestState } from "#shared/utils/join-guard";
import { useManagedGuild } from "#server/utils/guilds/manager";
import { JoinGuardQueueError, readJoinGuardRequestState } from "#server/utils/join-guard/queue";
import {
	authorizeJoinGuardManager,
	readJoinGuardRowParam,
	throwJoinGuardQueueError,
} from "#server/utils/join-guard/route";

/**
 * `GET /api/guilds/:guild/joinguard/requests/:request`: whether the bot has
 * done a request yet, and why it could not (a `JoinGuardRequestState`), which
 * the dashboard polls. 404 `{ code: "unknown" }` for a request of another guild.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<JoinGuardRequestState> => {
		const { guild } = useManagedGuild(event);
		const requestId = readJoinGuardRowParam(event, "request");

		const state = await readJoinGuardRequestState(guild.id, requestId);
		if (state === null) throwJoinGuardQueueError(new JoinGuardQueueError("unknown"));

		setResponseHeader(event, "Cache-Control", "private, no-store");
		return state;
	},
	{
		auth: true,
		authorize: authorizeJoinGuardManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 5, window: seconds(1) },
	},
);
