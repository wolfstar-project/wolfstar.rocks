import type { AutoModerationRule } from "#shared/utils/automod-rules";
import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import type { H3Event } from "h3";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { AutoModerationRuleError } from "#server/utils/automod/rules";
import { guildSettingsAccessDenied, guildSettingsUpdate } from "#shared/audit/actions";
import { createError, useLogger, withAuditMethods } from "evlog";
import { createError as createH3Error } from "h3";

interface ManagedGuild {
	guild: APIGuild;
	member: APIGuildMember;
}

// The `authorize` hook cannot hand its result to the handler, and resolving
// the member twice would cost a second Discord round trip per request.
const managedGuilds = new WeakMap<H3Event, ManagedGuild>();

/**
 * `authorize` hook of the auto-moderation rule routes: resolves the guild of
 * the path and checks that who asks can manage it. A refusal is audited, as it
 * is for the settings routes.
 */
export async function authorizeAutoModerationManager(event: H3Event): Promise<void> {
	const log = withAuditMethods(useLogger(event));
	const guildId = getGuildParam(event);

	const guild = await getGuild(guildId);
	if (!guild) {
		throw createError({
			message: "Guild not found",
			status: 404,
			why: `The bot is not a member of guild ${guildId}`,
			fix: "check bot is a member of the guild",
		});
	}

	const member = await getCurrentMember(event, guild.id);
	log.set({ guild: { id: guildId }, member: { id: member.user.id } });

	try {
		await canManage(guild, member);
	} catch (error) {
		const status =
			error instanceof Error && "status" in error
				? (error as { status: number }).status
				: null;
		if (status === 403) {
			log.audit(
				guildSettingsAccessDenied({
					actor: { type: "user", id: member.user.id, displayName: member.user.username },
					target: { type: "guild", id: guild.id },
					outcome: "denied",
					reason: "Insufficient permissions to manage auto-moderation rules",
				}),
			);
		}
		throw error;
	}

	managedGuilds.set(event, { guild, member });
}

/** The guild and member {@linkcode authorizeAutoModerationManager} resolved. */
export function useManagedGuild(event: H3Event): ManagedGuild {
	const managed = managedGuilds.get(event);
	if (!managed) {
		throw createError({
			message: "Guild authorization did not run",
			status: 500,
			why: "The route handler ran without its authorize hook",
			fix: "Pass authorizeAutoModerationManager as the route's authorize option",
		});
	}
	return managed;
}

/**
 * A refusal the rule editor can act on. Thrown with h3's `createError` rather
 * than evlog's: its `data` reaches the client in the response body, which is
 * where `useAutomodRules()` reads the code from.
 */
function ruleError(statusCode: number, statusMessage: string, data: Record<string, unknown>) {
	return createH3Error({ statusCode, statusMessage, message: statusMessage, data });
}

const RULE_ERROR_RESPONSES = {
	limit: [400, "Too many rules"],
	nameInvalid: [400, "Rule name invalid"],
	nameTaken: [409, "Rule name taken"],
	unknown: [404, "Rule not found"],
} as const satisfies Record<AutoModerationRuleError["code"], readonly [number, string]>;

/**
 * Answers a request with what went wrong when a rule was created, edited or
 * deleted. Anything that is not an {@linkcode AutoModerationRuleError} is
 * thrown again as it is.
 */
export function throwAutoModerationRuleError(error: unknown): never {
	if (!(error instanceof AutoModerationRuleError)) throw error;

	const [status, message] = RULE_ERROR_RESPONSES[error.code];
	throw ruleError(status, message, { code: error.code });
}

/** Answers a request whose body the rule validator refused. */
export function throwInvalidRuleBody(errors: readonly string[]): never {
	throw ruleError(400, "Invalid rule", { code: "invalid", errors });
}

/**
 * Records a change to the rules of a guild in the audit chain. A rule has no
 * settings key of its own, so its fields are filed under `automodRule.<name>`.
 */
export function auditAutoModerationRuleChange(
	event: H3Event,
	before: Partial<AutoModerationRule> | null,
	after: Partial<AutoModerationRule> | null,
	name: string,
): void {
	const { guild, member } = useManagedGuild(event);
	const key = `automodRule.${name}`;

	withAuditMethods(useLogger(event)).audit(
		guildSettingsUpdate({
			actor: { type: "user", id: member.user.id, displayName: member.user.username },
			target: { type: "guild", id: guild.id },
			outcome: "success",
			changes: compactSettingsChanges(
				before === null ? {} : { [key]: before },
				after === null ? {} : { [key]: after },
			),
		}),
	);
}
