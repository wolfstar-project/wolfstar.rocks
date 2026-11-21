import type { H3Event } from "h3";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { guildSettingsAccessDenied, guildSettingsUpdate } from "#shared/audit/actions";
import { useLogger, withAuditMethods } from "evlog";

/** The member who appeals, as the session's Discord user has them. */
export interface AppealSender {
	id: string;
	username: string;
}

/**
 * Records on the server's activity that a member sent an appeal of a case. The
 * bot saves the appeal and posts it to the staff; the dashboard is where it was
 * written, so the dashboard's audit trail keeps it too, as it keeps a decision
 * on one (`appealDecision.<case>`).
 */
export function auditAppealSent(
	event: H3Event,
	input: { guildId: string; sender: AppealSender; caseId: number; formId: string },
): void {
	const key = `appeal.${input.caseId}`;
	withAuditMethods(useLogger(event)).audit(
		guildSettingsUpdate({
			actor: { type: "user", id: input.sender.id, displayName: input.sender.username },
			target: { type: "guild", id: input.guildId },
			outcome: "success",
			changes: compactSettingsChanges(
				{ [key]: { status: "not appealed" } },
				{ [key]: { status: "sent", form: input.formId } },
			),
		}),
	);
}

/**
 * Records an appeal the bot kept a member from sending: the appeals are off,
 * the member is blocked, or the form is locked to them (its 403s). The other
 * refusals (an answer missing, a case appealed already) are not a denial and
 * are not recorded.
 */
export function auditAppealDenied(
	event: H3Event,
	input: { guildId: string; sender: AppealSender },
	refusal: unknown,
): void {
	const { statusCode, data } = (refusal ?? {}) as {
		statusCode?: unknown;
		data?: { code?: unknown };
	};
	if (statusCode !== 403) return;

	withAuditMethods(useLogger(event)).audit(
		guildSettingsAccessDenied({
			actor: { type: "user", id: input.sender.id, displayName: input.sender.username },
			target: { type: "guild", id: input.guildId },
			outcome: "denied",
			reason: `Not allowed to appeal (${String(data?.code ?? "refused")})`,
		}),
	);
}
