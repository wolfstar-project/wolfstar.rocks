import { http, HttpResponse } from "msw";
import { mockCommands, mockGuild, mockGuildList, mockUser } from "./fixtures";

export const handlers = [
	http.get("/api/auth/session", () =>
		HttpResponse.json({
			user: mockUser,
		}),
	),

	http.get("/api/users", () =>
		HttpResponse.json({
			user: mockUser,
			guilds: mockGuildList,
			transformedGuilds: mockGuildList,
		}),
	),

	http.get("/api/guilds", () => HttpResponse.json(mockGuildList)),

	// `$api` client BFF (`/api/bot/**` → bot API paths)
	http.get("/api/bot/guilds/:guildId", () => HttpResponse.json(mockGuild)),
	http.get("/api/bot/guilds/:guildId/audit-logs", () =>
		HttpResponse.json({ entries: [], total: 0 }),
	),
	http.get("/api/bot/guilds/:guildId/settings", () =>
		HttpResponse.json({
			guildId: "123456789012345678",
			prefix: "!",
			language: "en-US",
		}),
	),
	http.get(/\/api\/bot\/commands$/, () => HttpResponse.json(mockCommands)),
	http.get(/\/api\/bot\/languages$/, () => HttpResponse.json(["en-US", "es-ES", "fr-FR"])),
];
