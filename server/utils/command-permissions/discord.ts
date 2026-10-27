import type { Overwrite } from "#shared/utils/command-permissions";
import type { API } from "@discordjs/core/http-only";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { DiscordAPIError } from "@discordjs/rest";
import { ApplicationCommandType, RESTJSONErrorCodes } from "discord-api-types/v10";
import { createError } from "evlog";

/** A chat input command as Discord registered it for the bot, globally or in this server. */
export interface DiscordCommand {
	id: string;
	name: string;
	defaultMemberPermissions: string | null;
}

/** The bot's application id: the OAuth client is the bot's own application. */
export function applicationId(): string {
	const id = runtimeConfig.discord.clientId;
	if (!id) {
		throw createError({
			message: "The Discord application is not configured",
			status: 500,
			why: "NUXT_OAUTH_DISCORD_CLIENT_ID is not set",
			fix: "Set NUXT_OAUTH_DISCORD_CLIENT_ID to the bot's application id",
		});
	}
	return id;
}

/** The bot's chat input commands in a server, read from Discord: the ids differ per environment. */
export async function loadDiscordCommands(
	api: API,
	appId: string,
	guildId: string,
): Promise<DiscordCommand[]> {
	const [global, guild] = await Promise.all([
		api.applicationCommands.getGlobalCommands(appId),
		api.applicationCommands.getGuildCommands(appId, guildId),
	]);
	return [...global, ...guild]
		.filter(
			(command) =>
				(command.type ?? ApplicationCommandType.ChatInput) ===
				ApplicationCommandType.ChatInput,
		)
		.map((command) => ({
			id: command.id,
			name: command.name,
			defaultMemberPermissions: command.default_member_permissions ?? null,
		}));
}

function isUnknownPermissions(error: unknown): boolean {
	return (
		error instanceof DiscordAPIError &&
		error.code === RESTJSONErrorCodes.UnknownApplicationCommandPermissions
	);
}

/** Discord's sets for the server, keyed by command id (the application id for the app default). */
export async function loadPermissionSets(
	api: API,
	appId: string,
	guildId: string,
): Promise<Record<string, Overwrite[]>> {
	const sets = await api.applicationCommands
		.getGuildCommandsPermissions(appId, guildId)
		.catch((error: unknown) => {
			if (isUnknownPermissions(error)) return [];
			throw error;
		});
	return Object.fromEntries(sets.map((set) => [set.id, set.permissions]));
}

/** One command's set as Discord has it now; empty when it has none. */
export async function loadPermissionSet(
	api: API,
	appId: string,
	guildId: string,
	commandId: string,
): Promise<Overwrite[]> {
	return api.applicationCommands
		.getGuildCommandPermissions(appId, guildId, commandId)
		.then((set) => set.permissions)
		.catch((error: unknown) => {
			if (isUnknownPermissions(error)) return [];
			throw error;
		});
}
