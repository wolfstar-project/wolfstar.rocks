import type { JoinGuardModeratorRequestBody, JoinGuardRule } from "#shared/utils/join-guard";
import type { H3Event } from "h3";
import type { GenericSchema, InferOutput } from "valibot";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import { JoinGuardQueueError } from "#server/utils/join-guard/queue";
import { JoinGuardRuleError } from "#server/utils/join-guard/rules";
import { guildSettingsUpdate } from "#shared/audit/actions";
import { isSnowflake } from "#shared/utils/snowflake";
import { useLogger, withAuditMethods } from "evlog";
import { createError as createH3Error, getRouterParam } from "h3";
import { getDotPath, safeParse } from "valibot";

/**
 * `authorize` hook of the join guard routes: resolves the guild of the path
 * and checks that who asks can manage it. A refusal is audited, as it is for
 * the settings routes.
 */
export const authorizeJoinGuardManager = authorizeGuildManager(
	"Insufficient permissions to manage the join guard",
);

/**
 * A refusal the dashboard can act on. Thrown with h3's `createError` rather
 * than evlog's: its `data` reaches the client in the response body, which is
 * where the page reads the code from.
 */
function joinGuardError(statusCode: number, statusMessage: string, data: Record<string, unknown>) {
	return createH3Error({ statusCode, statusMessage, message: statusMessage, data });
}

/** Answers a request whose path, query or body was refused, one message per field. */
function throwInvalidJoinGuardRequest(errors: readonly string[]): never {
	throw joinGuardError(400, "Invalid request", { code: "invalid", errors: [...errors] });
}

/**
 * Reads a value with a schema, or answers 400 `{ code: "invalid", errors }`
 * with one `<path>: <message>` per issue.
 */
export function parseJoinGuardInput<const Schema extends GenericSchema>(
	schema: Schema,
	input: unknown,
	label = "body",
): InferOutput<Schema> {
	const result = safeParse(schema, input);
	if (result.success) return result.output;

	return throwInvalidJoinGuardRequest(
		result.issues.map((issue) => `${getDotPath(issue) ?? label}: ${issue.message}`),
	);
}

/** The guild of the path of a verification route (`:guild`), or 400 when it is no Discord ID. */
export function readJoinGuardVerifyGuildParam(event: H3Event): string {
	const value = getRouterParam(event, "guild") ?? "";
	if (!isSnowflake(value)) throwInvalidJoinGuardRequest(["guild: Expected a Discord ID."]);
	return value;
}

/** A row ID of the path (`:rule`, `:request`), or 400 when the text is not one. */
export function readJoinGuardRowParam(event: H3Event, name: "rule" | "request"): string {
	const value = getRouterParam(event, name) ?? "";
	if (!/^\d{1,18}$/u.test(value)) throwInvalidJoinGuardRequest([`${name}: Expected an ID.`]);
	return value;
}

const RULE_ERROR_RESPONSES = {
	invalid: [400, "Invalid rule"],
	limit: [400, "Too many rules"],
	nameTaken: [409, "Rule name taken"],
	unknown: [404, "Rule not found"],
} as const satisfies Record<JoinGuardRuleError["code"], readonly [number, string]>;

/**
 * Answers a request with what went wrong when a rule was created, edited or
 * deleted: `{ code }`, which for a rule the bot could not run is its problem
 * (a `JoinGuardRuleProblem`, repeated as `problem`). Anything that is not a
 * {@linkcode JoinGuardRuleError} is thrown again as it is.
 */
export function throwJoinGuardRuleError(error: unknown): never {
	if (!(error instanceof JoinGuardRuleError)) throw error;

	const [status, message] = RULE_ERROR_RESPONSES[error.code];
	// A rule the bot could not run answers its problem as the code, which the
	// editor shows as it shows its own check; `problem` repeats it.
	throw joinGuardError(status, message, {
		code: error.problem ?? error.code,
		...(error.problem === null ? {} : { problem: error.problem }),
	});
}

const QUEUE_ERROR_RESPONSES = {
	notWaiting: [409, "The member does not wait at the checkpoint"],
	unknown: [404, "Not found"],
} as const satisfies Record<JoinGuardQueueError["code"], readonly [number, string]>;

/**
 * Answers a request with what went wrong when a moderator asked for something
 * from the queue. Anything that is not a {@linkcode JoinGuardQueueError} is
 * thrown again as it is.
 */
export function throwJoinGuardQueueError(error: unknown): never {
	if (!(error instanceof JoinGuardQueueError)) throw error;

	const [status, message] = QUEUE_ERROR_RESPONSES[error.code];
	throw joinGuardError(status, message, { code: error.code });
}

/** The audit diff addresses a field by a `/`-separated path: a `/` in a name would split it. `∕` reads the same. */
function auditKey(prefix: string, name: string) {
	return `${prefix}.${name.replaceAll("/", "∕")}`;
}

function auditGuildChange(
	event: H3Event,
	before: Record<string, unknown>,
	after: Record<string, unknown>,
): void {
	const { guild, member } = useManagedGuild(event);
	withAuditMethods(useLogger(event)).audit(
		guildSettingsUpdate({
			actor: { type: "user", id: member.user.id, displayName: member.user.username },
			target: { type: "guild", id: guild.id },
			outcome: "success",
			changes: compactSettingsChanges(before, after),
		}),
	);
}

/**
 * Records a change to the rules of a guild in the audit chain. A rule has no
 * settings key of its own, so its fields are filed under `joinGuardRule.<name>`.
 */
export function auditJoinGuardRuleChange(
	event: H3Event,
	before: Partial<JoinGuardRule> | null,
	after: Partial<JoinGuardRule> | null,
	name: string,
): void {
	const key = auditKey("joinGuardRule", name);
	auditGuildChange(
		event,
		before === null ? {} : { [key]: before },
		after === null ? {} : { [key]: after },
	);
}

/**
 * Records a moderator's request to the bot in the audit chain. The bot acts,
 * and may still fail, so what is recorded is that it was asked for: under
 * `joinGuardRequest.<member>` for a verify or a kick, and
 * `joinGuardRequest.postButton` for the button.
 */
export function auditJoinGuardRequest(
	event: H3Event,
	input: { body: JoinGuardModeratorRequestBody; userId: string | null; requestId: string },
): void {
	const { body, userId, requestId } = input;
	const key = auditKey("joinGuardRequest", userId ?? "postButton");
	const status = `${body.kind.replace(/(?<!^)(?=[A-Z])/gu, " ").toLowerCase()} requested`;
	auditGuildChange(
		event,
		{ [key]: { status: body.kind === "PostButton" ? "none" : "waiting" } },
		{
			[key]: {
				status,
				requestId,
				...(body.kind === "PostButton" ? {} : { checkpointId: body.checkpointId }),
				...(body.kind === "Kick" ? { reason: body.reason?.trim() || null } : {}),
			},
		},
	);
}
