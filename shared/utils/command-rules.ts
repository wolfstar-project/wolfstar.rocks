import { isSnowflake } from "#shared/utils/snowflake";

/**
 * Where and by whom a server lets one of the bot's commands run, or a group of
 * them, as the bot's `/commands` keeps it in `commandsRestrictions`. The bot
 * owns the column and its shape: what reads and writes it here is ported from
 * the bot's `commands-menu/restrictions.ts`, so both write the same entries.
 *
 * - `allowedChannels`: when it has any, the command only runs in them.
 * - `ignoredChannels`: the command does not run in them.
 * - `allowedRoles`, `allowedUsers`: an exception, they run the command over an
 *   ignored entry that ranks below them. They limit nobody else.
 * - `ignoredRoles`, `ignoredUsers`: they do not run it. `@everyone` here, the
 *   ID of the guild, keeps it to the allowed ones ("only these"): it is the
 *   status of the rule, not one of its entries.
 *
 * `command` is the target of the rule: a command by the bot's piece name (a
 * subcommand is ruled with its parent), `Category.SubCategory.*`, `Category.*`
 * or `*`. `resolveCommandRules` says what decides between rules.
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
 * The format of the rules the bot writes: a target can name a group of
 * commands, an allowed entry is an exception, and the member's own rule, then
 * the one of their highest role, decide. It is stored as an entry of its own,
 * `{ format: 2 }`, which is not a rule. The bot's `CommandRestrictionsFormat`.
 */
const COMMAND_RULES_FORMAT = 2;

function hasFormatMarker(value: readonly unknown[]): boolean {
	return value.some(
		(entry) =>
			typeof entry === "object" &&
			entry !== null &&
			(entry as { format?: unknown }).format === COMMAND_RULES_FORMAT,
	);
}

/** What `commandsRestrictions` holds for the rules of a server: them and the format's marker. */
export function writeCommandRules(rules: readonly CommandRule[]): unknown[] {
	return [...rules, { format: COMMAND_RULES_FORMAT }];
}

/**
 * The command rules of a server from what `commandsRestrictions` holds. The
 * column may still hold the older `{ channel, commands }` entries, which mean
 * that each of those commands ignores the channel.
 *
 * A list without the format's marker was saved when an allowed role or user
 * meant "only these": its rules that allow someone also ignore `@everyone`,
 * which is what "only these" is now.
 *
 * @param value - What `commandsRestrictions` holds.
 * @param guildId - The ID of the guild, which is the one of its `@everyone` role.
 */
export function readCommandRules(value: unknown, guildId: string): CommandRule[] {
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

	const read = [...rules.values()].filter((rule) => !isCommandRuleEmpty(rule));
	if (hasFormatMarker(value)) return read;

	for (const rule of read) {
		if (rule.allowedRoles.length > 0 || rule.allowedUsers.length > 0) {
			rule.ignoredRoles = readList([...rule.ignoredRoles, guildId]);
		}
	}
	return read;
}

/** Whether a rule rules nothing, and so is not stored. */
export function isCommandRuleEmpty(rule: CommandRule): boolean {
	return COMMAND_RULE_LISTS.every((list) => rule[list].length === 0);
}

/** Whether a rule keeps its command to the allowed roles and users: it ignores `@everyone`. */
export function isCommandRuleOnlyAllowed(rule: CommandRule, guildId: string): boolean {
	return rule.ignoredRoles.includes(guildId);
}

/** A rule without `@everyone`, which is its status and not one of its entries. */
export function withoutEveryone(rule: CommandRule, guildId: string): CommandRule {
	return { ...rule, ignoredRoles: rule.ignoredRoles.filter((id) => id !== guildId) };
}

/** Whether the target of a rule is a group of commands and not a command. */
export function isCommandGroupTarget(target: string): boolean {
	return target === "*" || target.endsWith(".*");
}

