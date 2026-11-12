import type {
	AppealQueueEntry,
	AppealQueueFilter,
	AppealQueueResponse,
	AppealRequestOutcome,
} from "#shared/utils/appeal-queue";
import type { H3Event } from "h3";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError, getQuery } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const GUILD = "777";

function entry(id: string): AppealQueueEntry {
	return {
		id,
		caseId: 42,
		caseType: "Ban",
		formName: null,
		user: { id: "111111111111111111", displayName: "alt_account", avatar: null },
		status: "pending",
		answers: [],
		reason: null,
		reviewer: null,
		createdAt: "2026-11-04T10:02:00.000Z",
		decidedAt: null,
	};
}

let listCalls = 0;
let lastQuery: Record<string, unknown> = {};
let listAnswer: (
	query: Record<string, unknown>,
) => Promise<AppealQueueResponse> | AppealQueueResponse;
let decisionAnswer: () => { requestId: string };
let outcomes: AppealRequestOutcome[] = [];
let lastBody: unknown;
let requestCalls = 0;
/** What the next questions about the request answer with instead of the outcome. */
let requestErrors: number[] = [];

registerEndpoint(`/api/guilds/${GUILD}/appeals`, {
	method: "GET",
	handler: (event) => {
		listCalls += 1;
		lastQuery = getQuery(event);
		return listAnswer(lastQuery);
	},
});

// h3's `readBody` needs Node's `Buffer`, which the browser runner lacks; the
// stub hands the handler the web request, whose body reads as it is.
registerEndpoint(`/api/guilds/${GUILD}/appeals/1/decision`, {
	method: "POST",
	handler: async (event: H3Event) => {
		lastBody = await event.web?.request?.json();
		return decisionAnswer();
	},
});

registerEndpoint(`/api/guilds/${GUILD}/appeals/requests/9`, {
	method: "GET",
	handler: () => {
		const status = requestErrors.shift();
		if (status !== undefined) throw createError({ statusCode: status });
		requestCalls += 1;
		return outcomes[Math.min(requestCalls, outcomes.length) - 1];
	},
});

function response(entries: AppealQueueEntry[], total = entries.length): AppealQueueResponse {
	return {
		entries,
		total,
		counts: { accepted: 3, denied: 1, pending: total },
		canReview: true,
	};
}

function outcome(state: AppealRequestOutcome["state"], code: AppealRequestOutcome["code"] = null) {
	return {
		id: "9",
		state,
		code,
		detail: code ? "A sentence." : null,
	} satisfies AppealRequestOutcome;
}

/** `count` appeals, the `start`th first, as a page of the queue lists them. */
function entries(start: number, count: number): AppealQueueEntry[] {
	return Array.from({ length: Math.max(count, 0) }, (_, index) => entry(String(start + index)));
}

/** A queue of `total` appeals that answers each page from where it is asked to start. */
function pagedList(total: number) {
	return (query: Record<string, unknown>) => {
		const offset = Number(query.offset ?? 0);
		const limit = Number(query.limit);
		return response(entries(offset, Math.min(limit, total - offset)), total);
	};
}

/**
 * A queue that waits for nothing, gives up after `polls` questions, and asks
 * about a decision it gave up on for `follow` more milliseconds.
 */
function queue(polls = 3, follow = 0) {
	const filter = ref<AppealQueueFilter>("pending");
	const wait = vi.fn((_milliseconds: number) => Promise.resolve());
	const onLateResult = vi.fn();
	const result = useAppealQueue(
		{ guildId: GUILD, filter, onLateResult },
		{ interval: 1, timeout: polls, followFor: follow, maxFollowInterval: 8, wait },
	);
	return { ...result, filter, onLateResult, wait };
}

