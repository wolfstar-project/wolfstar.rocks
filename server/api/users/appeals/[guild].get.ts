import type { AppealPage } from "#shared/utils/my-appeals";
import { botApiFetch } from "#server/utils/bot-api/session";
import { readAppealGuildParam, throwBotRefusal } from "#server/utils/my-appeals/route";

/**
 * `GET /api/users/appeals/:guild`: the page of a server for the member, as the
 * bot's `GET /appeals/:guild` answers it: whether appeals are on, the member's
 * block, the forms with their cases or why they are locked, and the appeals the
 * member sent. Answers an `AppealPage`; a server the bot does not know is a 404
 * `{ code: "notFound" }`.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const guildId = readAppealGuildParam(event);
		const { user } = await getCurrentUser(event);

		setResponseHeader(event, "Cache-Control", "private, no-store");
		return botApiFetch<AppealPage>(user.id, `/appeals/${guildId}`).catch(throwBotRefusal);
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		// The bot takes five of these in five seconds from a member:
		rateLimit: { enabled: true, limit: 5, window: seconds(5) },
	},
);
