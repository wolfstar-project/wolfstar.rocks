import type { OnboardingRecord } from "#server/utils/onboarding/store";
import type { OnboardingReadinessInput } from "#shared/utils/onboarding";
import type { APIGuild, APIGuildMember, APIOverwrite, APIRole } from "discord-api-types/v10";
import { applicationId } from "#server/utils/command-permissions/discord";
import { memberChannelPermissions, memberPermissions } from "#server/utils/discord/admin";
import { useApi } from "#server/utils/shared";
import { ChannelType, GuildFeature, PermissionFlagsBits } from "discord-api-types/v10";

/** What the bot needs in a channel to report the onboarding there. */
const LogPermissions = {
	ViewChannel: PermissionFlagsBits.ViewChannel,
	SendMessages: PermissionFlagsBits.SendMessages,
	EmbedLinks: PermissionFlagsBits.EmbedLinks,
} as const;

const LOG_CHANNEL_TYPES: ReadonlySet<ChannelType> = new Set([
	ChannelType.GuildText,
	ChannelType.GuildAnnouncement,
]);

/** A channel of the server, with what decides who can do what in it. */
interface OnboardingChannel {
	id: string;
	type: ChannelType;
	permission_overwrites?: readonly APIOverwrite[];
}

/**
 * What Discord says of a server that decides whether the bot can run its
 * onboarding: its features, its roles and channels, the bot's own member, and
 * whether Discord's own onboarding is on.
 */
export interface OnboardingDiscordFacts {
	/** The server, with the roles as they are now. */
	guild: APIGuild;
	/** The bot's own member in the server. */
	bot: APIGuildMember;
	channels: readonly OnboardingChannel[];
	nativeOnboarding: boolean;
}

/**
 * Asks Discord for the facts, fresh: `guild` comes from a cache an hour old,
 * and a permission granted, or Community turned on, a minute ago must count.
 */
export async function fetchOnboardingDiscordFacts(
	guild: APIGuild,
): Promise<OnboardingDiscordFacts> {
	const api = useApi();
	const [live, roles, channels, bot] = await Promise.all([
		api.guilds.get(guild.id),
		api.guilds.getRoles(guild.id),
		api.guilds.getChannels(guild.id),
		api.guilds.getMember(guild.id, applicationId()),
	]);
	// Discord has no onboarding to read for a server without Community.
	const onboarding = live.features.includes(GuildFeature.Community)
		? await api.guilds.getOnboarding(guild.id)
		: null;
	return {
		bot,
		channels,
		guild: { ...guild, features: live.features, roles },
		nativeOnboarding: onboarding?.enabled === true,
	};
}

/** The permissions of `required` the bot lacks in a channel, by Discord's names. */
function missingIn(
	facts: OnboardingDiscordFacts,
	channel: OnboardingChannel,
	required: Record<string, bigint>,
): string[] {
	const held = memberChannelPermissions(facts.guild, facts.bot, channel);
	return Object.entries(required)
		.filter(([, flag]) => (held & flag) !== flag)
		.map(([name]) => name);
}

/** Why a channel cannot be the log channel, or `null` when the bot can report there. */
export type OnboardingLogChannelFailure =
	| { code: "logChannel" }
	| { code: "logPermissions"; missing: string[] };

/**
 * Whether the bot can report the onboarding in a channel: a text or
 * announcement channel of the server where it sees, writes and embeds.
 */
export function checkOnboardingLogChannel(
	facts: OnboardingDiscordFacts,
	channelId: string,
): OnboardingLogChannelFailure | null {
	const channel = facts.channels.find((candidate) => candidate.id === channelId);
	if (!channel || !LOG_CHANNEL_TYPES.has(channel.type)) return { code: "logChannel" };

	const missing = missingIn(facts, channel, LogPermissions);
	return missing.length > 0 ? { code: "logPermissions", missing } : null;
}

/** The position of the bot's highest role: it gives only the roles below it. */
function highestRolePosition(roles: readonly APIRole[], bot: APIGuildMember): number {
	const held = new Set(bot.roles);
	return roles.reduce((top, role) => (held.has(role.id) ? Math.max(top, role.position) : top), 0);
}

/**
 * Whether the bot can give a role to a member who passes a stage: a role of
 * the server that is not `@everyone`, that no integration manages, and that
 * sits below the bot's own highest role.
 */
export function canGiveOnboardingRole(facts: OnboardingDiscordFacts, roleId: string): boolean {
	const role = facts.guild.roles.find((candidate) => candidate.id === roleId);
	if (!role || role.id === facts.guild.id || role.managed) return false;
	return role.position < highestRolePosition(facts.guild.roles, facts.bot);
}

function logChannelReadiness(
	facts: OnboardingDiscordFacts,
	channelId: string | null,
): OnboardingReadinessInput["logChannel"] {
	if (channelId === null) return null;
	const failure = checkOnboardingLogChannel(facts, channelId);
	if (failure === null) return { found: true, missing: [] };
	return failure.code === "logChannel"
		? { found: false }
		: { found: true, missing: failure.missing };
}

/** What the readiness check reads, from the stored onboarding and what Discord says. */
export function onboardingReadinessInput(
	record: OnboardingRecord,
	facts: OnboardingDiscordFacts,
): Omit<OnboardingReadinessInput, "captchaAvailable"> {
	const permissions = memberPermissions(facts.guild, facts.bot);
	const isAdministrator = (permissions & PermissionFlagsBits.Administrator) !== 0n;
	const holds = (flag: bigint) => isAdministrator || (permissions & flag) === flag;

	return {
		bot: {
			highestRolePosition: highestRolePosition(facts.guild.roles, facts.bot),
			kickMembers: holds(PermissionFlagsBits.KickMembers),
			manageRoles: holds(PermissionFlagsBits.ManageRoles),
			moderateMembers: holds(PermissionFlagsBits.ModerateMembers),
		},
		community: facts.guild.features.includes(GuildFeature.Community),
		logChannel: logChannelReadiness(facts, record.logChannelId),
		// A message in a channel that is gone is no message.
		messagePosted:
			record.messageChannelId !== null &&
			facts.channels.some((channel) => channel.id === record.messageChannelId),
		nativeOnboarding: facts.nativeOnboarding,
		roles: facts.guild.roles
			// `@everyone` is no role a stage can give.
			.filter((role) => role.id !== facts.guild.id)
			.map((role) => ({ id: role.id, managed: role.managed, position: role.position })),
		stages: record.stages,
	};
}
