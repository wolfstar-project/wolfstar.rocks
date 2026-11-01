/**
 * The direct messages the dashboard's Home shows. They are not Discord DMs:
 * WolfStar's thread is the dashboard's release notes, written here and dated
 * by the change they announce, and nobody can reply to it.
 */

/** A bot with a thread on the Home. */
export type DirectMessageThreadId = "wolfstar" | "staryl";

/** What a news embed's button opens. */
export type DirectMessageAction = "language-settings";

export interface DirectMessageNews {
	/** Stable and increasing, so the last one read marks what is unread. */
	id: number;
	/** When it was posted, as an ISO timestamp. */
	at: string;
	/** A plain line above the embed; it is handed the reader's name as `{name}`. */
	textKey?: string;
	embed?: {
		titleKey: string;
		bodyKey: string;
		/** The accent of the embed's left edge. */
		tone: "primary" | "success" | "info";
		action?: { labelKey: string; run: DirectMessageAction };
	};
	/** The reactions offered under the message. */
	reactions: readonly string[];
}

export interface DirectMessageThread {
	id: DirectMessageThreadId;
	name: string;
	avatar: string;
	/** What the thread is for, shown at its top. */
	introKey: string;
	news: readonly DirectMessageNews[];
}

const WOLFSTAR_NEWS: readonly DirectMessageNews[] = [
	{
		at: "2026-10-11T09:12:00Z",
		embed: {
			bodyKey: "dashboard.dm.news.console_body",
			titleKey: "dashboard.dm.news.console_title",
			tone: "primary",
		},
		id: 1,
		reactions: ["👍", "🎉"],
		textKey: "dashboard.dm.news.console_text",
	},
	{
		at: "2026-10-13T17:40:00Z",
		embed: {
			bodyKey: "dashboard.dm.news.automod_body",
			titleKey: "dashboard.dm.news.automod_title",
			tone: "success",
		},
		id: 2,
		reactions: ["👀"],
	},
	{
		at: "2026-10-15T11:05:00Z",
		embed: {
			action: { labelKey: "dashboard.dm.news.language_action", run: "language-settings" },
			bodyKey: "dashboard.dm.news.language_body",
			titleKey: "dashboard.dm.news.language_title",
			tone: "info",
		},
		id: 3,
		reactions: ["👍"],
	},
	{
		at: "2026-10-15T18:30:00Z",
		id: 4,
		reactions: ["🎉", "🐺"],
		textKey: "dashboard.dm.news.rail_text",
	},
];

export const DIRECT_MESSAGE_THREADS: readonly DirectMessageThread[] = [
	{
		avatar: "/avatars/wolfstar.png",
		id: "wolfstar",
		introKey: "dashboard.dm.wolfstar_intro",
		name: "WolfStar",
		news: WOLFSTAR_NEWS,
	},
	{
		avatar: "/avatars/staryl.png",
		id: "staryl",
		introKey: "dashboard.dm.staryl_intro",
		name: "Staryl",
		news: [],
	},
];

/** The news posted after the last one read: all of them before the first visit. */
export function unreadNews(news: readonly DirectMessageNews[], lastRead: number) {
	return news.filter((item) => item.id > lastRead);
}

/** Messages split by the day they were posted, in the reader's time zone. */
export function groupNewsByDay(news: readonly DirectMessageNews[]) {
	const days: { day: string; news: DirectMessageNews[] }[] = [];
	for (const item of news) {
		const posted = new Date(item.at);
		const day = new Date(
			posted.getFullYear(),
			posted.getMonth(),
			posted.getDate(),
		).toISOString();
		const last = days.at(-1);
		if (last?.day === day) last.news.push(item);
		else days.push({ day, news: [item] });
	}
	return days;
}
