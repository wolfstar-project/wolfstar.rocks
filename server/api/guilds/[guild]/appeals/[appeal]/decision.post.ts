import { requestAppealDecision } from "#server/utils/appeals/queue";
import {
	auditAppealDecision,
	parseAppealDecisionBody,
	refuseAppealDecision,
	throwInvalidAppealRequest,
} from "#server/utils/appeals/queue-route";
import { authorizeAppealFormManager } from "#server/utils/appeals/route";
import { useManagedGuild } from "#server/utils/guilds/manager";

/**
 * `POST /api/guilds/:guild/appeals/:appeal/decision`: asks the bot to approve or
 * deny a pending appeal. The body is `{ decision: "Approve" | "Deny", reason?: string }`.
 * Answers 202 `{ requestId }`: the bot decides, see
 * `GET /api/guilds/:guild/appeals/requests/:request` for how it went. 403
 * `{ code: "noAccess" }` when who asks does not review the appeals, which is
 * audited as a denied attempt, 404
 * `{ code: "unknown" }`, 409 `{ code: "decided" }` when it was decided already.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild, member } = useManagedGuild(event);
		const appealId = getRouterParam(event, "appeal") ?? "";

		const parsed = parseAppealDecisionBody(await readBody(event));
		if (parsed.errors) throwInvalidAppealRequest(parsed.errors);
		const { decision, reason } = parsed.data;

		const { requestId, caseId } = await requestAppealDecision({
			guild,
			member,
			appealId,
			decision,
			reason,
		}).catch((error: unknown) => refuseAppealDecision(event, error));

		auditAppealDecision(event, { caseId, decision, reason });
		setResponseStatus(event, 202);
		return { requestId };
	},
	{
		auth: true,
		authorize: authorizeAppealFormManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
