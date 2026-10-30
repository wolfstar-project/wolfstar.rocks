import { isSnowflake } from "#shared/utils/snowflake";

/**
 * Where and by whom a server lets one of the bot's commands run, as the bot's
 * `/commands` keeps it in `commandsRestrictions`. The bot owns the column and
 * its shape: what reads and writes it here is ported from the bot's
 * `commands-menu/restrictions.ts`, so both write the same entries.
 *
 * - `allowedChannels`: when it has any, the command only runs in them.
 * - `ignoredChannels`: the command does not run in them.
 * - `allowedRoles`, `allowedUsers`: when either has any, only those run it.
 * - `ignoredRoles`, `ignoredUsers`: they never run it, an allowed role or not.
 *
 * `command` is the bot's piece name; a subcommand is ruled with its parent.
 */
export interface CommandRule {
	command: string;
	allowedChannels: string[];
	ignoredChannels: string[];
	allowedRoles: string[];
	ignoredRoles: string[];
	allowedUsers: string[];
	ignoredUsers: string[];
}

export type CommandRuleList = Exclude<keyof CommandRule, "command">;

export const COMMAND_RULE_LISTS = [
	"allowedChannels",
	"ignoredChannels",
	"allowedRoles",
	"ignoredRoles",
	"allowedUsers",
	"ignoredUsers",
] as const satisfies readonly CommandRuleList[];

/**
 * The lists the dashboard edits. The member lists are only set with
 * `/commands` in Discord, and a save from the dashboard keeps them.
 */
export const EDITABLE_COMMAND_RULE_LISTS = [
	"allowedChannels",
	"ignoredChannels",
	"allowedRoles",
	"ignoredRoles",
] as const satisfies readonly CommandRuleList[];

export type EditableCommandRuleList = (typeof EDITABLE_COMMAND_RULE_LISTS)[number];

/**
 * The commands a server can neither disable nor rule: `settings` and
 * `commands` are how the others are turned back on. The bot's
 * `ProtectedCommands`.
 */
export const PROTECTED_COMMANDS: ReadonlySet<string> = new Set(["settings", "commands"]);

function emptyRule(command: string): CommandRule {
	return {
		command,
		allowedChannels: [],
		ignoredChannels: [],
		allowedRoles: [],
		ignoredRoles: [],
		allowedUsers: [],
		ignoredUsers: [],
	};
}

function readList(value: unknown): string[] {
	return Array.isArray(value) ? [...new Set(value.filter((entry) => isSnowflake(entry)))] : [];
}

function merge(into: string[], more: readonly string[]): string[] {
	return [...new Set([...into, ...more])];
}

/**
 * The command rules of a server from what `commandsRestrictions` holds. The
 * column may still hold the older `{ channel, commands }` entries, which mean
 * that each of those commands ignores the channel.
 */
export function readCommandRules(value: unknown): CommandRule[] {
	if (!Array.isArray(value)) return [];

	const rules = new Map<string, CommandRule>();
	const ruleOf = (command: string) => {
		let rule = rules.get(command);
		if (!rule) {
			rule = emptyRule(command);
			rules.set(command, rule);
		}
		return rule;
	};

	for (const entry of value as unknown[]) {
		if (typeof entry !== "object" || entry === null) continue;
		const data = entry as Record<string, unknown>;

		if (typeof data.command === "string" && data.command.length > 0) {
			const rule = ruleOf(data.command);
			for (const list of COMMAND_RULE_LISTS)
				rule[list] = merge(rule[list], readList(data[list]));
		} else if (isSnowflake(data.channel) && Array.isArray(data.commands)) {
			for (const command of data.commands) {
				if (typeof command !== "string" || command.length === 0) continue;
				const rule = ruleOf(command);
				rule.ignoredChannels = merge(rule.ignoredChannels, [data.channel]);
			}
		}
	}

	return [...rules.values()].filter((rule) => !isCommandRuleEmpty(rule));
}

/** Whether a rule rules nothing, and so is not stored. */
export function isCommandRuleEmpty(rule: CommandRule): boolean {
	return COMMAND_RULE_LISTS.every((list) => rule[list].length === 0);
}

/** The rule of a command, an empty one when the server has none for it. */
export function findCommandRule(rules: readonly CommandRule[], command: string): CommandRule {
	return rules.find((rule) => rule.command === command) ?? emptyRule(command);
}

