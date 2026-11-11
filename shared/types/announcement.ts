/**
 * A post of WolfStar's announcement channel on Discord, as the Home's thread
 * shows it. Mentions in `content` and in embeds are already resolved to names
 * (`<@name>`, `<#name>`), the form `parseDiscordMarkdown()` reads.
 */
export interface Announcement {
	/** The message's snowflake: it grows with time, so it marks what is unread. */
	id: string;
	/** When it was posted, as an ISO timestamp. */
	at: string;
	/** Discord markdown. */
	content: string;
	embeds: AnnouncementEmbed[];
	/** Images attached to the message. */
	images: AnnouncementImage[];
	/** The reactions under it, as Discord counts them. */
	reactions: AnnouncementReaction[];
	/** The message on Discord. */
	url: string;
}

export interface AnnouncementEmbed {
	title?: string;
	/** Where the title links to. */
	url?: string;
	/** Discord markdown. */
	description?: string;
	/** The accent of the embed's left edge, as CSS. */
	color?: string;
	image?: AnnouncementImage;
}

export interface AnnouncementImage {
	url: string;
	width?: number;
	height?: number;
}

export interface AnnouncementReaction {
	/** A Unicode emoji, or a server emoji's name. */
	name: string;
	/** A server emoji's picture; a Unicode emoji has none. */
	image?: string;
	count: number;
}
