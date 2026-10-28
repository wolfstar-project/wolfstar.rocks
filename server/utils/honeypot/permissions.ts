import type { HoneypotAction, ReadonlyGuildData } from "#server/database/settings/types";
import type { APIGuild, APIGuildMember, APIOverwrite } from "discord-api-types/v10";
import { applicationId } from "#server/utils/command-permissions/discord";
import { memberPermissions } from "#server/utils/discord/admin";
import { ChannelType, PermissionFlagsBits } from "discord-api-types/v10";
import { createError } from "evlog";

/**
 * What the bot needs where the honeypot works, as `/honeypot setup` and
 * `/honeypot edit` ask it (wolfstar, `lib/moderation/honeypot/channel.ts`): the
 * dashboard refuses what the bot would refuse, so a saved trap always works.
 */
const TrapPermissions = {
	ViewChannel: PermissionFlagsBits.ViewChannel,
	SendMessages: PermissionFlagsBits.SendMessages,
	ReadMessageHistory: PermissionFlagsBits.ReadMessageHistory,
	ManageMessages: PermissionFlagsBits.ManageMessages,
} as const;

const ActionPermissions: Record<HoneypotAction, Record<string, bigint>> = {
	Kick: { KickMembers: PermissionFlagsBits.KickMembers },
	Softban: { BanMembers: PermissionFlagsBits.BanMembers },
	Ban: { BanMembers: PermissionFlagsBits.BanMembers },
};

const LogPermissions = {
	ViewChannel: PermissionFlagsBits.ViewChannel,
	SendMessages: PermissionFlagsBits.SendMessages,
	EmbedLinks: PermissionFlagsBits.EmbedLinks,
} as const;

const TRAP_CHANNEL_TYPES: ReadonlySet<ChannelType> = new Set([ChannelType.GuildText]);
const LOG_CHANNEL_TYPES: ReadonlySet<ChannelType> = new Set([
	ChannelType.GuildText,
	ChannelType.GuildAnnouncement,
]);

/** A channel of the server, with what decides who can do what in it. */
export interface HoneypotChannelCandidate {
	id: string;
	type: ChannelType;
	permission_overwrites?: readonly APIOverwrite[];
}

export type HoneypotChannelFailure =
	| { code: "honeypot-unknown-channel" }
	| { code: "honeypot-same-channel" }
	| { code: "honeypot-trap-permissions"; missing: string[] }
	| { code: "honeypot-log-permissions"; missing: string[] };

interface HoneypotChannelInput {
	guild: APIGuild;
	/** The bot's own member in the server. */
	bot: APIGuildMember;
	channels: readonly HoneypotChannelCandidate[];
	/** The trap channel the settings will have; `null` when the honeypot is off. */
	trap: string | null;
	/** The channel the catches are reported to, if any. */
	logs: string | null;
	action: HoneypotAction;
}

/**
 * A member's permissions in a channel, in Discord's order: the server-wide
 * ones, then `@everyone`'s overwrite, the member's roles' together, and the
 * member's own. Administrator holds every permission whatever the overwrites.
 */
function channelPermissions(
	guild: APIGuild,
	member: APIGuildMember,
	channel: HoneypotChannelCandidate,
): bigint {
	let permissions = memberPermissions(guild, member);
	if ((permissions & PermissionFlagsBits.Administrator) !== 0n) return ~0n;

	const overwrites = channel.permission_overwrites ?? [];
	const everyone = overwrites.find((overwrite) => overwrite.id === guild.id);
	if (everyone) permissions = (permissions & ~BigInt(everyone.deny)) | BigInt(everyone.allow);

	const held = new Set(member.roles);
	let allow = 0n;
	let deny = 0n;
	for (const overwrite of overwrites) {
		if (overwrite.id !== guild.id && held.has(overwrite.id)) {
			allow |= BigInt(overwrite.allow);
			deny |= BigInt(overwrite.deny);
		}
	}
	permissions = (permissions & ~deny) | allow;

	const own = overwrites.find((overwrite) => overwrite.id === member.user.id);
	if (own) permissions = (permissions & ~BigInt(own.deny)) | BigInt(own.allow);
	return permissions;
}

