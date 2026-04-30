import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";

/** 50-guild fixture for mapWithConcurrency load tests. */
export const FIXTURE_OAUTH_GUILDS: RESTAPIPartialCurrentUserGuild[] = Array.from(
	{ length: 50 },
	(_, i) => ({
		id: String(100_000_000_000_000_000n + BigInt(i)).padStart(18, "0"),
		name: `Guild ${i + 1}`,
		icon: null,
		owner: i === 0,
		permissions: "8",
		features: [],
	}),
);
