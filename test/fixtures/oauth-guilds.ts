import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";

/** Returns a fresh 50-guild array for mapWithConcurrency load tests. */
export function createFixtureOauthGuilds(): RESTAPIPartialCurrentUserGuild[] {
	return Array.from({ length: 50 }, (_, i) => ({
		id: String(100_000_000_000_000_000n + BigInt(i)).padStart(18, "0"),
		name: `Guild ${i + 1}`,
		icon: null,
		owner: i === 0,
		permissions: "8",
		features: [],
	}));
}
