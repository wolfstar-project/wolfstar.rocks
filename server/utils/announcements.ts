import type {
	Announcement,
	AnnouncementApp,
	AnnouncementBlock,
	AnnouncementComponent,
	AnnouncementEmbed,
	AnnouncementImage,
	AnnouncementLink,
	AnnouncementMedia,
	AnnouncementReaction,
} from "#shared/types/announcement";
import {
	ButtonStyle,
	ComponentType,
	SeparatorSpacingSize,
	type APIComponentInContainer,
	type APIComponentInMessageActionRow,
	type APIEmbed,
	type APIMediaGalleryItem,
	type APIMessage,
	type APIMessageTopLevelComponent,
	type APIReaction,
	type APISectionComponent,
} from "discord-api-types/v10";

/** How many of the channel's newest posts the Home shows. */
export const ANNOUNCEMENT_LIMIT = 50;

/** The names a post's mentions are written with, by id. */
export interface MentionNames {
	users: ReadonlyMap<string, string>;
	roles: ReadonlyMap<string, string>;
	channels: ReadonlyMap<string, string>;
}

/**
 * The links Discord unfurls into an app's card: its OAuth2 invite, and its
 * page in the App Directory. The app's id is the first group.
 */
const APP_INVITE_PATTERN =
	/https?:\/\/(?:(?:www|canary|ptb)\.)?discord(?:app)?\.com\/(?:(?:api\/)?oauth2\/authorize\?(?:[^\s<>]*?&)?client_id=|(?:application-directory|discovery\/applications)\/)(\d{17,20})(?:[^\s<>)\d][^\s<>)]*)?/g;

/** Sentence punctuation and markdown that can follow a bare link. */
const TRAILING_MARKS = /[.,;:!?*_~|]+$/;

/**
 * An escaped character, which is literal text, and code, which shows its
 * pipes as text and never unfurls a link. Both are left out before spoilers
 * are found, so their pipes cannot pair with a spoiler's. An escape is read
 * first, so an escaped backtick does not open code. Like the page's reader,
 * a backslash escapes only a mark, never a letter, digit or space.
 */
