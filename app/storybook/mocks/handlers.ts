import { http, HttpResponse } from "msw";
import { mockCommands, mockGuild, mockGuildList, mockUser } from "./fixtures";

/**
 * Client `$api` hits `NUXT_PUBLIC_API_BASE_URL` directly (legacy-style).
 * Storybook pins that origin to `http://localhost:8282`.
 */
const BOT_API = "http://localhost:8282";

export const handlers = [
	http.get("/api/auth/session", () =>
		HttpResponse.json({
			user: mockUser,
		}),
	),

	http.get(`${BOT_API}/users/@me`, () =>
		HttpResponse.json({
			user: mockUser,
			guilds: mockGuildList,
			transformedGuilds: mockGuildList,
		}),
	),

	http.post(`${BOT_API}/oauth/callback`, () =>
		HttpResponse.json({
			user: mockUser,
			guilds: mockGuildList,
			transformedGuilds: mockGuildList,
		}),
	),
	http.post(`${BOT_API}/oauth/logout`, () => HttpResponse.json({ success: true })),

	http.get(`${BOT_API}/guilds/:guildId`, () => HttpResponse.json(mockGuild)),
	http.get(`${BOT_API}/guilds/:guildId/audit-logs`, () =>
		HttpResponse.json({ entries: [], total: 0 }),
	),
	http.get(`${BOT_API}/guilds/:guildId/settings`, () =>
		HttpResponse.json({
			guildId: "123456789012345678",
			prefix: "!",
			language: "en-US",
		}),
	),
	http.get(`${BOT_API}/commands`, () => HttpResponse.json(mockCommands)),
	http.get(`${BOT_API}/languages`, () => HttpResponse.json(["en-US", "es-ES", "fr-FR"])),
];
