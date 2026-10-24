import type { DirectMessageNews } from "~/utils/direct-messages";
import { describe, expect, it } from "vitest";
import { DIRECT_MESSAGE_THREADS, groupNewsByDay, unreadNews } from "~/utils/direct-messages";

const news = (id: number, at: string): DirectMessageNews => ({ at, id, reactions: [] });

describe("direct messages", () => {
	it("numbers each thread's news in posting order, so a read marker works", () => {
		for (const thread of DIRECT_MESSAGE_THREADS) {
			const ids = thread.news.map((item) => item.id);
			const times = thread.news.map((item) => Date.parse(item.at));
			expect(ids).toStrictEqual(ids.toSorted((a, b) => a - b));
			expect(new Set(ids).size).toBe(ids.length);
			expect(times).toStrictEqual(times.toSorted((a, b) => a - b));
		}
	});

	it("counts what was posted after the last one read", () => {
		const items = [news(1, "2026-10-11T09:00:00Z"), news(2, "2026-10-13T09:00:00Z")];

		expect(unreadNews(items, 0)).toHaveLength(2);
		expect(unreadNews(items, 1).map((item) => item.id)).toStrictEqual([2]);
		expect(unreadNews(items, 2)).toHaveLength(0);
	});

	it("groups messages by the local day they were posted", () => {
		const items = [
			news(1, new Date(2026, 9, 15, 9, 0).toISOString()),
			news(2, new Date(2026, 9, 15, 18, 0).toISOString()),
			news(3, new Date(2026, 9, 16, 8, 0).toISOString()),
		];

		const days = groupNewsByDay(items);

		expect(days.map((day) => day.news.map((item) => item.id))).toStrictEqual([[1, 2], [3]]);
		expect(days[0]?.day).toBe(new Date(2026, 9, 15).toISOString());
	});
});
