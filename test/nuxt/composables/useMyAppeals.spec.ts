import type { AppealPage, MyAppealEntry, MyAppealsResponse } from "#shared/utils/my-appeals";
import type { H3Event } from "h3";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError, getQuery } from "h3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const GUILD = "234567890123456789";

function entry(key: string): MyAppealEntry {
	return {
		key,
		guild: { id: GUILD, name: "Pixel Parlor", icon: null },
		case: {
			id: 212,
			type: "Ban",
			reason: "Advertising",
			createdAt: "2026-11-01T12:00:00.000Z",
			duration: null,
			state: "active",
		},
		status: "open",
		appeal: null,
		againAt: null,
		closed: null,
	};
}

const PAGE: AppealPage = {
	guild: { id: GUILD, name: "Pixel Parlor", icon: null },
	enabled: true,
	block: null,
	forms: [],
	appeals: [],
};

let listCalls = 0;
let listFails = false;
// What the list answers when it is asked, and a gate that holds the next answer back.
let listAnswer: () => MyAppealsResponse;
let listGate: Promise<void> | null = null;
let lastQuery: Record<string, unknown> = {};
let lastBody: unknown;
let pageAnswer: () => AppealPage;
let submitAnswer: () => unknown;

registerEndpoint("/api/users/appeals", {
	method: "GET",
	handler: async (event) => {
		listCalls += 1;
		if (listFails) throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
		lastQuery = getQuery(event);
		const answer = listAnswer();
		if (listGate) {
			const gate = listGate;
			listGate = null;
			await gate;
		}
		return answer;
	},
});

registerEndpoint(`/api/users/appeals/${GUILD}`, { method: "GET", handler: () => pageAnswer() });

// h3's `readBody` needs Node's `Buffer`, which the browser runner lacks.
registerEndpoint(`/api/users/appeals/${GUILD}/builtin`, {
	method: "POST",
	handler: async (event: H3Event) => {
		lastBody = await event.web?.request?.json();
		return submitAnswer();
	},
});