describe("useAppealQueue", () => {
	beforeEach(() => {
		listCalls = 0;
		requestCalls = 0;
		requestErrors = [];
		outcomes = [];
		lastBody = undefined;
		listAnswer = () => response([entry("1")]);
		decisionAnswer = () => ({ requestId: "9" });
		clearNuxtData();
		const nuxtApp = useNuxtApp();
		for (const key of Object.keys(nuxtApp._asyncData)) delete nuxtApp._asyncData[key];
		for (const key of Object.keys(nuxtApp._asyncDataPromises)) {
			delete nuxtApp._asyncDataPromises[key];
		}
	});

	it("reads the appeals of the filter, a page at a time", async () => {
		const { canReview, counts, entries, status, total } = queue();

		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		expect(lastQuery).toMatchObject({ status: "pending", limit: "25", offset: "0" });
		expect(entries.value.map((item) => item.id)).toStrictEqual(["1"]);
		expect(total.value).toBe(1);
		expect(counts.value).toStrictEqual({ accepted: 3, denied: 1, pending: 1 });
		expect(canReview.value).toBe(true);
	});

	it("adds each next page below its rows, past the most one request can ask for", async () => {
		listAnswer = pagedList(140);
		const { entries: rows, hasMore, loadMore, status } = queue();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		for (const offset of ["25", "50", "75", "100", "125"]) {
			await loadMore();
			expect(lastQuery).toMatchObject({ limit: "25", offset });
		}

		expect(rows.value).toHaveLength(140);
		expect(rows.value.at(-1)?.id).toBe("139");
		expect(hasMore.value).toBe(false);
	});

	it("keeps its rows and says so when a page fails, and reads it on the next try", async () => {
		listAnswer = pagedList(40);
		const { entries: rows, loadMore, loadMoreFailed, status } = queue();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		listAnswer = () => {
			throw createError({ statusCode: 500, statusMessage: "Server Error" });
		};
		await loadMore();
		expect(loadMoreFailed.value).toBe(true);
		expect(rows.value).toHaveLength(25);

		listAnswer = pagedList(40);
		await loadMore();
		expect(loadMoreFailed.value).toBe(false);
		expect(rows.value).toHaveLength(40);
	});

	it("lists an appeal once when the pages moved between two reads", async () => {
		listAnswer = pagedList(40);
		const { entries: rows, loadMore, status } = queue();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		// A new appeal came in: the page after starts one row earlier than it did.
		listAnswer = () => response(entries(24, 16), 41);
		await loadMore();

		expect(rows.value.map((item) => item.id)).toStrictEqual(
			entries(0, 40).map((item) => item.id),
		);
	});

	it("drops the pages it read for another filter", async () => {
		listAnswer = pagedList(40);
		const { entries: rows, filter, loadMore, status } = queue();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });
		await loadMore();
		expect(rows.value).toHaveLength(40);

		listAnswer = () => response([entry("900")], 1);
		filter.value = "denied";
		await nextTick();
		expect(rows.value).toStrictEqual([]);
		await vi.waitUntil(() => rows.value.length === 1, { timeout: 2000 });
		expect(lastQuery).toMatchObject({ status: "denied", offset: "0" });
	});

	it("reads its pages again after a decision, so the list keeps its length", async () => {
		outcomes = [outcome("done")];
		listAnswer = pagedList(140);
		const { decide, entries: rows, loadMore, status } = queue();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });
		for (let page = 0; page < 4; page += 1) await loadMore();
		expect(rows.value).toHaveLength(125);

		const queries: Record<string, unknown>[] = [];
		listAnswer = (query) => {
			queries.push(query);
			return pagedList(139)(query);
		};
		await decide("1", "Approve");

		expect(queries.map((query) => [query.offset, query.limit])).toStrictEqual([
			["0", "25"],
			["25", "100"],
		]);
		expect(rows.value).toHaveLength(125);
	});

	it("waits for the bot to do a decision, then reads the list again", async () => {
		outcomes = [outcome("pending"), outcome("done")];
		const { busyId, decide, status, wait } = queue();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });
		const before = listCalls;

		const pending = decide("1", "Approve", "  Thank you. ");
		await vi.waitFor(() => expect(busyId.value).toBe("1"));
		const result = await pending;

		expect(result).toStrictEqual({ ok: true, state: "done" });
		expect(lastBody).toStrictEqual({ decision: "Approve", reason: "Thank you." });
		expect(requestCalls).toBe(2);
		expect(wait).toHaveBeenCalledTimes(2);
		expect(listCalls).toBeGreaterThan(before);
		expect(busyId.value).toBeNull();
	});

	it("sends no reason when it is blank", async () => {
		outcomes = [outcome("done")];
		const { decide, status } = queue();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		await decide("1", "Deny", "   ");

		expect(lastBody).toStrictEqual({ decision: "Deny" });
	});

	it("gives the code the bot refused it with", async () => {
		outcomes = [outcome("failed", "undoFailed")];
		const { decide, status } = queue();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });
		const before = listCalls;

		expect(await decide("1", "Approve")).toStrictEqual({ ok: false, code: "undoFailed" });
		expect(listCalls).toBeGreaterThan(before);
	});

	it("asks again when a question fails, and does not read it as a refusal", async () => {
		requestErrors = [500, 429];
		outcomes = [outcome("done")];
		const { decide, status } = queue(5);
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		expect(await decide("1", "Approve")).toStrictEqual({ ok: true, state: "done" });
		expect(requestCalls).toBe(1);
	});

	it("gives up on a request the guild does not have", async () => {
		requestErrors = [404];
		const { decide, status } = queue(5);
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		expect(await decide("1", "Approve")).toStrictEqual({ ok: false, code: "unknown" });
		expect(requestCalls).toBe(0);
	});

	it("says the bot has not answered when every question failed until the time was up", async () => {
		// ofetch asks once more after a 500, so some questions may get through: to a pending request.
		requestErrors = [500, 500, 500];
		outcomes = [outcome("pending")];
		const { decide, status } = queue(3);
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		expect(await decide("1", "Approve")).toStrictEqual({ ok: true, state: "timeout" });
	});

	it("keeps asking about a late decision, less often, then reads the list and tells how it went", async () => {
		// Two questions while `decide` waits, two more after, and the bot answers the fifth.
		outcomes = [...Array.from({ length: 4 }, () => outcome("pending")), outcome("done")];
		const { decide, onLateResult, status, wait } = queue(2, 1000);
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });
		const before = listCalls;

		expect(await decide("1", "Deny")).toStrictEqual({ ok: true, state: "timeout" });

		await vi.waitFor(() =>
			expect(onLateResult).toHaveBeenCalledExactlyOnceWith(
				{ ok: true, state: "done" },
				"Deny",
			),
		);
		// Once after `decide`, once when the bot answered.
		await vi.waitFor(() => expect(listCalls).toBeGreaterThanOrEqual(before + 2));
		// Twice the interval, doubled each time, up to the longest pause.
		expect(wait.mock.calls.slice(2).map(([pause]) => pause)).toStrictEqual([2, 4, 8]);
	});

	it("stops asking about a late decision once the time to follow it is up", async () => {
		outcomes = [outcome("pending")];
		const { decide, onLateResult, status, wait } = queue(2, 10);
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		await decide("1", "Approve");
		await vi.waitFor(() =>
			expect(wait.mock.calls.slice(2).map(([pause]) => pause)).toStrictEqual([2, 4, 8]),
		);
		await new Promise((resolve) => setTimeout(resolve, 20));

		expect(wait).toHaveBeenCalledTimes(5);
		expect(onLateResult).not.toHaveBeenCalled();
	});

	it("stops asking when the time is up, and says the bot has not answered", async () => {
		outcomes = [outcome("pending")];
		const { decide, status } = queue(3);
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		expect(await decide("1", "Approve")).toStrictEqual({ ok: true, state: "timeout" });
		expect(requestCalls).toBe(3);
	});

	it("reads the list again, and asks nothing, when somebody decided it first", async () => {
		decisionAnswer = () => {
			throw createError({
				statusCode: 409,
				statusMessage: "Conflict",
				data: { code: "decided" },
			});
		};
		const { decide, status } = queue();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });
		const before = listCalls;

		expect(await decide("1", "Approve")).toStrictEqual({ ok: false, code: "decided" });
		expect(requestCalls).toBe(0);
		expect(listCalls).toBeGreaterThan(before);
	});

	it("reads any other refusal as a generic one", async () => {
		decisionAnswer = () => {
			throw createError({ statusCode: 500, statusMessage: "Server Error" });
		};
		const { decide, status } = queue();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		expect(await decide("1", "Approve")).toStrictEqual({ ok: false, code: "generic" });
	});
});
