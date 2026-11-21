import type { APIChannel, APIGuild, APIGuildMember } from "discord-api-types/v10";
import { applicationId } from "#server/utils/command-permissions/discord";
import { memberChannelPermissions } from "#server/utils/discord/admin";
import { DiscordAPIError } from "@discordjs/rest";
import { ChannelType, PermissionFlagsBits, RESTJSONErrorCodes } from "discord-api-types/v10";

// Ported from `projects/bot/src/lib/moderation/automod/log.ts` in the bot
// (wolfstar-project/wolfstar, V7): the dashboard refuses the log channel the
// bot's own API and `/automod edit` refuse, so the logs of a saved rule go out.

const LOG_CHANNEL_TYPES: ReadonlySet<ChannelType> = new Set([
	ChannelType.GuildText,
	ChannelType.GuildAnnouncement,
]);

const THREAD_TYPES: ReadonlySet<ChannelType> = new Set([
	ChannelType.PublicThread,
	ChannelType.PrivateThread,
	ChannelType.AnnouncementThread,
]);

interface LogChannelInput {
	guild: APIGuild;
	/** The bot's own member in the server. */
	bot: APIGuildMember;
	/** The channel the rule logs to, `null` when Discord does not know it or the bot cannot see it. */
	channel: APIChannel | null;
	/** The channel a thread is in, whose overwrites decide for it; `null` for a channel that is no thread. */
	parent: APIChannel | null;
}

/**
 * What the bot lacks to post the logs of a rule in a channel: to see it, to
 * write in it (in a thread, `SendMessagesInThreads`) and to embed.
 *
 * @returns The names of the permissions the bot lacks, `null` when the channel
 * is not one of the guild or not one a log can go to: a text or announcement
 * channel, or a thread.
 */
export function getMissingAutoModerationLogPermissions(input: LogChannelInput): string[] | null {
	const { guild, bot, channel, parent } = input;
	if (channel === null || !("guild_id" in channel) || channel.guild_id !== guild.id) return null;

	const isThread = THREAD_TYPES.has(channel.type);
	if (!isThread && !LOG_CHANNEL_TYPES.has(channel.type)) return null;
	// The bot takes any thread of the server, a post of a forum as well; its
	// channel has to be read for the overwrites that decide in it:
	if (isThread && parent === null) return null;

	const required = {
		ViewChannel: PermissionFlagsBits.ViewChannel,
		...(isThread
			? { SendMessagesInThreads: PermissionFlagsBits.SendMessagesInThreads }
			: { SendMessages: PermissionFlagsBits.SendMessages }),
		EmbedLinks: PermissionFlagsBits.EmbedLinks,
	};
	const source = isThread ? parent : channel;
	const held = memberChannelPermissions(
		guild,
		bot,
		source !== null && "permission_overwrites" in source ? source : {},
	);
	return Object.entries(required)
		.filter(([, flag]) => (held & flag) !== flag)
		.map(([name]) => name);
}

/** A channel Discord does not know, or that the bot cannot see, reads as none. */
async function fetchChannel(channelId: string): Promise<APIChannel | null> {
	try {
		return await useApi().channels.get(channelId);
	} catch (error) {
		if (
			error instanceof DiscordAPIError &&
			(error.code === RESTJSONErrorCodes.UnknownChannel ||
				error.code === RESTJSONErrorCodes.MissingAccess ||
				error.code === RESTJSONErrorCodes.MissingPermissions)
		) {
			return null;
		}
		throw error;
	}
}

/**
 * Checks the log channel a request gives a rule. Discord is asked fresh for
 * the channel, the roles and the bot: `guild` comes from a cache an hour old,
 * and a permission granted or taken a minute ago must count.
 *
 * @param guild The guild of the rule.
 * @param logChannelId The channel of the request, `undefined` when it gives none and `null` for the moderation channel.
 * @returns What is wrong, written as the other errors of the body are, `null` when nothing is.
 */
export async function checkAutoModerationLogChannel(
	guild: APIGuild,
	logChannelId: string | null | undefined,
): Promise<string | null> {
	if (!logChannelId) return null;

	const api = useApi();
	const channel = await fetchChannel(logChannelId);
	const parentId = channel && "parent_id" in channel ? channel.parent_id : null;
	const [roles, bot, parent] = await Promise.all([
		api.guilds.getRoles(guild.id),
		api.guilds.getMember(guild.id, applicationId()),
		channel && THREAD_TYPES.has(channel.type) && parentId
			? fetchChannel(parentId)
			: Promise.resolve(null),
	]);

	const missing = getMissingAutoModerationLogPermissions({
		guild: { ...guild, roles },
		bot,
		channel,
		parent,
	});
	if (missing === null) {
		return "logChannelId: Expected a text or announcement channel of the guild, or a thread of one.";
	}
	if (missing.length > 0)
		return `logChannelId: The bot lacks ${missing.join(", ")} in the channel.`;
	return null;
}
