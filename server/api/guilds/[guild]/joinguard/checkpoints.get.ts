import type { JoinGuardQueuePage } from "#shared/utils/join-guard";
import { useManagedGuild } from "#server/utils/guilds/manager";
import { readJoinGuardQueue } from "#server/utils/join-guard/queue";
import { authorizeJoinGuardManager, parseJoinGuardInput } from "#server/utils/join-guard/route";
import { JoinGuardQueueQuerySchema } from "#shared/schemas/join-guard";

/**
 * `GET /api/guilds/:guild/joinguard/checkpoints?status=<filter>&cursor=<id>`:
 * a page of the checkpoint queue of the last 7 days, newest first, with the
 * members resolved, the counts of the 7 days by filter and how many wait now
 * (a `JoinGuardQueuePage`). `status` defaults to `all`; a status or a cursor
 * that is not one answers 400 `{ code: "invalid", errors }`.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<JoinGuardQueuePage> => {
		const { guild } = useManagedGuild(event);
		const { status, cursor } = parseJoinGuardInput(
			JoinGuardQueueQuerySchema,
			getQuery(event),
			"query",
		);

		setResponseHeader(event, "Cache-Control", "private, no-store");
		return readJoinGuardQueue({ guildId: guild.id, status, cursor });
	},
	{
		auth: true,
		authorize: authorizeJoinGuardManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
