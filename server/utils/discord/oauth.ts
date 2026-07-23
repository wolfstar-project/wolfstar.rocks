import type { DiscordAPIError } from "@discordjs/rest";
import type { APIUser, RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import type { H3Event } from "h3";
import { type DiscordAccessToken, refreshSessionTokens } from "#server/utils/oauth-tokens";
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

async function resolveAccessTokenAfterUnauthorized(
	event: H3Event,
	tokens: DiscordAccessToken,
): Promise<string> {
	const refreshed = await refreshSessionTokens(event, { force: true });

	if (!refreshed?.access_token || refreshed.access_token === tokens.access_token) {
		throw errors.unauthorized();
	}

	return refreshed.access_token;
}

export async function fetchCurrentUserAndGuildsWithRetry(
	event: H3Event,
	tokens: DiscordAccessToken,
): Promise<{
	user: APIUser;
	guilds: RESTAPIPartialCurrentUserGuild[];
}> {
	try {
		return await fetchCurrentUserAndGuilds(tokens.access_token);
	} catch (error) {
		if (!isDiscordUnauthorized(error)) {
			throw error;
		}

		const accessToken = await resolveAccessTokenAfterUnauthorized(event, tokens);
		try {
			return await fetchCurrentUserAndGuilds(accessToken);
		} catch (retryError) {
			if (isDiscordUnauthorized(retryError)) {
				throw errors.unauthorized();
			}
			throw retryError;
		}
	}
}

export async function fetchGuildMemberWithRetry(
	event: H3Event,
	tokens: DiscordAccessToken,
	guildId: string,
) {
	const call = (accessToken: string) => {
		const api = createApiWithToken(accessToken);
		return instrumentDiscordApiCall(
			"users.getGuildMember",
			() => api.users.getGuildMember(guildId),
			{ guild_id: guildId },
		);
	};

	try {
		return await call(tokens.access_token);
	} catch (error) {
		if (!isDiscordUnauthorized(error)) {
			toDiscordFetchError(error, "guild-member");
		}

		const accessToken = await resolveAccessTokenAfterUnauthorized(event, tokens);
		try {
			return await call(accessToken);
		} catch (retryError) {
			toDiscordFetchError(retryError, "guild-member");
		}
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
