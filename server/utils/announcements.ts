import type {
	Announcement,
	AnnouncementEmbed,
	AnnouncementImage,
	AnnouncementReaction,
} from "#shared/types/announcement";
import type { APIEmbed, APIMessage, APIReaction } from "discord-api-types/v10";

/** How many of the channel's newest posts the Home shows. */
export const ANNOUNCEMENT_LIMIT = 50;

/** The names a post's mentions are written with, by id. */
export interface MentionNames {
	users: ReadonlyMap<string, string>;
	roles: ReadonlyMap<string, string>;
	channels: ReadonlyMap<string, string>;
}

const MENTION_PATTERN = /<(@!?|@&|#)(\d{17,20})>/g;

/**
 * `content` with each mention written as the name Discord shows, so the
 * reader sees `@Moderator` and `#rules` and never an id. A mention whose
 * target is gone reads as Discord's own placeholder.
 */
export function resolveMentions(content: string, names: MentionNames): string {
	return content.replaceAll(MENTION_PATTERN, (_, kind: string, id: string) => {
		if (kind === "#") return `<#${names.channels.get(id) ?? "unknown"}>`;
		if (kind === "@&") return `<@${names.roles.get(id) ?? "unknown-role"}>`;
		return `<@${names.users.get(id) ?? "unknown-user"}>`;
	});
}

/** The names of the users a message mentions, which Discord sends with it. */
export function mentionedUsers(message: Pick<APIMessage, "mentions">): Map<string, string> {
	return new Map(message.mentions.map((user) => [user.id, user.global_name ?? user.username]));
}

function cssColor(color: number | undefined): string | undefined {
	return color === undefined || color === 0
		? undefined
		: `#${color.toString(16).padStart(6, "0")}`;
}

function toImage(image: APIEmbed["image"]): AnnouncementImage | undefined {
	return image?.url ? { height: image.height, url: image.url, width: image.width } : undefined;
}

function toEmbed(embed: APIEmbed, names: MentionNames): AnnouncementEmbed {
	return {
		color: cssColor(embed.color),
		description: embed.description ? resolveMentions(embed.description, names) : undefined,
		image: toImage(embed.image ?? embed.thumbnail),
		title: embed.title,
		url: embed.url,
	};
}

function toReaction(reaction: APIReaction): AnnouncementReaction {
	const { id, name, animated } = reaction.emoji;
	return {
		count: reaction.count,
		image: id
			? `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "webp"}?size=48`
			: undefined,
		name: name ?? "",
	};
}

/** A message of the announcement channel, as the Home shows it. */
export function toAnnouncement(
	message: APIMessage,
	guildId: string,
	names: MentionNames,
): Announcement {
	const withUsers: MentionNames = {
		...names,
		users: new Map([...names.users, ...mentionedUsers(message)]),
	};
	return {
		at: message.timestamp,
		content: resolveMentions(message.content, withUsers),
		embeds: message.embeds
			.filter((embed) => embed.title || embed.description || embed.image || embed.thumbnail)
			.map((embed) => toEmbed(embed, withUsers)),
		id: message.id,
		images: message.attachments
			.filter((attachment) => attachment.content_type?.startsWith("image/"))
			.map((attachment) => ({
				height: attachment.height ?? undefined,
				url: attachment.url,
				width: attachment.width ?? undefined,
			})),
		reactions: (message.reactions ?? []).map(toReaction),
		url: `https://discord.com/channels/${guildId}/${message.channel_id}/${message.id}`,
	};
}

/**
 * The posts the Home shows, oldest first as a conversation reads: the ones
 * with nothing to show (a pin notice, a bare join message) are left out.
 */
export function toAnnouncements(
	messages: readonly APIMessage[],
	guildId: string,
	names: MentionNames,
): Announcement[] {
	return messages
		.map((message) => toAnnouncement(message, guildId, names))
		.filter(
			(entry) =>
				entry.content.trim().length > 0 ||
				entry.embeds.length > 0 ||
				entry.images.length > 0,
		)
		.toSorted((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
}
