import { http, HttpResponse } from "msw";
import { mockCommands, mockGuild, mockGuildList, mockUser } from "./fixtures";

/**
 * Client `$api` goes through the same-origin BFF (`/api/bot/**`).
 * Storybook has no Nitro, so MSW serves the bot payload on those paths.
 */
const BOT_BFF = "/api/bot";

export const handlers = [
	http.get("/api/auth/session", () =>
		HttpResponse.json({
			user: mockUser,
		}),
	),

	http.get(`${BOT_BFF}/users/@me`, () =>
		HttpResponse.json({
			user: mockUser,
			guilds: mockGuildList,
			transformedGuilds: mockGuildList,
		}),
	),

	http.get("/api/guilds", () => HttpResponse.json(mockGuildList)),

	http.get(`${BOT_BFF}/guilds/:guildId`, () => HttpResponse.json(mockGuild)),
	http.get(`${BOT_BFF}/guilds/:guildId/audit-logs`, () =>
		HttpResponse.json({ entries: [], total: 0 }),
	),
	http.get(`${BOT_BFF}/guilds/:guildId/settings`, () =>
		HttpResponse.json({
			guildId: "123456789012345678",
			prefix: "!",
			language: "en-US",
		}),
	),
	http.get(`${BOT_BFF}/commands`, () => HttpResponse.json(mockCommands)),
	http.get(`${BOT_BFF}/languages`, () => HttpResponse.json(["en-US", "es-ES", "fr-FR"])),
];
