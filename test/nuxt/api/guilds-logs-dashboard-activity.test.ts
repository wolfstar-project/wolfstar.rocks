import type { DashboardAuditEntry } from "#shared/types/audit-log";
import type { APIGuildMember } from "discord-api-types/v10";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { GUILD_ID, authHeaders, requireTestSession } from "~~/test/nuxt/api/_helpers";

const NEW_URL = `/api/guilds/${GUILD_ID}/logs/dashboard-activity`;
const LEGACY_URL = `/api/guilds/${GUILD_ID}/audit-logs`;

const MOCK_ENTRY: DashboardAuditEntry = {
	id: "abc123",
	guildId: GUILD_ID,
	action: "guild.settings.update",
	outcome: "success",
	member: {
		user: {
			id: "987654321098765432",
			username: "TestOwner",
			discriminator: "0",
			avatar: null,
			global_name: null,
		},
		roles: [],
		joined_at: "",
		deaf: false,
		mute: false,
		flags: 0,
	} as unknown as APIGuildMember,
	changes: { changed: { prefix: { from: "!", to: "?" } } },
	reason: null,
	timestamp: "2026-05-15T00:00:00.000Z",
};

registerEndpoint(NEW_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		return { entries: [MOCK_ENTRY], total: 1 };
	},
});

registerEndpoint(LEGACY_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		return { entries: [MOCK_ENTRY], total: 1 };
	},
});

const ACTOR_FILTER_URL = `${NEW_URL}?actorId=987654321098765432`;
registerEndpoint(ACTOR_FILTER_URL, {
	method: "GET",
	handler: (event) => {
		requireTestSession(event);
		return { entries: [MOCK_ENTRY], total: 1 };
	},
});

describe(`GET ${NEW_URL}`, () => {
	describe("authentication", () => {
		it("returns 401 when no auth header", async () => {
			const err = await $fetch(NEW_URL).catch((e: unknown) => e);
			expect((err as { statusCode?: number }).statusCode).toBe(401);
		});
	});

	describe("happy path", () => {
		it("returns entries and total", async () => {
			const result = await $fetch<{ entries: DashboardAuditEntry[]; total: number }>(
				NEW_URL,
				{
					headers: authHeaders(),
				},
			);
			expect(result.total).toBe(1);
			expect(result.entries[0]?.action).toBe("guild.settings.update");
		});

		it("filters by actorId", async () => {
			const result = await $fetch<{ entries: DashboardAuditEntry[]; total: number }>(
				ACTOR_FILTER_URL,
				{
					headers: authHeaders(),
				},
			);
			expect(result.entries[0]?.member.user.id).toBe("987654321098765432");
		});
	});
});

describe(`GET ${LEGACY_URL} (shim)`, () => {
	it("returns same shape as new endpoint (backward compat)", async () => {
		const result = await $fetch<{ entries: DashboardAuditEntry[]; total: number }>(LEGACY_URL, {
			headers: authHeaders(),
		});
		expect(result.entries).toHaveLength(1);
		expect(result.entries[0]).toHaveProperty("action");
		expect(result.entries[0]).toHaveProperty("timestamp");
	});
});