const LITERAL_PATTERN = /\\[^\p{L}\p{N}\s]|(`+)[\s\S]*?\1/gu;

/** Text the author hid behind `||…||` until the reader reveals it. */
const SPOILER_PATTERN = /\|\|[\s\S]*?\|\|/g;

/**
 * The apps a post invites to, each once, in the order it links them. A link
 * inside a spoiler gets no card: the card would show the app before the
 * reader chose to reveal it.
 */
export function appInvites(content: string): { id: string; url: string }[] {
	const found = new Map<string, string>();
	const visible = content.replaceAll(LITERAL_PATTERN, " ").replaceAll(SPOILER_PATTERN, " ");
	for (const [match, id] of visible.matchAll(APP_INVITE_PATTERN)) {
		// A link at the end of a sentence or inside `**` or `~~` runs into
		// the marks after it, which are not part of its address.
		const url = match.replace(TRAILING_MARKS, "");
		if (id && !found.has(id)) found.set(id, url);
	}
	return Array.from(found, ([id, url]) => ({ id, url }));
}

/** The part of an app's public profile, `GET /applications/{id}/rpc`, its card shows. */
export interface ApplicationProfile {
	id: string;
	name: string;
	description?: string;
	icon?: string | null;
	cover_image?: string | null;
	/**
	 * The banner of the app's bot user, which Discord shows when the app has
	 * no cover image. Not part of the profile: read from the bot user.
	 */
	bot_banner?: string | null;
}

/** Whether Discord answered with a profile the card can be drawn from. */
export function isApplicationProfile(value: unknown): value is ApplicationProfile {
	if (typeof value !== "object" || value === null) return false;
	const { id, name } = value as Record<string, unknown>;
	return typeof id === "string" && typeof name === "string";
}

/** An app's card, from its public profile, for the invite link a post wrote. */
export function toAppCard(profile: ApplicationProfile, url: string): AnnouncementApp {
	const image = (hash: string | null | undefined, size: number) =>
		hash
			? `https://cdn.discordapp.com/app-icons/${profile.id}/${hash}.webp?size=${size}`
			: undefined;
	return {
		cover:
			image(profile.cover_image, 1024) ??
			(profile.bot_banner
				? `https://cdn.discordapp.com/banners/${profile.id}/${profile.bot_banner}.webp?size=1024`
				: undefined),
		description: profile.description?.trim() || undefined,
		icon: image(profile.icon, 160),
		id: profile.id,
		name: profile.name,
		url,
	};
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

function toMedia(item: Omit<APIMediaGalleryItem, "spoiler">): AnnouncementMedia {
	return {
		alt: item.description ?? undefined,
		height: item.media.height ?? undefined,
		url: item.media.url,
		width: item.media.width ?? undefined,
	};
}

/** A link button; the others act through the bot, which the dashboard cannot. */
function toLink(button: APIComponentInMessageActionRow): AnnouncementLink | undefined {
	if (button.type !== ComponentType.Button || button.style !== ButtonStyle.Link) return undefined;
	const label = button.label ?? button.emoji?.name;
	return label ? { label, url: button.url } : undefined;
}

function toSectionAccessory(
	accessory: APISectionComponent["accessory"],
): Extract<AnnouncementBlock, { kind: "section" }>["accessory"] {
	// A spoilered thumbnail is left out, as a spoilered link gets no card.
	if (accessory.type === ComponentType.Thumbnail) {
		return accessory.spoiler ? undefined : { image: toMedia(accessory), kind: "thumbnail" };
	}
	const link = toLink(accessory);
	return link && { kind: "link", ...link };
}

/**
 * A part of a layout, or `undefined` for one with nothing a reader of the
 * dashboard can see or use: a file, a select menu, a row of bot buttons.
 */
function toBlock(
	component: APIComponentInContainer,
	names: MentionNames,
): AnnouncementBlock | undefined {
	switch (component.type) {
		case ComponentType.TextDisplay:
			return { content: resolveMentions(component.content, names), kind: "text" };
		case ComponentType.Section:
			return {
				accessory: toSectionAccessory(component.accessory),
				kind: "section",
				texts: component.components.map((text) => resolveMentions(text.content, names)),
			};
		case ComponentType.Separator:
			return {
				divider: component.divider ?? true,
				kind: "separator",
				spacing: component.spacing === SeparatorSpacingSize.Large ? "large" : "small",
			};
		case ComponentType.MediaGallery: {
			const images = component.items.filter((item) => !item.spoiler).map(toMedia);
			return images.length > 0 ? { images, kind: "gallery" } : undefined;
		}
		case ComponentType.ActionRow: {
			const links = component.components.flatMap((button) => toLink(button) ?? []);
			return links.length > 0 ? { kind: "links", links } : undefined;
		}
		default:
			return undefined;
	}
}

/** A message's Components V2 layout, without the parts the dashboard cannot draw. */
function toComponents(
	components: readonly APIMessageTopLevelComponent[],
	names: MentionNames,
): AnnouncementComponent[] {
	return components.flatMap((component): AnnouncementComponent | [] => {
		if (component.type !== ComponentType.Container) return toBlock(component, names) ?? [];
		return {
			accent: cssColor(component.accent_color ?? undefined),
			components: component.components.flatMap((child) => toBlock(child, names) ?? []),
			kind: "container",
		};
	});
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
	apps: ReadonlyMap<string, ApplicationProfile> = new Map(),
): Announcement {
	const withUsers: MentionNames = {
		...names,
		users: new Map([...names.users, ...mentionedUsers(message)]),
	};
	return {
		apps: appInvites(message.content).flatMap(({ id, url }) => {
			const profile = apps.get(id);
			return profile ? [toAppCard(profile, url)] : [];
		}),
		at: message.timestamp,
		components: toComponents(message.components ?? [], withUsers),
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
	apps: ReadonlyMap<string, ApplicationProfile> = new Map(),
): Announcement[] {
	return messages
		.map((message) => toAnnouncement(message, guildId, names, apps))
		.filter(
			(entry) =>
				entry.content.trim().length > 0 ||
				entry.embeds.length > 0 ||
				entry.components.length > 0 ||
				entry.images.length > 0,
		)
		.toSorted((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
}