describe("useMyAppeals", () => {
	beforeEach(() => {
		listCalls = 0;
		listFails = false;
		listAnswer = () => ({ entries: [entry(`${GUILD}:212`)], openCount: 1 });
		listGate = null;
		lastQuery = {};
		lastBody = undefined;
		pageAnswer = () => PAGE;
		submitAnswer = () => ({ ok: true });
		clearNuxtData();
		const nuxtApp = useNuxtApp();
		for (const key of Object.keys(nuxtApp._asyncData)) delete nuxtApp._asyncData[key];
		for (const key of Object.keys(nuxtApp._asyncDataPromises))
			delete nuxtApp._asyncDataPromises[key];
	});

	it("lists the member's cases, with the server of the bot's link", async () => {
		const { entries, openCount, status } = useMyAppeals({ guild: GUILD });
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

		expect(lastQuery).toMatchObject({ guild: GUILD });
		expect(entries.value.map((item) => item.key)).toStrictEqual([`${GUILD}:212`]);
		expect(openCount.value).toBe(1);
	});

	it("reads the page of a server", async () => {
		const { loadPage } = useMyAppeals();
		expect(await loadPage(GUILD)).toStrictEqual({ ok: true, value: PAGE });
	});

	it("says appeals are unavailable when the bridge to the bot is off", async () => {
		pageAnswer = () => {
			throw createError({ statusCode: 503, statusMessage: "Service Unavailable" });
		};
		const { loadPage } = useMyAppeals();
		expect(await loadPage(GUILD)).toStrictEqual({ ok: false, code: "unavailable" });
	});

	it("sends an appeal with the built-in form, then reads the list again", async () => {
		const { status, submit } = useMyAppeals();
		await vi.waitUntil(() => status.value === "success", { timeout: 2000 });
		const before = listCalls;

		expect(await submit(GUILD, null, 212, { why: "Sorry." })).toStrictEqual({
			ok: true,
			value: undefined,
		});
		expect(lastBody).toStrictEqual({ caseId: 212, answers: { why: "Sorry." } });
		expect(listCalls).toBeGreaterThan(before);
	});

	describe("while the list is shown", () => {
		const setVisibility = (state: DocumentVisibilityState) => {
			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				value: state,
			});
			document.dispatchEvent(new Event("visibilitychange"));
		};

		afterEach(() => {
			vi.useRealTimers();
			setVisibility("visible");
		});

		it("reads it again every minute, so a decision of the staff shows without a reload", async () => {
			vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
			const { loaded, status } = useMyAppeals({ live: true });
			await vi.waitUntil(() => status.value === "success", { timeout: 2000 });
			const before = listCalls;

			vi.advanceTimersByTime(60_000);
			await vi.waitUntil(() => listCalls > before, { timeout: 2000 });
			// The cases stay on screen while it reads them again.
			expect(loaded.value).toBe(true);
		});

		it("keeps the cases when a read in the background fails, and tries again", async () => {
			vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
			const { entries, error, status } = useMyAppeals({ live: true });
			await vi.waitUntil(() => status.value === "success", { timeout: 2000 });
			const before = listCalls;

			listFails = true;
			vi.advanceTimersByTime(60_000);
			await vi.waitUntil(() => listCalls > before, { timeout: 2000 });
			await new Promise((resolve) => requestAnimationFrame(resolve));

			expect(entries.value.map((item) => item.key)).toStrictEqual([`${GUILD}:212`]);
			expect(status.value).toBe("success");
			expect(error.value).toBeFalsy();

			listFails = false;
			vi.advanceTimersByTime(60_000);
			await vi.waitUntil(() => listCalls > before + 1, { timeout: 2000 });
		});

		it("drops a read in the background that a newer read overtook", async () => {
			vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
			const { entries, status, submit } = useMyAppeals({ live: true });
			await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

			// The background read is answered with the case still open, but late:
			let release!: () => void;
			listGate = new Promise((resolve) => (release = resolve));
			const before = listCalls;
			vi.advanceTimersByTime(60_000);
			await vi.waitUntil(() => listCalls > before, { timeout: 2000 });

			// Meanwhile the member appeals, and the list read after it says so.
			listAnswer = () => ({
				entries: [{ ...entry(`${GUILD}:212`), status: "pending" }],
				openCount: 0,
			});
			await submit(GUILD, null, 212, { why: "Sorry." });
			expect(entries.value[0]?.status).toBe("pending");

			release();
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(entries.value[0]?.status).toBe("pending");
		});

		it("shows the cases again once a read works after a failed one", async () => {
			vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
			listFails = true;
			const { entries, error, status } = useMyAppeals({ live: true });
			await vi.waitUntil(() => status.value === "error", { timeout: 2000 });

			listFails = false;
			vi.advanceTimersByTime(60_000);
			await vi.waitUntil(() => status.value === "success", { timeout: 2000 });

			expect(error.value).toBeFalsy();
			expect(entries.value.map((item) => item.key)).toStrictEqual([`${GUILD}:212`]);
		});

		it("does not read it while the tab is hidden, and reads it when the tab comes back", async () => {
			vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
			const { status } = useMyAppeals({ live: true });
			await vi.waitUntil(() => status.value === "success", { timeout: 2000 });
			const before = listCalls;

			setVisibility("hidden");
			vi.advanceTimersByTime(120_000);
			await new Promise((resolve) => requestAnimationFrame(resolve));
			expect(listCalls).toBe(before);

			setVisibility("visible");
			await vi.waitUntil(() => listCalls > before, { timeout: 2000 });
		});

		it("is not read again when only the badge of the Home counts the cases", async () => {
			vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
			const { status } = useMyAppeals();
			await vi.waitUntil(() => status.value === "success", { timeout: 2000 });
			const before = listCalls;

			vi.advanceTimersByTime(120_000);
			await new Promise((resolve) => requestAnimationFrame(resolve));
			expect(listCalls).toBe(before);
		});
	});

	it("gives the code the bot refused the appeal with, and generic for one it does not know", async () => {
		const { submit } = useMyAppeals();
		submitAnswer = () => {
			throw createError({
				statusCode: 409,
				statusMessage: "Conflict",
				data: { code: "appealed" },
			});
		};
		expect(await submit(GUILD, null, 212, {})).toStrictEqual({ ok: false, code: "appealed" });

		submitAnswer = () => {
			throw createError({
				statusCode: 400,
				statusMessage: "Bad Request",
				data: { code: "strange" },
			});
		};
		expect(await submit(GUILD, null, 212, {})).toStrictEqual({ ok: false, code: "generic" });
	});
});
