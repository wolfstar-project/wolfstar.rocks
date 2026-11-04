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
let listAnswer: () => Promise<AppealQueueResponse> | AppealQueueResponse;
let decisionAnswer: () => { requestId: string };
let outcomes: AppealRequestOutcome[] = [];
let lastBody: unknown;
let requestCalls = 0;

registerEndpoint(`/api/guilds/${GUILD}/appeals`, {
	method: "GET",
	handler: (event) => {
		listCalls += 1;
		lastQuery = getQuery(event);
		return listAnswer();
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

/** A queue that waits for nothing, and gives up after `polls` questions. */
function queue(polls = 3) {
	const filter = ref<AppealQueueFilter>("pending");
	const limit = ref(25);
	const wait = vi.fn(() => Promise.resolve());
	const result = useAppealQueue(
		{ guildId: GUILD, filter, limit },
		{ interval: 1, timeout: polls, wait },
	);
	return { ...result, filter, limit, wait };
}

describe("useAppealQueue", () => {
	beforeEach(() => {
		listCalls = 0;
		requestCalls = 0;
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

		expect(lastQuery).toMatchObject({ status: "pending", limit: "25" });
		expect(entries.value.map((item) => item.id)).toStrictEqual(["1"]);
		expect(total.value).toBe(1);
		expect(counts.value).toStrictEqual({ accepted: 3, denied: 1, pending: 1 });
		expect(canReview.value).toBe(true);
	});

	it("keeps its rows while a longer page of the same filter loads, and drops them for another filter", async () => {
		const { entries, filter, limit, status } = queue();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		let release: () => void = () => {};
		listAnswer = () =>
			new Promise((resolve) => {
				release = () => resolve(response([entry("1"), entry("2")], 2));
			});
		limit.value = 50;
		await nextTick();
		await vi.waitUntil(() => status.value === "pending", { timeout: 2000 });
		expect(entries.value.map((item) => item.id)).toStrictEqual(["1"]);

		release();
		await vi.waitUntil(() => entries.value.length === 2, { timeout: 2000 });

		filter.value = "denied";
		await nextTick();
		expect(entries.value).toStrictEqual([]);
		release();
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
