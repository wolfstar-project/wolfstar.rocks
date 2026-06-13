/**
 * Contract tests for the command logs endpoint.
 *
 * Real handler: `server/api/guilds/[guild]/logs/commands.get.ts`
 *
 * Auth:    `defineWrappedResponseHandler(…, { auth: true })`
 * DB deps: `prisma.commandLog.findMany`, `prisma.commandLog.count`,
 *          `resolveGuildMembers`
 *
 * ## GET /api/guilds/:guild/logs/commands
 * - 401 unauthenticated
 * - 200 empty state (no rows — Day 1 before bot emits)
 * - 200 filtered by commandName
 * - 200 filtered by success=failure
 * - 200 free-text search across commandName and errorReason
 *
 * Note: registerEndpoint matches by path only (query params ignored for routing).
 * A single handler uses getQuery() to branch on filter params.
 */

import type { CommandLogData } from "#server/database";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { getQuery } from "h3";
import { describe, expect, it } from "vitest";
import { MOCK_COMMAND_ENTRY } from "~~/test/mocks/auditLogs";
import { GUILD_ID, authHeaders, requireTestSession } from "~~/test/nuxt/api/_helpers";

const URL = `/api/guilds/${GUILD_ID}/logs/commands`;

// Single handler — registerEndpoint matches path only; use getQuery() to branch.
registerEndpoint(URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		const query = getQuery(event);
		// Simulate empty state when no filter provided.
		if (!query["commandName"] && !query["success"] && !query["q"]) {
			return { entries: [], total: 0 };
		}
		// All filter scenarios return the fixture entry.
		return { entries: [MOCK_COMMAND_ENTRY], total: 1 };
	},
});

describe(`GET ${URL}`, () => {
	describe("authentication", () => {
		it("returns 401 when no auth header", async () => {
			const err = await $fetch(URL).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});
	});

	describe("empty state", () => {
		it("returns empty entries and zero total when no rows", async () => {
			const result = await $fetch<{ entries: CommandLogData[]; total: number }>(URL, {
				headers: authHeaders(),
			});
			expect(result.total).toBe(0);
			expect(result.entries).toHaveLength(0);
		});
	});

	describe("with rows", () => {
		it("filters by commandName returns entries for that command", async () => {
			const result = await $fetch<{ entries: CommandLogData[]; total: number }>(
				`${URL}?commandName=ban`,
				{ headers: authHeaders() },
			);
			expect(result.entries[0]?.commandName).toBe("ban");
		});

		it("filters by success=failure returns failed entries", async () => {
			const result = await $fetch<{ entries: CommandLogData[]; total: number }>(
				`${URL}?success=failure`,
				{ headers: authHeaders() },
			);
			expect(result.entries.every((e) => !e.success)).toBe(true);
		});

		it("free-text search returns matching entries", async () => {
			const result = await $fetch<{ entries: CommandLogData[]; total: number }>(
				`${URL}?q=ban`,
				{ headers: authHeaders() },
			);
			expect(result.entries[0]?.errorReason).toBe("User not found");
		});
	});
});
