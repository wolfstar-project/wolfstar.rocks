import type { AppealPage, MyAppealEntry, MyAppealsResponse } from "#shared/utils/my-appeals";
import type { H3Event } from "h3";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError, getQuery } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
let lastQuery: Record<string, unknown> = {};
let lastBody: unknown;
let pageAnswer: () => AppealPage;
let submitAnswer: () => unknown;

registerEndpoint("/api/users/appeals", {
	method: "GET",
	handler: (event) => {
		listCalls += 1;
		lastQuery = getQuery(event);
		return { entries: [entry(`${GUILD}:212`)], openCount: 1 } satisfies MyAppealsResponse;
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
