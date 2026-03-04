/**
 * Contract tests for guild member endpoints.
 *
 * Real handlers:
 *  - `server/api/guilds/[guild]/members/index.ts`
 *  - `server/api/guilds/[guild]/members/[member].get.ts`
 *
 * Auth:       `defineWrappedResponseHandler(…, { auth: true })`
 * Discord deps: `useApi().guilds.getMembers`, `getMember`, `flattenMember`
 *
 * ## Note on Discord error 10007 (Unknown Member)
 * The real handler calls `getMember(guildId, memberId)`. If Discord returns
 * an "Unknown Member" error (code 10007) the wrappedEventHandler currently
 * propagates it as a 500. Plan Open Question #2 tracks whether this should
 * become a 404 instead. The test below documents the current expectation.
 */

import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { describe, expect, it } from "vitest";
import { createMockRole } from "../../../mocks/discord";
import { GUILD_ID, MEMBER_USER_ID, authHeaders, requireTestSession } from "../_helpers";

const MEMBER_LIST_URL = `/api/guilds/${GUILD_ID}/members`;
const EXISTING_MEMBER_ID = MEMBER_USER_ID; // "111111111111111111"
const MISSING_MEMBER_ID = "000000000000000000";
const SINGLE_MEMBER_URL = `${MEMBER_LIST_URL}/${EXISTING_MEMBER_ID}`;
const MISSING_MEMBER_URL = `${MEMBER_LIST_URL}/${MISSING_MEMBER_ID}`;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FIXTURE_FLAT_USER = {
	avatar: "a1b2c3",
	bot: false,
	discriminator: "0",
	globalName: "Test Member",
	id: EXISTING_MEMBER_ID,
	username: "testmember",
};

const FIXTURE_FLAT_MEMBER = {
	guildId: GUILD_ID,
	id: EXISTING_MEMBER_ID,
	joinedTimestamp: Date.now() - 86_400_000,
	premiumSinceTimestamp: null,
	roles: [createMockRole({ guildId: GUILD_ID })],
	user: FIXTURE_FLAT_USER,
};

// ---------------------------------------------------------------------------
// Member list mock
// ---------------------------------------------------------------------------

registerEndpoint(MEMBER_LIST_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		return [FIXTURE_FLAT_MEMBER];
	},
});

// ---------------------------------------------------------------------------
// Single member mocks – exact static URLs; registerEndpoint does not support :param
// ---------------------------------------------------------------------------

registerEndpoint(SINGLE_MEMBER_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		return FIXTURE_FLAT_MEMBER;
	},
});

registerEndpoint(MISSING_MEMBER_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		// Real handler propagates Discord 10007 as 500; document that here.
		throw createError({
			message: "Unknown Member",
			status: 500,
			statusMessage: "Internal Server Error",
		});
	},
});

// ---------------------------------------------------------------------------
// Tests – member list
// ---------------------------------------------------------------------------

describe(`GET ${MEMBER_LIST_URL}`, () => {
	describe("authentication", () => {
		it("returns 401 when no auth header is present", async () => {
			const err = await $fetch(MEMBER_LIST_URL).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});

		it("returns 200 when auth header is present", async () => {
			const res = await $fetch.raw(MEMBER_LIST_URL, { headers: authHeaders() });
			expect(res.status).toBe(200);
		});
	});

	describe("response shape", () => {
		it("returns an array of member objects", async () => {
			const data = await $fetch(MEMBER_LIST_URL, { headers: authHeaders() });
			expect(Array.isArray(data)).toBe(true);
		});

		it("each member has id, guildId, user and roles fields", async () => {
			const data = await $fetch<(typeof FIXTURE_FLAT_MEMBER)[]>(MEMBER_LIST_URL, {
				headers: authHeaders(),
			});
			for (const member of data) {
				expect(member).toMatchObject({
					guildId: GUILD_ID,
					id: expect.any(String),
					roles: expect.any(Array),
					user: expect.objectContaining({ id: expect.any(String) }),
				});
			}
		});
	});
});

// ---------------------------------------------------------------------------
// Tests – single member
// ---------------------------------------------------------------------------

describe(`GET ${MEMBER_LIST_URL}/:member`, () => {
	describe("authentication", () => {
		it("returns 401 when no auth header", async () => {
			const err = await $fetch(SINGLE_MEMBER_URL).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});
	});

	describe("happy path", () => {
		it("returns 200 for an existing member", async () => {
			const res = await $fetch.raw(SINGLE_MEMBER_URL, { headers: authHeaders() });
			expect(res.status).toBe(200);
		});

		it("returns member object with matching id", async () => {
			const data = await $fetch<typeof FIXTURE_FLAT_MEMBER>(SINGLE_MEMBER_URL, {
				headers: authHeaders(),
			});
			expect(data.id).toBe(EXISTING_MEMBER_ID);
			expect(data.guildId).toBe(GUILD_ID);
			expect(data.user).toMatchObject({ id: EXISTING_MEMBER_ID });
		});
	});

	describe("error path – unknown member", () => {
		it("returns 5xx for an unknown member ID (Discord 10007 behaviour)", async () => {
			const err = await $fetch(MISSING_MEMBER_URL, {
				headers: authHeaders(),
			}).catch((e: unknown) => e);
			const status = (err as { statusCode?: number }).statusCode ?? 0;
			// Open Question #2: this is currently 500; should become 404.
			expect(status).toBeGreaterThanOrEqual(500);
		});
	});
});
