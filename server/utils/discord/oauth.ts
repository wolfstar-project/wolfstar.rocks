import type { DiscordAPIError } from "@discordjs/rest";
import type { APIUser, RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { REST } from "@discordjs/rest";
import { createError } from "evlog";

export function isDiscordUnauthorized(error: unknown): boolean {
	const discordError = error as DiscordAPIError;
	return discordError?.status === 401;
}

function createApiWithToken(accessToken: string) {
	const rest = new REST({
		authPrefix: "Bearer",
	}).setToken(accessToken);

	return useApi(rest);
}

export async function fetchCurrentUserAndGuilds(accessToken: string): Promise<{
	user: APIUser;
	guilds: RESTAPIPartialCurrentUserGuild[];
}> {
	const api = createApiWithToken(accessToken);

	const [user, guilds] = await Promise.all([
		instrumentDiscordApiCall("users.getCurrent", () => api.users.getCurrent()).catch(
			(error: unknown) => {
				if (isDiscordUnauthorized(error)) {
					throw error;
				}
				toDiscordFetchError(error, "user");
			},
		),
		instrumentDiscordApiCall("users.getGuilds", () => api.users.getGuilds()).catch(
			(error: unknown) => {
				if (isDiscordUnauthorized(error)) {
					throw error;
				}
				toDiscordFetchError(error, "guilds");
			},
		),
	]);

	return { guilds, user };
}

export async function fetchCurrentUserAndGuildsWithRetry(
	_event: unknown,
	tokens: { access_token: string },
): Promise<{
	user: APIUser;
	guilds: RESTAPIPartialCurrentUserGuild[];
}> {
	// Auth tokens live on the external bot Better Auth server (clientOnly).
	// Nuxt cannot refresh Discord OAuth tokens locally — retry is a single attempt.
	try {
		return await fetchCurrentUserAndGuilds(tokens.access_token);
	} catch (error) {
		if (isDiscordUnauthorized(error)) {
			throw errors.unauthorized();
		}
		throw error;
	}
}

export async function fetchGuildMemberWithRetry(
	_event: unknown,
	tokens: { access_token: string },
	guildId: string,
) {
	const api = createApiWithToken(tokens.access_token);
	try {
		return await instrumentDiscordApiCall(
			"users.getGuildMember",
			() => api.users.getGuildMember(guildId),
			{ guild_id: guildId },
		);
	} catch (error) {
		toDiscordFetchError(error, "guild-member");
	}
}

export function toDiscordFetchError(
	error: unknown,
	resource: "user" | "guilds" | "guild-member",
): never {
	if (isDiscordUnauthorized(error)) {
		throw errors.unauthorized();
	}

	const messages = {
		"guilds": {
			message: "Failed to fetch user guilds",
			why: "Discord API returned an error when fetching the user's guild list",
		},
		"guild-member": {
			message: "Failed to fetch guild member data",
			why: "Discord API returned an error when fetching the user's guild membership",
		},
		"user": {
			message: "Failed to fetch user data",
			why: "Discord API returned an error when fetching the current user",
		},
	} as const;

	const { message, why } = messages[resource];

	throw createError({
		cause: error instanceof Error ? error : undefined,
		message,
		status: 500,
		why,
	});
}
