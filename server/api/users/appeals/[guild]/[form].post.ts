import { botApiFetch } from "#server/utils/bot-api/session";
import { auditAppealDenied, auditAppealSent } from "#server/utils/my-appeals/audit";
import {
	parseAppealSubmission,
	readAppealFormParam,
	readAppealGuildParam,
	throwBotRefusal,
	throwInvalidAppealSubmission,
} from "#server/utils/my-appeals/route";

/**
 * `POST /api/users/appeals/:guild/:form`: sends the member's appeal of a case
 * with a form (`builtin` for the one of a server that set none up), through the
 * bot's `POST /appeals/:guild/:form`, which checks the answers, saves the
 * appeal, posts it to the staff and opens its thread. The body is
 * `{ caseId, answers }`, the answers by question ID. Answers 201 with the
 * bot's appeal; a refusal keeps the bot's status, with its error as
 * `{ code }`: 403 `disabled` | `blocked` | `locked`, 404 `notFound` |
 * `notAppealable`, 400 `invalid`, 409 `appealed`.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const guildId = readAppealGuildParam(event);
		const formId = readAppealFormParam(event);
		const parsed = parseAppealSubmission(await readBody(event));
		if (parsed.errors) throwInvalidAppealSubmission(parsed.errors);

		const { user } = await getCurrentUser(event);
		const sender = { id: user.id, username: user.username };
		const appeal = await botApiFetch<unknown>(user.id, `/appeals/${guildId}/${formId}`, {
			method: "POST",
			body: parsed.data,
		}).catch((error: unknown) => {
			try {
				return throwBotRefusal(error);
			} catch (refusal) {
				auditAppealDenied(event, { guildId, sender }, refusal);
				throw refusal;
			}
		});

		auditAppealSent(event, { guildId, sender, caseId: parsed.data.caseId, formId });
		setResponseStatus(event, 201);
		return appeal;
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		// The bot takes three of these in a minute from a member:
		rateLimit: { enabled: true, limit: 3, window: minutes(1) },
	},
);
