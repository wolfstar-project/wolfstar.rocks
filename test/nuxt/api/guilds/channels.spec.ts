/**
 * Contract tests for guild channel endpoints.
 *
 * Real handlers:
 *  - `server/api/guilds/[guild]/channels/index.get.ts`
 *  - `server/api/guilds/[guild]/channels/[channel].get.ts`
 *
 * Auth:       `defineWrappedResponseHandler(…, { auth: true })`
 * Discord deps: `useApi().guilds.getChannels`, `flattenGuildChannel`
 *
 * ## Internal $fetch dependency
 * `[channel].get.ts` does NOT query Discord directly. Instead it calls
 * `$fetch('/api/guilds/:guild/channels', { headers })` to get the list, then
 * finds the requested channel ID within that list. In tests this is handled
 * transparently: the same `/api/guilds/:guild/channels` `registerEndpoint`
 * serves both the list and the look-up through-call.
 *
 * ## Endpoints tested
 * - `GET /api/guilds/:guild/channels` – list
 * - `GET /api/guilds/:guild/channels/:channel` – single lookup
 *   - Returns 200 when channel exists
 *   - Returns 404 when channel ID is not in the list
 */

import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { FIXTURE_CHANNEL, FIXTURE_CHANNELS } from "../_fixtures";
import { GUILD_ID, authHeaders, requireTestSession } from "../_helpers";

const CHANNEL_LIST_URL = `/api/guilds/${GUILD_ID}/channels`;
const EXISTING_CHANNEL_ID = FIXTURE_CHANNEL.id; // "333333333333333330"
const MISSING_CHANNEL_ID = "000000000000000000";
const SINGLE_CHANNEL_URL = `${CHANNEL_LIST_URL}/${EXISTING_CHANNEL_ID}`;
const MISSING_CHANNEL_URL = `${CHANNEL_LIST_URL}/${MISSING_CHANNEL_ID}`;

// Channel list mock (also serves the internal $fetch from [channel].get.ts)
registerEndpoint(CHANNEL_LIST_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		return FIXTURE_CHANNELS;
	},
});

// Single channel mock – exact static URL; missing URL is unregistered (→ 404)
registerEndpoint(SINGLE_CHANNEL_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		return FIXTURE_CHANNEL;
	},
});

describe(`GET ${CHANNEL_LIST_URL}`, () => {
	describe("authentication", () => {
		it("returns 401 when no auth header is present", async () => {
			const err = await $fetch(CHANNEL_LIST_URL).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});

		it("returns 200 when auth header is present", async () => {
			const res = await $fetch.raw(CHANNEL_LIST_URL, { headers: authHeaders() });
			expect(res.status).toBe(200);
		});
	});

	describe("response shape", () => {
		it("returns an array", async () => {
			const data = await $fetch(CHANNEL_LIST_URL, { headers: authHeaders() });
			expect(Array.isArray(data)).toBe(true);
		});

		it("each channel entry has id, name, guildId and type fields", async () => {
			const data = await $fetch<typeof FIXTURE_CHANNELS>(CHANNEL_LIST_URL, {
				headers: authHeaders(),
			});
			for (const ch of data) {
				expect(ch).toMatchObject({
					guildId: GUILD_ID,
					id: expect.any(String),
					name: expect.any(String),
					type: expect.any(Number),
				});
			}
		});
	});
});

describe(`GET ${CHANNEL_LIST_URL}/:channel`, () => {
	describe("authentication", () => {
		it("returns 401 when no auth header", async () => {
			const err = await $fetch(SINGLE_CHANNEL_URL).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});
	});

	describe("happy path – existing channel", () => {
		it("returns 200 for an existing channel ID", async () => {
			const res = await $fetch.raw(SINGLE_CHANNEL_URL, { headers: authHeaders() });
			expect(res.status).toBe(200);
		});

		it("returns the channel with matching id", async () => {
			const data = await $fetch<(typeof FIXTURE_CHANNELS)[0]>(SINGLE_CHANNEL_URL, {
				headers: authHeaders(),
			});
			expect(data.id).toBe(EXISTING_CHANNEL_ID);
			expect(data.guildId).toBe(GUILD_ID);
		});
	});

	describe("error path – unknown channel", () => {
		it("returns 404 when channel ID does not exist", async () => {
			const err = await $fetch(MISSING_CHANNEL_URL, {
				headers: authHeaders(),
			}).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(404);
		});
	});
});
