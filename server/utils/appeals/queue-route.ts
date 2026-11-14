import type { AppealDecision, AppealQueueFilter } from "#shared/utils/appeal-queue";
import type { H3Event } from "h3";
import { AppealQueueError } from "#server/utils/appeals/queue-error";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { useManagedGuild } from "#server/utils/guilds/manager";
import { guildSettingsAccessDenied, guildSettingsUpdate } from "#shared/audit/actions";
import { AppealQueueQuerySchema } from "#shared/schemas/appeal-queue";
import { isAppealDecision, MaximumAppealDecisionReasonLength } from "#shared/utils/appeal-queue";
import { useLogger, withAuditMethods } from "evlog";
import { createError as createH3Error } from "h3";
import { getDotPath, safeParse } from "valibot";

/**
 * A refusal the review queue can act on. Thrown with h3's `createError` rather
 * than evlog's: its `data` reaches the client in the response body, which is
 * where `useAppealQueue()` reads the code from.
 */
function queueError(statusCode: number, statusMessage: string, data: Record<string, unknown>) {
	return createH3Error({ statusCode, statusMessage, message: statusMessage, data });
}

const QUEUE_ERROR_RESPONSES = {
	decided: [409, "Appeal already decided"],
	invalid: [400, "Invalid decision"],
	noAccess: [403, "Not allowed to review the appeals"],
	unknown: [404, "Appeal not found"],
} as const satisfies Record<AppealQueueError["code"], readonly [number, string]>;

/**
 * Answers a request with what went wrong when a decision was asked for.
 * Anything that is not an {@linkcode AppealQueueError} is thrown again as it is.
 */
export function throwAppealQueueError(error: unknown): never {
	if (!(error instanceof AppealQueueError)) throw error;

	const [status, message] = QUEUE_ERROR_RESPONSES[error.code];
	throw queueError(status, message, { code: error.code });
}

/** Answers a request whose query or body was refused, one message per field. */
export function throwInvalidAppealRequest(errors: readonly string[]): never {
	throw queueError(400, "Invalid request", { code: "invalid", errors });
}

/** Reads the query of the queue: a status, and a page. */
export function parseAppealQueueQuery(query: unknown): {
	status: AppealQueueFilter;
	limit: number;
	offset: number;
} {
	const result = safeParse(AppealQueueQuerySchema, query);
	if (result.success) return result.output;

	return throwInvalidAppealRequest(
		result.issues.map((issue) => `${getDotPath(issue) ?? "query"}: ${issue.message}`),
	);
}

/** Reads what a decision is asked with: `Approve` or `Deny`, and the reason the staff gives. */
export function parseAppealDecisionBody(input: unknown):
	| { data: { decision: AppealDecision; reason: string | null }; errors?: undefined }
	| {
			data?: undefined;
			errors: string[];
	  } {
	if (typeof input !== "object" || input === null) return { errors: ["Invalid body."] };

	const body = input as Record<string, unknown>;
	const errors: string[] = [];
	if (!isAppealDecision(body.decision)) errors.push("decision: Expected Approve or Deny.");

	let reason: string | null = null;
	if (body.reason !== undefined && body.reason !== null) {
		const text = typeof body.reason === "string" ? body.reason.trim() : null;
		if (text === null || text.length > MaximumAppealDecisionReasonLength) {
			errors.push(
				`reason: Expected a text of at most ${MaximumAppealDecisionReasonLength} characters.`,
			);
		} else {
			reason = text || null;
		}
	}

	return errors.length > 0 || !isAppealDecision(body.decision)
		? { errors }
		: { data: { decision: body.decision, reason } };
}

/**
 * Records a request to decide an appeal in the audit chain. The decision is
 * the bot's, and may still fail, so what is recorded is that it was asked for;
 * an appeal has no settings key of its own, so it is filed under
 * `appealDecision.<case>`.
 */
export function auditAppealDecision(
	event: H3Event,
	input: { caseId: number; decision: AppealDecision; reason: string | null },
): void {
	const { guild, member } = useManagedGuild(event);
	const key = `appealDecision.${input.caseId}`;

	withAuditMethods(useLogger(event)).audit(
		guildSettingsUpdate({
			actor: { type: "user", id: member.user.id, displayName: member.user.username },
			target: { type: "guild", id: guild.id },
			outcome: "success",
			changes: compactSettingsChanges(
				{ [key]: { status: "pending" } },
				{
					[key]: {
						status: `${input.decision.toLowerCase()} requested`,
						reason: input.reason,
					},
				},
			),
		}),
	);
}

/**
 * Answers a request to decide an appeal that was refused, as
 * {@linkcode throwAppealQueueError} does. A manager of the dashboard who does
 * not review the appeals is denied, and that is audited, as the settings
 * routes audit a member who cannot manage the guild.
 */
export function refuseAppealDecision(event: H3Event, error: unknown): never {
	if (error instanceof AppealQueueError && error.code === "noAccess") {
		const { guild, member } = useManagedGuild(event);
		withAuditMethods(useLogger(event)).audit(
			guildSettingsAccessDenied({
				actor: { type: "user", id: member.user.id, displayName: member.user.username },
				target: { type: "guild", id: guild.id },
				outcome: "denied",
				reason: "Not allowed to review the appeals",
			}),
		);
	}
	return throwAppealQueueError(error);
}
