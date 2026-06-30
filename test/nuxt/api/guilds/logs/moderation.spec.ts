import type { ModerationLogEntry } from "#shared/types/moderation-log";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { getQuery } from "h3";
import { describe, expect, it } from "vitest";
import { MOCK_MODERATION_ENTRY } from "~~/test/mocks/auditLogs";
import { GUILD_ID, authHeaders, requireTestSession } from "~~/test/nuxt/api/_helpers";

const URL = `/api/guilds/${GUILD_ID}/logs/moderation`;

// Single handler dispatches based on query params since registerEndpoint matches path only.
registerEndpoint(URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		const query = getQuery(event);
		if (query["moderatorId"] === "999") {
			return { entries: [], total: 0 };
		}
		return { entries: [MOCK_MODERATION_ENTRY], total: 1 };
	},
});

describe(`GET ${URL}`, () => {
	describe("authentication", () => {
		it("returns 401 when no auth header", async () => {
			const err = await $fetch(URL).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});
	});

	describe("happy path", () => {
		it("returns entries and total", async () => {
			const result = await $fetch<{ entries: ModerationLogEntry[]; total: number }>(URL, {
				headers: authHeaders(),
			});
			expect(result.total).toBe(1);
			expect(result.entries).toHaveLength(1);
			expect(result.entries[0]).toMatchObject({
				caseId: 1,
				typeName: "Warning",
			});
		});

		it("filters by typeCode=1 (warnings tab equivalence)", async () => {
			const result = await $fetch<{ entries: ModerationLogEntry[]; total: number }>(
				`${URL}?typeCode=1`,
				{
					headers: authHeaders(),
				},
			);
			expect(result.entries.every((e) => e.typeCode === 1)).toBe(true);
		});

		it("filters by moderatorId returns empty when no match", async () => {
			const result = await $fetch<{ entries: ModerationLogEntry[]; total: number }>(
				`${URL}?moderatorId=999`,
				{
					headers: authHeaders(),
				},
			);
			expect(result.total).toBe(0);
			expect(result.entries).toHaveLength(0);
		});
	});
});