/**
 * How specific a target is: a command (`warn`, `Moderation.warn`) is 3, a
 * sub-category (`Moderation.Management.*`) 2, a category (`Moderation.*`) 1 and
 * every command (`*`) 0.
 */
export function getCommandRuleSpecificity(target: string): 0 | 1 | 2 | 3 {
	if (target === "*") return 0;
	if (!target.endsWith(".*")) return 3;
	return target.split(".").length === 2 ? 1 : 2;
}

/**
 * What a target is matched against. `name` is the bot's piece name; the
 * category and the sub-category are the first two directories of its file.
 */
interface RuledCommand {
	name: string;
	category: string | null;
	subCategory: string | null;
}

/** What a legacy node may still call a command that was renamed: the bot's `RenamedCommands`. */
const RENAMED_COMMANDS: Readonly<Record<string, string>> = { conf: "settings" };

function matchesName(name: string, command: RuledCommand): boolean {
	const lowered = name.toLowerCase();
	return command.name.toLowerCase() === (RENAMED_COMMANDS[lowered] ?? lowered);
}

/**
 * Whether a target names a command, which can be `*`, `Category.*`,
 * `Category.SubCategory.*`, or the command with or without its category and
 * sub-category. The bot's `CommandMatcher.match`.
 */
export function matchesCommandRuleTarget(target: string, command: RuledCommand): boolean {
	if (target === "*") return true;

	const [first, second, third, ...others] = target.split(".");
	if (others.length > 0) return false;
	if (second === undefined) return matchesName(target, command);
	if (first !== command.category) return false;
	if (third === undefined) return second === "*" || matchesName(second, command);
	if (second !== command.subCategory) return false;
	return third === "*" || matchesName(third, command);
}

function bySpecificity(a: CommandRule, b: CommandRule): number {
	return getCommandRuleSpecificity(b.command) - getCommandRuleSpecificity(a.command);
}

/** The rules whose target matches a command, the most specific first. */
export function findMatchingCommandRules(
	rules: readonly CommandRule[],
	command: RuledCommand,
): CommandRule[] {
	return rules
		.filter((rule) => matchesCommandRuleTarget(rule.command, command))
		.toSorted(bySpecificity);
}

/**
 * What the rules that match a command leave in force, the most specific first,
 * so a view does not claim what a more specific rule overrides. It is what the
 * bot's `getCommandRulesDenial` goes by:
 *
 * - An ignored channel of any rule denies, so they all stay.
 * - Only the allowed channels of the most specific rule that has some apply.
 * - The most specific rule that lists a member or a role decides for them, and
 *   within a rule ignored comes before allowed. The bot then goes by the
 *   member's own rule and their highest role listed, which takes a member.
 */
export function resolveCommandRules(matching: readonly CommandRule[]): CommandRule[] {
	const decidedRoles = new Set<string>();
	const decidedUsers = new Set<string>();
	let hasAllowedChannels = false;

	const undecided = (ids: readonly string[], decided: ReadonlySet<string>) =>
		ids.filter((id) => !decided.has(id));
	const resolved = matching.toSorted(bySpecificity).map((rule): CommandRule => {
		const ignoredRoles = undecided(rule.ignoredRoles, decidedRoles);
		const ignoredUsers = undecided(rule.ignoredUsers, decidedUsers);
		const allowedRoles = undecided(rule.allowedRoles, decidedRoles).filter(
			(id) => !rule.ignoredRoles.includes(id),
		);
		const allowedUsers = undecided(rule.allowedUsers, decidedUsers).filter(
			(id) => !rule.ignoredUsers.includes(id),
		);
		const allowedChannels = hasAllowedChannels ? [] : rule.allowedChannels;

		for (const id of [...ignoredRoles, ...allowedRoles]) decidedRoles.add(id);
		for (const id of [...ignoredUsers, ...allowedUsers]) decidedUsers.add(id);
		hasAllowedChannels ||= rule.allowedChannels.length > 0;

		return {
			command: rule.command,
			allowedChannels,
			ignoredChannels: rule.ignoredChannels,
			allowedRoles,
			ignoredRoles,
			allowedUsers,
			ignoredUsers,
		};
	});
	return resolved.filter((rule) => !isCommandRuleEmpty(rule));
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
	// A rule that is set is of the current format: it is read as it is.
	const [next] = readCommandRules(writeCommandRules([rule]), "");
	return next === undefined ? others : [...others, next];
}

