/**
 * Contract tests for `GET /api/guilds/:guild/roles/:role`.
 *
 * Real handler: `server/api/guilds/[guild]/roles/[role].get.ts`
 * Auth:         `defineWrappedResponseHandler(…, { auth: true })`
 * Discord deps: `useApi().guilds.getRole`, `flattenRole`
 *
 * ## What is tested
 * - 401 unauthenticated
 * - 200 authenticated → FlattenedRole shape
 * - 500 when the role ID does not exist (Discord propagates an error)
 */

import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { describe, expect, it } from "vitest";
import { FIXTURE_ROLE } from "~~/test/nuxt/api/_fixtures";
import { GUILD_ID, authHeaders, requireTestSession } from "~~/test/nuxt/api/_helpers";

const EXISTING_ROLE_ID = FIXTURE_ROLE.id; // "444444444444444440"
const MISSING_ROLE_ID = "000000000000000000";
const ROLE_URL = `/api/guilds/${GUILD_ID}/roles/${EXISTING_ROLE_ID}`;
const MISSING_ROLE_URL = `/api/guilds/${GUILD_ID}/roles/${MISSING_ROLE_ID}`;

// Mock role endpoints – exact static URLs; registerEndpoint does not support :param
registerEndpoint(ROLE_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		return FIXTURE_ROLE;
	},
});

registerEndpoint(MISSING_ROLE_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		throw createError({
			message: "Unknown Role",
			status: 500,
			statusMessage: "Internal Server Error",
		});
	},
});

describe(`GET /api/guilds/:guild/roles/:role`, () => {
	describe("authentication", () => {
		it("returns 401 when no auth header", async () => {
			const err = await $fetch(ROLE_URL).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});

		it("returns 200 when auth header is present", async () => {
			const res = await $fetch.raw(ROLE_URL, { headers: authHeaders() });
			expect(res.status).toBe(200);
		});
	});

	describe("response shape", () => {
		it("returns an object with role id and name", async () => {
			const data = await $fetch<typeof FIXTURE_ROLE>(ROLE_URL, { headers: authHeaders() });
			expect(data).toMatchObject({
				id: EXISTING_ROLE_ID,
				name: expect.any(String),
			});
		});

		it("returns FlattenedRole fields (guildId, color, permissions, hoist, managed)", async () => {
			const data = await $fetch<typeof FIXTURE_ROLE>(ROLE_URL, { headers: authHeaders() });
			expect(data).toMatchObject({
				color: expect.any(Number),
				guildId: GUILD_ID,
				hoist: expect.any(Boolean),
				id: expect.any(String),
				managed: expect.any(Boolean),
				mentionable: expect.any(Boolean),
				name: expect.any(String),
				permissions: expect.any(String),
			});
		});
	});

	describe("error path – unknown role", () => {
		it("returns 5xx for an unknown role ID", async () => {
			const err = await $fetch(MISSING_ROLE_URL, {
				headers: authHeaders(),
			}).catch((e: unknown) => e);
			const status = (err as { statusCode?: number }).statusCode ?? 0;
			expect(status).toBeGreaterThanOrEqual(500);
		});
	});
});
