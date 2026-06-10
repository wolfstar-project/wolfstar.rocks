import { http, HttpResponse } from "msw";
import { mockCommands, mockGuildList, mockUser } from "./fixtures";

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

	http.get("/api/guilds/:guildId/settings", () =>
		HttpResponse.json({
			guildId: "123456789012345678",
			prefix: "!",
			language: "en-US",
		}),
	),

	// External WolfStar bot API — proxied through createApiComposable("/commands")
	http.get(/\/commands$/, () => HttpResponse.json(mockCommands)),
];
