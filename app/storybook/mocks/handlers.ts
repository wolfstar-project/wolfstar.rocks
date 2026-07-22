import { http, HttpResponse } from "msw";
import { mockCommands, mockGuild, mockGuildList, mockUser } from "./fixtures";

export const handlers = [
	http.get("/api/auth/session", () =>
		HttpResponse.json({
			user: mockUser,
		}),
	),

	http.get("*/users/@me", () =>
		HttpResponse.json({
			user: mockUser,
			guilds: mockGuildList,
			transformedGuilds: mockGuildList,
		}),
	),

	http.get("/api/guilds", () => HttpResponse.json(mockGuildList)),

	// `$api` hits NUXT_PUBLIC_API_BASE_URL directly (legacy-style).
	http.get("*/guilds/:guildId", () => HttpResponse.json(mockGuild)),
	http.get("*/guilds/:guildId/audit-logs", () => HttpResponse.json({ entries: [], total: 0 })),
	http.get("*/guilds/:guildId/settings", () =>
		HttpResponse.json({
			guildId: "123456789012345678",
			prefix: "!",
			language: "en-US",
		}),
	),
	http.get(/\/commands$/, () => HttpResponse.json(mockCommands)),
	http.get(/\/languages$/, () => HttpResponse.json(["en-US", "es-ES", "fr-FR"])),
];
