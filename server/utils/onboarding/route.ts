import type {
	OnboardingDiscordFacts,
	OnboardingLogChannelFailure,
} from "#server/utils/onboarding/discord";
import type { OnboardingRefusal } from "#server/utils/onboarding/stages";
import type {
	OnboardingChange,
	OnboardingRecord,
	OnboardingStore,
	OnboardingWeek,
} from "#server/utils/onboarding/store";
import type { OnboardingStage, OnboardingState } from "#shared/utils/onboarding";
import type { APIGuild } from "discord-api-types/v10";
import type { H3Event } from "nitro/h3";
import type { GenericSchema, InferOutput } from "valibot";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import {
	fetchOnboardingDiscordFacts,
	onboardingReadinessInput,
} from "#server/utils/onboarding/discord";
import { guildSettingsUpdate } from "#shared/audit/actions";
import { OnboardingStageIdSchema } from "#shared/schemas/onboarding";
import { onboardingReadiness } from "#shared/utils/onboarding";
import { useLogger, withAuditMethods } from "evlog";
import { createError as createH3Error, getRouterParam } from "nuxt/server";
import { getDotPath, safeParse } from "valibot";

/**
 * `authorize` hook of the onboarding routes: resolves the guild of the path
 * and checks that who asks can manage it. A refusal is audited, as it is for
 * the settings routes.
 */
export const authorizeOnboardingManager = authorizeGuildManager(
	"Insufficient permissions to manage the onboarding",
);

/**
 * A refusal the dashboard can act on. Thrown with h3's `createError` rather
 * than evlog's: its `data` reaches the client in the response body, which is
 * where the page reads the code from.
 */
function onboardingError(statusCode: number, statusMessage: string, data: Record<string, unknown>) {
	return createH3Error({ data, message: statusMessage, statusCode, statusMessage });
}

/**
 * Reads a value with a schema, or answers 400 `{ code: "invalid", errors }`
 * with one `<path>: <message>` per issue.
 */
export function parseOnboardingInput<const Schema extends GenericSchema>(
	schema: Schema,
	input: unknown,
	label = "body",
): InferOutput<Schema> {
	const result = safeParse(schema, input);
	if (result.success) return result.output;

	throw onboardingError(400, "Invalid request", {
		code: "invalid",
		errors: result.issues.map((issue) => `${getDotPath(issue) ?? label}: ${issue.message}`),
	});
}

/** The stage of the path (`:stage`), or 400 when the text is no ID of a row. */
export function readOnboardingStageParam(event: H3Event): string {
	return parseOnboardingInput(OnboardingStageIdSchema, getRouterParam(event, "stage"), "stage");
}

const REFUSAL_RESPONSES = {
	conflict: [409, "The onboarding changed since it was read"],
	invalid: [400, "Invalid request"],
	limit: [400, "Too many stages"],
	nameTaken: [409, "Stage name taken"],
	stage: [400, "Invalid stage"],
	unknown: [404, "Stage not found"],
} as const satisfies Record<OnboardingRefusal["code"], readonly [number, string]>;

/**
 * What a change answered when it went through, or the response of its
 * refusal: `{ code }`, with the `problem` of a stage the bot could not run.
 */
export function unwrapOnboardingChange<Value>(
	change: OnboardingChange<Value, OnboardingRefusal>,
): Value {
	if (change.ok) return change.value;

	const [status, message] = REFUSAL_RESPONSES[change.error.code];
	throw onboardingError(status, message, { ...change.error });
}

/**
 * Answers a log channel the bot cannot report in with 422 and what is wrong:
 * `{ code: "logChannel" }` for a channel that is no text channel of the
 * server, `{ code: "logPermissions", missing }` for one it cannot post in.
 */
export function throwOnboardingLogChannelFailure(failure: OnboardingLogChannelFailure): never {
	throw onboardingError(422, "WolfStar cannot report in this channel", { ...failure });
}

/** Answers a role the bot cannot give with 422 `{ code: "role" }`. */
export function throwOnboardingRoleFailure(): never {
	throw onboardingError(422, "WolfStar cannot give this role", { code: "role" });
}

/** The answer of every onboarding route, from what is stored and what Discord says. */
function buildOnboardingState(
	record: OnboardingRecord,
	week: OnboardingWeek,
	facts: OnboardingDiscordFacts,
): OnboardingState {
	return {
		blockers: onboardingReadiness(onboardingReadinessInput(record, facts)),
		enabled: record.enabled,
		logChannelId: record.logChannelId,
		messageChannelId: record.messageChannelId,
		revision: record.revision,
		stages: record.stages,
		week: week.week,
		weekByStage: week.weekByStage,
	};
}

/**
 * Reads the onboarding of a guild as the routes answer it. A route that
 * already asked Discord for the facts hands them over, so they are asked once.
 */
export async function readOnboardingState(
	store: OnboardingStore,
	guild: APIGuild,
	options: { facts?: OnboardingDiscordFacts; now?: number } = {},
): Promise<OnboardingState> {
	const [record, week, facts] = await Promise.all([
		store.read(guild.id),
		store.countWeek(guild.id, options.now ?? Date.now()),
		options.facts ?? fetchOnboardingDiscordFacts(guild),
	]);
	return buildOnboardingState(record, week, facts);
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
 * Records a change to a stage in the audit chain. A stage has no settings key
 * of its own, so its fields are filed under `onboardingStage.<name>`.
 */
export function auditOnboardingStageChange(
	event: H3Event,
	before: Partial<OnboardingStage> | null,
	after: Partial<OnboardingStage> | null,
	name: string,
): void {
	const key = auditKey("onboardingStage", name);
	auditGuildChange(
		event,
		before === null ? {} : { [key]: before },
		after === null ? {} : { [key]: after },
	);
}

/** Records a change of the order of the stages, by their names, under `onboarding.order`. */
export function auditOnboardingOrderChange(
	event: H3Event,
	before: readonly string[],
	after: readonly string[],
): void {
	auditGuildChange(event, { "onboarding.order": before }, { "onboarding.order": after });
}

/** Records a change of the log channel under `onboarding.logChannel`. */
export function auditOnboardingLogChannelChange(
	event: H3Event,
	before: string | null,
	after: string | null,
): void {
	if (before === after) return;
	auditGuildChange(
		event,
		{ "onboarding.logChannel": before },
		{ "onboarding.logChannel": after },
	);
}
