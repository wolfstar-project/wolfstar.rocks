import { useManagedGuild } from "#server/utils/guilds/manager";
import { requestJoinGuardModeratorAction } from "#server/utils/join-guard/queue";
import {
	auditJoinGuardRequest,
	authorizeJoinGuardManager,
	parseJoinGuardInput,
	throwJoinGuardQueueError,
} from "#server/utils/join-guard/route";
import { JoinGuardModeratorRequestBodySchema } from "#shared/schemas/join-guard";

/**
 * `POST /api/guilds/:guild/joinguard/requests`: asks the bot to verify or kick
 * a member who waits at the checkpoint, or to post the button of the
 * checkpoint. The body is a `JoinGuardModeratorRequestBody`. Answers 202
 * `{ id }`: the bot acts, see `GET …/requests/:request` for how it went. 404
 * `{ code: "unknown" }` for a row of the queue that is not the guild's, 409
 * `{ code: "notWaiting" }` for a member who does not wait anymore.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild, member } = useManagedGuild(event);
		const body = parseJoinGuardInput(
			JoinGuardModeratorRequestBodySchema,
			await readBody(event),
		);

		// The moderator is named by their Discord ID, which the bot checks and
		// logs: `member` is Discord's, the session's user ID is not one.
		const { requestId, checkpoint } = await requestJoinGuardModeratorAction({
			guildId: guild.id,
			moderatorId: member.user.id,
			body,
		}).catch(throwJoinGuardQueueError);

		auditJoinGuardRequest(event, { body, userId: checkpoint?.userId ?? null, requestId });
		setResponseStatus(event, 202);
		return { id: requestId };
	},
	{
		auth: true,
		authorize: authorizeJoinGuardManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
