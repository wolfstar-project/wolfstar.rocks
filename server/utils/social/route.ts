import type { ExternalServiceError, ExternalServiceResult } from "#server/utils/external-service";
import type { SocialErrorCode, SocialSubscription } from "#shared/utils/social";
import type { H3Event } from "h3";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import { guildSettingsUpdate } from "#shared/audit/actions";
import { isSocialErrorCode } from "#shared/utils/social";
import { useLogger, withAuditMethods } from "evlog";
import { createError as createH3Error } from "h3";

/**
 * `authorize` hook of the Social module's routes: who asks has to manage the
 * server of the path, and a refusal is audited. Staryl checks no member: its
 * secret acts for every server, so this hook is the only gate.
 */
export const authorizeSocialManager = authorizeGuildManager(
	"Insufficient permissions to manage the Social module",
);

/**
 * A refusal the page can act on, with its code in `data`: h3's `createError`
 * puts it in the response body, where the client reads it.
 */
function socialError(statusCode: number, statusMessage: string, code: SocialErrorCode) {
	return createH3Error({ data: { code }, message: statusMessage, statusCode, statusMessage });
}

/** Answers a request whose body or path the validator refused. */
export function throwInvalidSocialRequest(): never {
	throw socialError(400, "Invalid request", "invalid");
}

/**
 * Answers with what Staryl said, or with 503 when it said nothing the
 * dashboard can use. The member reads a code, never Staryl's own words.
 */
function throwSocialError(event: H3Event, error: ExternalServiceError): never {
	if (error.kind === "refused") {
		// A 400 means the dashboard sent what Staryl does not take: the page's own checks missed it.
		const code = error.status === 400 ? "invalid" : error.code;
		throw socialError(
			error.status,
			"Staryl refused the request",
			isSocialErrorCode(code) ? code : "generic",
		);
	}

	// Not the member's doing: the site has no secret, Staryl is down, or the two are out of step.
	useLogger(event).set({ staryl: error });
	throw socialError(503, "Staryl is not available", "unavailable");
}

/** The value of a call to Staryl, or the answer its failure makes. */
export function unwrapSocialResult<Value>(
	event: H3Event,
	result: ExternalServiceResult<Value>,
): Value {
	if (!result.ok) throwSocialError(event, result.error);
	return result.value;
}

/** The ID of the member the request is made for, which Staryl writes in its log. */
export function socialActorId(event: H3Event): string {
	return useManagedGuild(event).member.user.id;
}

/**
 * Records a change of the Social module in the audit chain. The module has no
 * settings key: its switch is filed under `social.enabled`, and a subscription
 * under `social.<channel>.<source>`, as a rule is under `automodRule.<name>`.
 */
function auditSocialChange(
	event: H3Event,
	before: Record<string, unknown>,
	after: Record<string, unknown>,
): void {
	const { guild, member } = useManagedGuild(event);

	withAuditMethods(useLogger(event)).audit(
		guildSettingsUpdate({
			actor: { type: "user", id: member.user.id, displayName: member.user.username },
			changes: compactSettingsChanges(before, after),
			outcome: "success",
			target: { type: "guild", id: guild.id },
		}),
	);
}

export function auditSocialSwitch(event: H3Event, previous: boolean, enabled: boolean): void {
	auditSocialChange(event, { "social.enabled": previous }, { "social.enabled": enabled });
}

/** What the audit trail keeps of a subscription: what an admin chose, and where it is filed. */
type AuditedSubscription = Pick<
	SocialSubscription,
	"channelId" | "displayName" | "message" | "provider" | "sourceId" | "target"
>;

/** `before` is `null` for an add, `after` for a remove. */
export function auditSocialSubscription(
	event: H3Event,
	before: AuditedSubscription | null,
	after: AuditedSubscription | null,
): void {
	const subscription = before ?? after;
	if (subscription === null) return;

	const key = `social.${subscription.channelId}.${subscription.sourceId}`;
	auditSocialChange(
		event,
		before === null ? {} : { [key]: describeSubscription(before) },
		after === null ? {} : { [key]: describeSubscription(after) },
	);
}

// What an admin chose. The health and the dates are Staryl's own, and change on their own.
function describeSubscription(subscription: AuditedSubscription) {
	return {
		message: subscription.message,
		name: subscription.displayName,
		provider: subscription.provider,
		target: subscription.target,
	};
}
