import { readAppealRequestOutcome } from "#server/utils/appeals/queue";
import { AppealQueueError } from "#server/utils/appeals/queue-error";
import { throwAppealQueueError } from "#server/utils/appeals/queue-route";
import { authorizeAppealFormManager } from "#server/utils/appeals/route";
import { useManagedGuild } from "#server/utils/guilds/manager";

/**
 * `GET /api/guilds/:guild/appeals/requests/:request`: where a request to decide
 * an appeal is, which the page polls until the bot has done it. Answers with
 * `{ id, state: "pending" | "done" | "failed", code, detail }` (see
 * `AppealRequestOutcome`); 404 `{ code: "unknown" }` for a request that is not
 * one of the guild.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const requestId = getRouterParam(event, "request") ?? "";

		const outcome = await readAppealRequestOutcome(guild.id, requestId);
		if (outcome === null) throwAppealQueueError(new AppealQueueError("unknown"));
		return outcome;
	},
	{
		auth: true,
		authorize: authorizeAppealFormManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 5, window: seconds(1) },
	},
);