/**
 * Sets the rule of a command among the rules of a server, dropping it when it
 * rules nothing. As the bot does, the rule set goes last.
 */
export function setCommandRule(rules: readonly CommandRule[], rule: CommandRule): CommandRule[] {
	const others = rules.filter((entry) => entry.command !== rule.command);
	const [next] = readCommandRules([rule]);
	return next === undefined ? others : [...others, next];
}

/**
 * The rule to store from what the dashboard picked: the edited lists come from
 * `picked`, and the member lists, which the dashboard does not show, stay as
 * `stored` has them. The dashboard's side of the bot's
 * `keepHiddenRestrictionEntries`; the dashboard lists every entry, so no entry
 * of an edited list is hidden from it.
 */
export function applyCommandRuleEdit(
	stored: CommandRule,
	picked: Readonly<Record<EditableCommandRuleList, readonly string[]>>,
): CommandRule {
	const next: CommandRule = { ...stored };
	for (const list of EDITABLE_COMMAND_RULE_LISTS) next[list] = readList(picked[list]);
	return next;
}

/**
 * The revision of what the editor of a command changes: whether
 * `commandsDisabled` names it, and its rule. The editor sends back the one it
 * opened with, so a save made on what someone else changed since is refused
 * instead of undoing their change. The bot's `getCommandRestrictionRevision`,
 * to the bit: a FNV-1a hash of 32 bits.
 */
export function getCommandRuleRevision(rule: CommandRule, disabled: boolean): number {
	const text = JSON.stringify([disabled, ...COMMAND_RULE_LISTS.map((list) => rule[list])]);
	// The FNV offset basis and prime of 32 bits, 0x811c9dc5 and 0x01000193.
	let hash = 2_166_136_261;
	for (let index = 0; index < text.length; index++) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 16_777_619) >>> 0;
	}
	return hash;
}

/** What the editor of a command opens with, and what a save answers. */
export interface CommandRuleState {
	command: string;
	enabled: boolean;
	rule: CommandRule;
	revision: number;
}

/** What a save answers: the command's state and the two settings it wrote. */
export interface CommandRuleSaved extends CommandRuleState {
	commandsDisabled: string[];
	commandsRestrictions: CommandRule[];
}

/** The settings a command's editor reads and writes. */
export interface CommandRuleSettings {
	commandsDisabled: readonly string[];
	commandsRestrictions: unknown;
}

export function readCommandRuleState(
	settings: CommandRuleSettings,
	command: string,
): CommandRuleState {
	const rule = findCommandRule(readCommandRules(settings.commandsRestrictions), command);
	const disabled = settings.commandsDisabled.includes(command);
	return { command, enabled: !disabled, rule, revision: getCommandRuleRevision(rule, disabled) };
}

/** A save of a command's editor: its status and the lists it edits. */
export interface CommandRuleEdit extends Readonly<
	Record<EditableCommandRuleList, readonly string[]>
> {
	enabled: boolean;
}

/**
 * The settings after a save of a command's editor, as the bot's `/commands`
 * writes them: `commandsDisabled` names the command or not, and
 * `commandsRestrictions` holds its rule with the member lists kept. Every
 * other rule is written back as the bot reads it, so an entry of the older
 * `{ channel, commands }` shape becomes the channels each command ignores.
 */
export function writeCommandRule(
	settings: CommandRuleSettings,
	command: string,
	edit: CommandRuleEdit,
): { commandsDisabled: string[]; commandsRestrictions: CommandRule[] } {
	const rules = readCommandRules(settings.commandsRestrictions);
	const rule = applyCommandRuleEdit(findCommandRule(rules, command), edit);
	const others = settings.commandsDisabled.filter((entry) => entry !== command);
	return {
		commandsDisabled: edit.enabled ? others : [...others, command],
		commandsRestrictions: setCommandRule(rules, rule),
	};
}

/** How many entries the lists the dashboard edits hold together. */
export function countEditableCommandRuleEntries(
	rule: Readonly<Record<EditableCommandRuleList, readonly string[]>>,
): number {
	return EDITABLE_COMMAND_RULE_LISTS.reduce((total, list) => total + rule[list].length, 0);
}
