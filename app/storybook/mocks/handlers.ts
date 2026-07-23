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

	// The dashboard layout fetches the single guild to hydrate guild state.
	http.get("/api/guilds/:guildId", () => HttpResponse.json(mockGuild)),

	// The dashboard activity feed (General.vue) requests the guild audit log.
	http.get("/api/guilds/:guildId/logs", () => HttpResponse.json({ entries: [], total: 0 })),

	http.get("/api/guilds/:guildId/settings", () =>
		HttpResponse.json({
			guildId: "123456789012345678",
			prefix: "!",
			language: "en-US",
		}),
	),

	// External WolfStar bot API — proxied through createApiComposable("/commands")
	http.get(/\/commands$/, () => HttpResponse.json(mockCommands)),

	// External WolfStar bot API, proxied through createApiComposable("/languages").
	// The dashboard manage page requests this on mount for the default section.
	http.get(/\/languages$/, () => HttpResponse.json(["en-US", "es-ES", "fr-FR"])),
];
