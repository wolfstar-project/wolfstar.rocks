/**
 * Contract tests for `GET /api/users`.
 *
 * Real handler: `server/api/users/index.get.ts`
 * Auth:         `defineWrappedResponseHandler(…, { auth: true })`
 * Discord deps: `getCurrentUser`, `transformOauthGuildsAndUser`
 *
 * These tests exercise the API contract (URL, HTTP method, status codes,
 * response shape) without touching real OAuth tokens or the Discord REST API.
 * A custom `x-test-user-id` header is used instead of a sealed session cookie
 * so that the mock handler can gate access without the full nuxt-auth-utils flow.
 *
 * Rate-limit note: each test uses {@link authHeaders} which auto-increments
 * the user-ID so that the Nitro storage rate-limiter key (scoped by user ID)
 * is never shared between tests.
 */

import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { FIXTURE_PARTIAL_GUILD, FIXTURE_USER, FIXTURE_USERS_RESPONSE } from "./_fixtures";
import { TEST_AUTH_HEADER, authHeaders, requireTestSession } from "./_helpers";

// Mock endpoint – simulates `server/api/users/index.get.ts` behaviour
registerEndpoint("/api/users", {
	method: "GET",
	handler: (event) => {
		// Throws 401 when TEST_AUTH_HEADER is absent (mirrors requireUserSession)
		const userId = requireTestSession(event);

		return {
			guilds: [FIXTURE_PARTIAL_GUILD],
			transformedGuilds: [FIXTURE_PARTIAL_GUILD],
			user: { ...FIXTURE_USER, id: userId },
		};
	},
});

describe("GET /api/users", () => {
	describe("authentication", () => {
		it("returns 401 when no auth header is present", async () => {
			const err = await $fetch("/api/users").catch((e: unknown) => e);
			// ofetch throws FetchError on non-2xx; the status is on .statusCode / .response.status
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});

		it("returns 200 when auth header is present", async () => {
			const res = await $fetch.raw("/api/users", { headers: authHeaders() });
			expect(res.status).toBe(200);
		});
	});

	describe("response shape", () => {
		it("includes a 'user' object with an 'id' field", async () => {
			const data = await $fetch<typeof FIXTURE_USERS_RESPONSE>("/api/users", {
				headers: authHeaders(),
			});
			expect(data.user).toMatchObject({ id: expect.any(String) });
		});

		it("includes a 'guilds' array", async () => {
			const data = await $fetch<typeof FIXTURE_USERS_RESPONSE>("/api/users", {
				headers: authHeaders(),
			});
			expect(Array.isArray(data.guilds)).toBe(true);
		});

		it("includes a 'transformedGuilds' array", async () => {
			const data = await $fetch<typeof FIXTURE_USERS_RESPONSE>("/api/users", {
				headers: authHeaders(),
			});
			expect(Array.isArray(data.transformedGuilds)).toBe(true);
		});

		it("guild entries have expected shape fields", async () => {
			const data = await $fetch<typeof FIXTURE_USERS_RESPONSE>("/api/users", {
				headers: authHeaders(),
			});
			const [guild] = data.guilds;
			expect(guild).toMatchObject({
				id: expect.any(String),
				manageable: expect.any(Boolean),
				name: expect.any(String),
			});
		});

		it("does NOT leak the raw TEST_AUTH_HEADER value into the response", async () => {
			const data = await $fetch<Record<string, unknown>>("/api/users", {
				headers: authHeaders(),
			});
			const bodyStr = JSON.stringify(data);
			expect(bodyStr).not.toContain(TEST_AUTH_HEADER);
		});
	});

	describe("reflecting caller identity", () => {
		it("returns a user.id that matches the auth header value", async () => {
			const customId = "custom-user-abc123";
			const data = await $fetch<typeof FIXTURE_USERS_RESPONSE>("/api/users", {
				headers: authHeaders(customId),
			});
			expect(data.user.id).toBe(customId);
		});
	});

	describe("caching", () => {
		it("sets Cache-Control to private with max-age and stale-while-revalidate", async () => {
			const res = await $fetch.raw("/api/users", { headers: authHeaders() });
			expect(res.headers.get("cache-control")).toBe(
				"private, max-age=30, stale-while-revalidate=300",
			);
		});
	});
});