function missingIn(
	input: HoneypotChannelInput,
	channel: HoneypotChannelCandidate,
	required: Record<string, bigint>,
): string[] {
	const held = channelPermissions(input.guild, input.bot, channel);
	return Object.entries(required)
		.filter(([, flag]) => (held & flag) !== flag)
		.map(([name]) => name);
}

/**
 * Whether the bot can run the honeypot the settings describe: the trap is a
 * text channel of the server where it can read, write and clean up, and act on
 * who it catches; the catches channel, when there is one, is another channel
 * it can post embeds in. The first problem, or `null`.
 */
export function checkHoneypotChannels(input: HoneypotChannelInput): HoneypotChannelFailure | null {
	if (input.trap === null) return null;
	if (input.logs === input.trap) return { code: "honeypot-same-channel" };

	const trap = input.channels.find((channel) => channel.id === input.trap);
	if (!trap || !TRAP_CHANNEL_TYPES.has(trap.type)) return { code: "honeypot-unknown-channel" };

	const missing = missingIn(input, trap, {
		...TrapPermissions,
		...ActionPermissions[input.action],
	});
	if (missing.length > 0) return { code: "honeypot-trap-permissions", missing };

	if (input.logs === null) return null;
	const logs = input.channels.find((channel) => channel.id === input.logs);
	if (!logs || !LOG_CHANNEL_TYPES.has(logs.type)) return { code: "honeypot-unknown-channel" };

	const missingLogs = missingIn(input, logs, LogPermissions);
	return missingLogs.length > 0
		? { code: "honeypot-log-permissions", missing: missingLogs }
		: null;
}

const HONEYPOT_CHANNEL_KEYS = ["honeypotChannel", "honeypotAction", "honeypotLogChannel"] as const;

const FailureMessages: Record<HoneypotChannelFailure["code"], { why: string; fix: string }> = {
	"honeypot-unknown-channel": {
		why: "The honeypot channel or its catches channel is not a text channel of the server",
		fix: "Pick a text channel of the server",
	},
	"honeypot-same-channel": {
		why: "The catches would be reported in the honeypot channel itself",
		fix: "Pick another channel for the catches, or none",
	},
	"honeypot-trap-permissions": {
		why: "WolfStar lacks permissions it needs in the honeypot channel",
		fix: "Give WolfStar the missing permissions in that channel, or pick another one",
	},
	"honeypot-log-permissions": {
		why: "WolfStar lacks permissions it needs in the catches channel",
		fix: "Give WolfStar the missing permissions in that channel, or pick another one",
	},
};

/**
 * Refuses a change of the honeypot's channels or action the bot could not
 * carry out, with 422 and the failure's code. Discord is asked fresh for the
 * roles, the channels and the bot: `guild` comes from a cache an hour old, and
 * a permission granted or taken a minute ago must count.
 */
export async function assertHoneypotIsUsable(
	guild: APIGuild,
	current: Readonly<Pick<ReadonlyGuildData, (typeof HONEYPOT_CHANNEL_KEYS)[number]>>,
	changes: Partial<ReadonlyGuildData>,
): Promise<void> {
	if (!HONEYPOT_CHANNEL_KEYS.some((key) => key in changes)) return;
	const next = { ...current, ...changes };
	if (next.honeypotChannel === null) return;

	const api = useApi();
	const [roles, channels, bot] = await Promise.all([
		api.guilds.getRoles(guild.id),
		api.guilds.getChannels(guild.id),
		api.guilds.getMember(guild.id, applicationId()),
	]);
	const failure = checkHoneypotChannels({
		guild: { ...guild, roles },
		bot,
		channels,
		trap: next.honeypotChannel,
		logs: next.honeypotLogChannel,
		action: next.honeypotAction,
	});
	if (failure === null) return;

	const missing = "missing" in failure ? ` (${failure.missing.join(", ")})` : "";
	throw createError({
		message: "The honeypot cannot work with these channels",
		status: 422,
		code: failure.code,
		why: `${FailureMessages[failure.code].why}${missing}`,
		fix: FailureMessages[failure.code].fix,
	});
}
