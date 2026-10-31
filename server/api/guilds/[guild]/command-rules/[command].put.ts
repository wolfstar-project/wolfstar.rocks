import type { CommandRule, CommandRuleSaved } from "#shared/utils/command-rules";
import type { H3Event } from "h3";
import { writeSettingsTransaction } from "#server/database";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { findRuledCommand, getCommandRuleParam } from "#server/utils/command-rules/command";
import {
	assertCommandSettingsUnchanged,
	commandRuleConflict,
} from "#server/utils/command-rules/write";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import { guildSettingsAccessDenied, guildSettingsUpdate } from "#shared/audit/actions";
import { CommandRulePutSchema } from "#shared/schemas/command-rules";
import {
	COMMAND_RULE_LISTS,
	PROTECTED_COMMANDS,
	findCommandRule,
	readCommandRuleState,
	readCommandRules,
	writeCommandRule,
	type CommandRuleSettings,
} from "#shared/utils/command-rules";
import { createError, useLogger, withAuditMethods } from "evlog";
import { parse } from "valibot";

function ruleOf(settings: CommandRuleSettings, command: string, guildId: string): CommandRule {
	return findCommandRule(readCommandRules(settings.commandsRestrictions, guildId), command);
}

/**
 * What the audit row records of a save: what changed of `commandsDisabled` and
 * of the lists of the command's rule, by its name, so the change reads as the
 * lists that changed rather than as the positions the bot's column moved them
 * to. `auditDiff` replaces every array it meets, so the unchanged ones are
 * left out here.
 */
function auditedChanges(
	before: CommandRuleSettings,
	after: CommandRuleSettings,
	command: string,
	guildId: string,
): { before: Record<string, unknown>; after: Record<string, unknown> } {
	const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
	const result = { before: {} as Record<string, unknown>, after: {} as Record<string, unknown> };
	if (!same(before.commandsDisabled, after.commandsDisabled)) {
		result.before.commandsDisabled = [...before.commandsDisabled];
		result.after.commandsDisabled = [...after.commandsDisabled];
	}

	const ruleBefore = ruleOf(before, command, guildId);
	const ruleAfter = ruleOf(after, command, guildId);
	const lists = COMMAND_RULE_LISTS.filter((list) => !same(ruleBefore[list], ruleAfter[list]));
	if (lists.length > 0) {
		result.before.commandsRestrictions = {
			[command]: Object.fromEntries(lists.map((list) => [list, ruleBefore[list]])),
		};
		result.after.commandsRestrictions = {
			[command]: Object.fromEntries(lists.map((list) => [list, ruleAfter[list]])),
		};
	}
	return result;
}

function deniedProtected(event: H3Event, command: string): void {
	const { guild, member } = useManagedGuild(event);
	withAuditMethods(useLogger(event)).audit(
		guildSettingsAccessDenied({
			actor: { type: "user", id: member.user.id, displayName: member.user.username },
			target: { type: "guild", id: guild.id },
			outcome: "denied",
			reason: `The ${command} command cannot be disabled or ruled`,
		}),
	);
}

/**
 * `PUT /api/guilds/:guild/command-rules/:command`: turns a command on or off
 * and sets the lists of its rule the dashboard edits, as the bot's `/commands`
 * saves them (`interaction-handlers/commands.ts`). The member lists are kept.
 * A save whose revision is not the stored one is refused, since it would undo
 * what someone saved since the editor opened.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<CommandRuleSaved> => {
		const { guild, member } = useManagedGuild(event);
		const command = getCommandRuleParam(event);
		const body = await readValidatedBody(event, (value) => parse(CommandRulePutSchema, value));

		const { known, guarded } = await findRuledCommand(command);
		if (!known) {
			throw createError({
				message: "Unknown command",
				status: 404,
				code: "unknown-command",
				why: `WolfStar has no command named ${command}`,
				fix: "Reload the commands: the command may have been renamed or removed",
			});
		}
		if (guarded || PROTECTED_COMMANDS.has(command)) {
			deniedProtected(event, command);
			throw createError({
				message: "This command cannot be changed",
				status: 403,
				code: "protected",
				why: `${command} is how the other commands are turned back on`,
				fix: "Leave this command on and without rules",
			});
		}

		using trx = await writeSettingsTransaction(guild.id);
		if (readCommandRuleState(trx.settings, command, guild.id).revision !== body.revision) {
			throw commandRuleConflict();
		}

		const before: CommandRuleSettings = {
			commandsDisabled: [...trx.settings.commandsDisabled],
			commandsRestrictions: trx.settings.commandsRestrictions,
		};
		await trx
			.write(writeCommandRule(trx.settings, command, body, guild.id))
			.submit(undefined, assertCommandSettingsUnchanged(guild.id, before));
		const changes = auditedChanges(before, trx.settings, command, guild.id);

		withAuditMethods(useLogger(event)).audit(
			guildSettingsUpdate({
				actor: { type: "user", id: member.user.id, displayName: member.user.username },
				target: { type: "guild", id: guild.id },
				outcome: "success",
				changes: compactSettingsChanges(changes.before, changes.after),
			}),
		);

		return {
			...readCommandRuleState(trx.settings, command, guild.id),
			commandsDisabled: [...trx.settings.commandsDisabled],
			commandsRestrictions: [...trx.settings.commandsRestrictions],
		};
	},
	{
		auth: true,
		authorize: authorizeGuildManager("Insufficient permissions to change command rules"),
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 5, window: seconds(10) },
	},
);
