import type { Announcement } from "#shared/types/announcement";
import { describe, expect, it } from "vitest";
import {
	continuesPost,
	DIRECT_MESSAGE_THREADS,
	groupNewsByDay,
	unreadNews,
} from "~/utils/direct-messages";

const post = (id: string, at: string): Announcement => ({
	apps: [],
	at,
	components: [],
	content: "",
	embeds: [],
	id,
	images: [],
	reactions: [],
	url: "",
});

describe("direct messages", () => {
	it("reads WolfStar's thread from its announcement channel", () => {
		expect(DIRECT_MESSAGE_THREADS.find((thread) => thread.id === "wolfstar")?.source).toBe(
			"/api/announcements/wolfstar",
		);
	});

	it("counts what was posted after the last one read", () => {
		const items = [
			post("1290000000000000001", "2026-10-11T09:00:00Z"),
			post("1290000000000000002", "2026-10-13T09:00:00Z"),
		];

		expect(unreadNews(items, undefined)).toHaveLength(2);
		expect(unreadNews(items, "1290000000000000001").map((item) => item.id)).toStrictEqual([
			"1290000000000000002",
		]);
		expect(unreadNews(items, "1290000000000000002")).toHaveLength(0);
	});

	it("reads a marker from the old release notes as nothing read", () => {
		const items = [post("1290000000000000001", "2026-10-11T09:00:00Z")];

		expect(unreadNews(items, 4)).toHaveLength(1);
		expect(unreadNews(items, "not a snowflake")).toHaveLength(1);
	});

	it("groups messages by the local day they were posted", () => {
		const items = [
			post("1", new Date(2026, 9, 15, 9, 0).toISOString()),
			post("2", new Date(2026, 9, 15, 18, 0).toISOString()),
			post("3", new Date(2026, 9, 16, 8, 0).toISOString()),
		];

		const days = groupNewsByDay(items);

		expect(days.map((day) => day.news.map((item) => item.id))).toStrictEqual([
			["1", "2"],
			["3"],
		]);
		expect(days[0]?.day).toBe(new Date(2026, 9, 15).toISOString());
	});

	it("joins a post to the one before it within seven minutes", () => {
		const first = { at: "2026-11-13T15:59:00Z" };

		expect(continuesPost(undefined, first)).toBe(false);
		expect(continuesPost(first, { at: "2026-11-13T16:01:00Z" })).toBe(true);
		expect(continuesPost(first, { at: "2026-11-13T16:06:00Z" })).toBe(true);
		expect(continuesPost(first, { at: "2026-11-13T16:06:01Z" })).toBe(false);
	});
});
