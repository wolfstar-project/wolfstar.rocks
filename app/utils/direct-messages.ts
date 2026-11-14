import type { Announcement } from "#shared/types/announcement";

/**
 * The direct messages the dashboard's Home shows. They are not Discord DMs:
 * WolfStar's thread shows the posts of its announcement channel, and nobody
 * can reply to it.
 */

/** A bot with a thread on the Home. */
export type DirectMessageThreadId = "wolfstar" | "staryl";

export interface DirectMessageThreadInfo {
	id: DirectMessageThreadId;
	name: string;
	avatar: string;
	/** What the thread is for, shown at its top. */
	introKey: string;
	/** The route its posts are read from; a thread without one has none yet. */
	source?: string;
}

export interface DirectMessageThread extends DirectMessageThreadInfo {
	news: readonly Announcement[];
}

export const DIRECT_MESSAGE_THREADS: readonly DirectMessageThreadInfo[] = [
	{
		avatar: "/avatars/wolfstar.png",
		id: "wolfstar",
		introKey: "dashboard.dm.wolfstar_intro",
		name: "WolfStar",
		source: "/api/announcements/wolfstar",
	},
	{
		avatar: "/avatars/staryl.png",
		id: "staryl",
		introKey: "dashboard.dm.staryl_intro",
		name: "Staryl",
	},
];

/**
 * The snowflake a read marker holds. A marker from before the thread read
 * Discord is a small number, older than every post, so it reads as nothing read.
 */
function markerOf(lastRead: unknown): bigint {
	return typeof lastRead === "string" && /^\d{1,20}$/.test(lastRead) ? BigInt(lastRead) : 0n;
}

/** The news posted after the last one read: all of them before the first visit. */
export function unreadNews(news: readonly Announcement[], lastRead: unknown): Announcement[] {
	const marker = markerOf(lastRead);
	return news.filter((item) => BigInt(item.id) > marker);
}

/** Messages split by the day they were posted, in the reader's time zone. */
export function groupNewsByDay<T extends { at: string }>(news: readonly T[]) {
	const days: { day: string; news: T[] }[] = [];
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