/**
 * The rule to store from what the dashboard picked: the edited lists come from
 * `picked`, and the member lists, which the dashboard does not show, stay as
 * `stored` has them. The dashboard's side of the bot's
 * `keepHiddenRestrictionEntries`; the dashboard lists every entry, so no entry
 * of an edited list is hidden from it. `@everyone` follows `onlyAllowed`, the
 * status of the rule, whatever the picked roles hold.
 */
export function applyCommandRuleEdit(
	stored: CommandRule,
	picked: CommandRulePick,
	guildId: string,
): CommandRule {
	const next: CommandRule = { ...stored };
	for (const list of EDITABLE_COMMAND_RULE_LISTS) next[list] = readList(picked[list]);
	const { ignoredRoles } = withoutEveryone(next, guildId);
	next.ignoredRoles = picked.onlyAllowed ? [...ignoredRoles, guildId] : ignoredRoles;
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
	/** The rule's status, which `rule` does not hold: see `isCommandRuleOnlyAllowed`. */
	onlyAllowed: boolean;
	rule: CommandRule;
	revision: number;
}

/** What a save answers: the command's state and the two settings it wrote. */
export interface CommandRuleSaved extends CommandRuleState {
	commandsDisabled: string[];
	/** As the column holds it, marker included: `readCommandRules` reads it. */
	commandsRestrictions: unknown[];
}

/** The settings a command's editor reads and writes. */
export interface CommandRuleSettings {
	commandsDisabled: readonly string[];
	commandsRestrictions: unknown;
}

export function readCommandRuleState(
	settings: CommandRuleSettings,
	command: string,
	guildId: string,
): CommandRuleState {
	const rule = findCommandRule(readCommandRules(settings.commandsRestrictions, guildId), command);
	const disabled = settings.commandsDisabled.includes(command);
	return {
		command,
		enabled: !disabled,
		onlyAllowed: isCommandRuleOnlyAllowed(rule, guildId),
		rule: withoutEveryone(rule, guildId),
		revision: getCommandRuleRevision(rule, disabled),
	};
}

/** What the dashboard picks of a rule: the lists it edits, and its status. */
interface CommandRulePick extends Readonly<Record<EditableCommandRuleList, readonly string[]>> {
	onlyAllowed: boolean;
}

/** A save of a command's editor: what it picked of the rule, and if the command is on. */
export interface CommandRuleEdit extends CommandRulePick {
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
	guildId: string,
): { commandsDisabled: string[]; commandsRestrictions: unknown[] } {
	const rules = readCommandRules(settings.commandsRestrictions, guildId);
	const rule = applyCommandRuleEdit(findCommandRule(rules, command), edit, guildId);
	const others = settings.commandsDisabled.filter((entry) => entry !== command);
	return {
		commandsDisabled: edit.enabled ? others : [...others, command],
		commandsRestrictions: writeCommandRules(setCommandRule(rules, rule)),
	};
}

/**
 * How many channels, roles and members some rules name together. `@everyone`
 * is a status and not an entry, but a rule that holds nothing else still counts.
 */
export function countCommandRuleEntries(rules: readonly CommandRule[], guildId: string): number {
	return rules.reduce((total, rule) => {
		const listed = withoutEveryone(rule, guildId);
		const entries = COMMAND_RULE_LISTS.reduce((sum, list) => sum + listed[list].length, 0);
		return total + (entries === 0 && isCommandRuleOnlyAllowed(rule, guildId) ? 1 : entries);
	}, 0);
}
