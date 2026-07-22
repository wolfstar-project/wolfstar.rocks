/**
 * Pre-built fixture objects for API contract tests.
 *
 * These fixtures are intentionally lightweight – they capture the *shape* that
 * each endpoint is expected to return so that tests can use `toMatchObject` or
 * `toHaveProperty` assertions without knowing every implementation detail.
 *
 * All factories re-use the canonical mock builders from `test/mocks/discord.ts`
 * to stay consistent with the rest of the test suite.
 */
import { createMockChannel, createMockCompleteGuild, createMockRole } from "~~/test/mocks/discord";
import { GUILD_ID, OWNER_USER_ID } from "./_helpers";

// ─── Guilds ──────────────────────────────────────────────────────────────────

/** Full guild with channels, roles and emojis – used by guild list / index tests. */
export const FIXTURE_GUILD = createMockCompleteGuild({
	guildOverrides: { id: GUILD_ID, ownerId: OWNER_USER_ID },
	numChannels: 2,
	numEmojis: 1,
	numRoles: 2,
});

// ─── Channels ────────────────────────────────────────────────────────────────

/** Two generic text channels belonging to {@link GUILD_ID}. */
export const FIXTURE_CHANNELS = [
	createMockChannel({ guildId: GUILD_ID, id: "333333333333333330", name: "general" }),
	createMockChannel({ guildId: GUILD_ID, id: "333333333333333331", name: "off-topic" }),
];

/** A single channel looked up by ID in single-channel tests. */
export const FIXTURE_CHANNEL = FIXTURE_CHANNELS[0]!;

// ─── Roles ───────────────────────────────────────────────────────────────────

export const FIXTURE_ROLE = createMockRole({ guildId: GUILD_ID, id: "444444444444444440" });
