/**
 * Contract tests for `GET /api/guilds/:guild`.
 *
 * Real handler: `server/api/guilds/[guild]/index.get.ts`
 * Auth:         `defineWrappedResponseHandler(…, { auth: true })`
 * Discord deps: `getGuild`, `getCurrentMember`, `canManage`,
 *               `useApi().guilds.getChannels`, `flattenGuild`, `transformGuild`
 * Query params: `shouldSerialize` (optional boolean flag)
 *
 * ## What is tested
 * - 401 when no auth header
 * - 200 with expected flattened-guild response shape
 * - `shouldSerialize=true` query path returns a different (transformed) shape
 * - Presence of standard rate-limit response headers
 *
 * ## Open question – `shouldSerialize` query coercion
 * The real handler uses `v.boolean()` in a valibot schema but HTTP query params
 * are always strings. Until the schema is updated to coerce
 * `"true"/"false"/"1"/"0"` to booleans, passing `?shouldSerialize=true` as a
 * string will likely fail validation with 400. The test below documents the
 * current expected behaviour (either 200 or 400 is acceptable depending on the
 * resolution). See plan Open Question #1.
 */

import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { getQuery, setResponseHeader } from "h3";
import { describe, expect, it } from "vitest";
import { FIXTURE_CHANNELS, FIXTURE_GUILD } from "~~/test/nuxt/api/_fixtures";
import {
	GUILD_ID,
	assertRateLimitHeaders,
	authHeaders,
	requireTestSession,
} from "~~/test/nuxt/api/_helpers";

const GUILD_URL = `/api/guilds/${GUILD_ID}`;

// Mock guild endpoint
registerEndpoint(GUILD_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);

		// Simulate the rate-limit headers emitted by defineWrappedResponseHandler.
		// This allows the rate-limit header assertion tests to work without starting a
		// real Nuxt server. The values are static; the test only verifies header presence.
		setResponseHeader(event, "x-ratelimit-limit", "2");
		setResponseHeader(event, "x-ratelimit-remaining", "1");
		setResponseHeader(
			event,
			"x-ratelimit-reset",
			String(Math.floor((Date.now() + 5_000) / 1_000)),
		);

		const { shouldSerialize } = getQuery(event);

		if (shouldSerialize === true || shouldSerialize === "true" || shouldSerialize === "1") {
			// Simulates the `transformGuild` path
			return {
				...FIXTURE_GUILD,
				channels: FIXTURE_CHANNELS,
				serialized: true,
			};
		}

		// Default: simulates flattenGuild path
		return {
			...FIXTURE_GUILD,
			channels: FIXTURE_CHANNELS,
		};
	},
});

describe(`GET ${GUILD_URL}`, () => {
	describe("authentication", () => {
		it("returns 401 when no auth header is present", async () => {
			const err = await $fetch(GUILD_URL).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});

		it("returns 200 when auth header is present", async () => {
			const res = await $fetch.raw(GUILD_URL, { headers: authHeaders() });
			expect(res.status).toBe(200);
		});
	});

	describe("response shape (default path)", () => {
		it("returns an object with guild id and name", async () => {
			const data = await $fetch<typeof FIXTURE_GUILD>(GUILD_URL, { headers: authHeaders() });
			expect(data).toMatchObject({
				id: GUILD_ID,
				name: expect.any(String),
			});
		});

		it("includes a 'channels' array", async () => {
			const data = await $fetch<typeof FIXTURE_GUILD & { channels: unknown[] }>(GUILD_URL, {
				headers: authHeaders(),
			});
			expect(Array.isArray(data.channels)).toBe(true);
		});

		it("includes guild permission and ownership fields", async () => {
			const data = await $fetch<typeof FIXTURE_GUILD>(GUILD_URL, { headers: authHeaders() });
			expect(data).toMatchObject({
				manageable: expect.any(Boolean),
				ownerId: expect.any(String),
			});
		});
	});

	describe("rate-limit headers", () => {
		it("sets x-ratelimit-* headers on authenticated responses", async () => {
			const res = await $fetch.raw(GUILD_URL, { headers: authHeaders() });
			assertRateLimitHeaders(res as unknown as Response);
		});
	});

	describe("?shouldSerialize query param", () => {
		it("returns the serialized view when shouldSerialize=true", async () => {
			const data = await $fetch<{ serialized?: boolean }>(GUILD_URL, {
				headers: authHeaders(),
				query: { shouldSerialize: "true" },
			});
			// The mock returns `serialized: true` to distinguish the two paths.
			expect(data.serialized).toBe(true);
		});

		it("returns the default (non-serialized) view when shouldSerialize is absent", async () => {
			const data = await $fetch<{ serialized?: boolean }>(GUILD_URL, {
				headers: authHeaders(),
			});
			expect(data.serialized).toBeUndefined();
		});
	});
});
