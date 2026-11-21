import { readAppealQueue } from "#server/utils/appeals/queue";
import { parseAppealQueueQuery } from "#server/utils/appeals/queue-route";
import { authorizeAppealFormManager } from "#server/utils/appeals/route";
import { useManagedGuild } from "#server/utils/guilds/manager";

/**
 * `GET /api/guilds/:guild/appeals?status=pending|accepted|denied|all&limit=&offset=`:
 * the appeals of a guild, the latest first, for the review queue. Answers with
 * `{ entries, total, counts, canReview }` (see `AppealQueueResponse`); a status
 * or a page that is not one answers 400 `{ code: "invalid", errors }`.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild, member } = useManagedGuild(event);
		const { status, limit, offset } = parseAppealQueueQuery(getQuery(event));

		return readAppealQueue({ guild, member, status, limit, offset });
	},
	{
		auth: true,
		authorize: authorizeAppealFormManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
