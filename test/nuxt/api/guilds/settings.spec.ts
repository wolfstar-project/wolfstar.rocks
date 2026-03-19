/**
 * Contract tests for guild settings endpoints.
 *
 * Real handlers:
 *  - `server/api/guilds/[guild]/settings.get.ts`
 *  - `server/api/guilds/[guild]/settings.patch.ts`
 *
 * Auth:       `defineWrappedResponseHandler(…, { auth: true })`
 * DB deps:    `readSettings`, `serializeSettings`, `writeSettingsTransaction`,
 *             `coerceBigIntFields`
 *
 * ## GET /api/guilds/:guild/settings
 * - 401 unauthenticated
 * - 200 authenticated → serialized settings shape
 *
 * ## PATCH /api/guilds/:guild/settings
 * - 401 unauthenticated
 * - 400 when body is absent (no Content-Type set by client)
 * - 200 for a valid authenticated PATCH
 *
 * ## Note on body parsing
 * `registerEndpoint` mock handlers run in a Nitro server that does not expose
 * the browser-originated request body to `readBody`/`readRawBody` – the stream
 * is always empty. We therefore use the presence of a `Content-Type: application/json`
 * header as a proxy: `ofetch` sets it only when `body` is a non-null object,
 * so "no Content-Type" reliably means "no body was sent". Field-level validation
 * (empty `data` array, etc.) is covered by real handler unit tests, not here.
 */

import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError, getHeader } from "h3";
import { describe, expect, it } from "vitest";
import { FIXTURE_SERIALIZED_SETTINGS } from "~~/test/nuxt/api/_fixtures";
import { GUILD_ID, authHeaders, requireTestSession } from "~~/test/nuxt/api/_helpers";

const SETTINGS_URL = `/api/guilds/${GUILD_ID}/settings`;

// GET mock
registerEndpoint(SETTINGS_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		return FIXTURE_SERIALIZED_SETTINGS;
	},
});

// PATCH mock
//
// Body stream is not available in registerEndpoint context (browser-to-Nitro
// path does not forward the body buffer to the mock handler). We use
// Content-Type header presence as a proxy instead:
//   "Content-Type: application/json" → ofetch sent a non-null body  → 200
//   no Content-Type                  → ofetch sent undefined/null    → 400
registerEndpoint(SETTINGS_URL, {
	method: "PATCH",
	handler: (event) => {
		requireTestSession(event);

		const contentType = getHeader(event, "content-type") ?? "";
		if (!contentType.includes("application/json")) {
			throw createError({
				message: "Invalid request body or missing data",
				status: 400,
				statusMessage: "Bad Request",
			});
		}

		// Return fixture settings unchanged; the real handler's field-level
		// validation and merge logic is covered by unit tests, not here.
		return FIXTURE_SERIALIZED_SETTINGS;
	},
});

describe(`GET ${SETTINGS_URL}`, () => {
	describe("authentication", () => {
		it("returns 401 when no auth header is present", async () => {
			const err = await $fetch(SETTINGS_URL).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});

		it("returns 200 when auth header is present", async () => {
			const res = await $fetch.raw(SETTINGS_URL, { headers: authHeaders() });
			expect(res.status).toBe(200);
		});
	});

	describe("response shape", () => {
		it("returns the serialized settings object", async () => {
			const data = await $fetch<typeof FIXTURE_SERIALIZED_SETTINGS>(SETTINGS_URL, {
				headers: authHeaders(),
			});
			expect(data).toMatchObject({
				language: expect.any(String),
				prefix: expect.any(String),
			});
		});

		it("includes admin and moderator role arrays", async () => {
			const data = await $fetch<typeof FIXTURE_SERIALIZED_SETTINGS>(SETTINGS_URL, {
				headers: authHeaders(),
			});
			expect(Array.isArray(data.rolesAdmin)).toBe(true);
			expect(Array.isArray(data.rolesModerator)).toBe(true);
		});
	});
});

describe(`PATCH ${SETTINGS_URL}`, () => {
	describe("authentication", () => {
		it("returns 401 when no auth header is present", async () => {
			const err = await $fetch(SETTINGS_URL, { method: "PATCH" }).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});
	});

	describe("validation", () => {
		it("returns 400 when body is missing (no Content-Type)", async () => {
			// ofetch omits Content-Type when body is undefined
			const err = await $fetch(SETTINGS_URL, {
				body: undefined,
				headers: authHeaders(),
				method: "PATCH",
			}).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(400);
		});
	});

	describe("happy path – 200", () => {
		it("returns 200 for an authenticated PATCH with a body", async () => {
			const res = await $fetch.raw(SETTINGS_URL, {
				body: { data: [["prefix", "?"]] },
				headers: authHeaders(),
				method: "PATCH",
			});
			expect(res.status).toBe(200);
		});

		it("returns the serialized settings shape on success", async () => {
			const data = await $fetch<typeof FIXTURE_SERIALIZED_SETTINGS>(SETTINGS_URL, {
				body: { data: [["prefix", "!"]] },
				headers: authHeaders(),
				method: "PATCH",
			});
			expect(data).toMatchObject({
				language: expect.any(String),
				prefix: expect.any(String),
			});
		});
	});
});
