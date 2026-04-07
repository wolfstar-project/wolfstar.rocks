import type {
	FlattenedGuild,
	LoginData,
	OauthFlattenedGuild,
	PartialOauthFlattenedGuild,
	TransformedLoginData,
} from "#shared/types";
import type { DiscordAPIError } from "@discordjs/rest";
import type {
	APIGuild,
	APIGuildMember,
	RESTAPIPartialCurrentUserGuild,
} from "discord-api-types/v10";
import type { H3Event } from "h3";
import { readSettings, readSettingsPermissionNodes } from "#server/database";
import { PermissionsBits } from "#shared/utils/bits";
import { hours } from "#shared/utils/times";
import { REST } from "@discordjs/rest";
import { cast } from "@sapphire/utilities";
import { hasAtLeastOneKeyInMap } from "@sapphire/utilities/hasAtLeastOneKeyInMap";
import { isNullOrUndefined } from "@sapphire/utilities/isNullOrUndefined";
import * as Sentry from "@sentry/nuxt";
import {
	GuildDefaultMessageNotifications,
	GuildExplicitContentFilter,
	GuildFeature,
	GuildMFALevel,
	GuildPremiumTier,
	GuildVerificationLevel,
	Locale,
	PermissionFlagsBits,
} from "discord-api-types/v10";
import { createError } from "evlog";

async function getUserIdFromEvent(event: H3Event): Promise<string> {
	const session = await getUserSession(event);
	const userId = session.user?.id;
	if (!userId) {
		throw errors.unauthorized();
	}
	return userId;
}

// `permissions` is absent on bot-token GET /guilds/{id}/members/{id} responses;
// it is only present on interaction-attached members and GET /users/@me/guilds/{id}/member.
// When absent, fall back to the pre-computed `hasManageGuild` from the OAuth guild object.
function isAdmin(
	member: APIGuildMember,
	roles: readonly string[],
	hasManageGuild = false,
): boolean {
	if (roles.length > 0) {
		return hasAtLeastOneKeyInMap(
			new Map(roles.map((role) => [role, true])),
			member.roles.map((r) => r),
		);
	}

	const rawPermissions = cast<{ permissions?: string }>(member).permissions;
	if (rawPermissions === undefined) {
		return hasManageGuild;
	}

	return PermissionsBits.has(BigInt(rawPermissions), PermissionFlagsBits.ManageGuild);
}

async function manage(guild: APIGuild, member: APIGuildMember, hasManageGuild = false) {
	if (!member.user || !member.user.id) {
		return false;
	}
	if (guild.owner_id === member.user.id) {
		return true;
	}

	const settings = await readSettings(guild.id);
	const nodes = readSettingsPermissionNodes(settings);

	return (
		isAdmin(member, settings.rolesAdmin, hasManageGuild) &&
		((await nodes.run(member, "conf")) ?? true)
	);
}

async function getManageable(
	oauthGuild: RESTAPIPartialCurrentUserGuild,
	guild: APIGuild | undefined,
	userId: string,
): Promise<boolean> {
	if (oauthGuild.owner) {
		return true;
	}

	const oauthPermissions = BigInt(oauthGuild.permissions);
	const hasManageGuild = PermissionsBits.has(oauthPermissions, PermissionFlagsBits.ManageGuild);

	if (isNullOrUndefined(guild)) {
		return hasManageGuild;
	}

	const member = await useApi()
		.guilds.getMember(guild.id, userId)
		.catch(() => undefined);
	if (!member) {
		return hasManageGuild;
	}

	return manage(guild, member, hasManageGuild);
}

export async function transformGuild(
	userId: string,
	data: RESTAPIPartialCurrentUserGuild,
): Promise<OauthFlattenedGuild> {
	const guild = await getGuild(data.id).catch(() => undefined);

	const channels = await getGuildChannels(data.id).catch(() => []);

	const mockGuild = cast<FlattenedGuild>({
		acronym: guildNameToAcronym(data.name),
		afkChannelId: null,
		afkTimeout: 0,
		applicationId: null,
		approximateMemberCount: data.approximate_member_count ?? 0,
		approximatePresenceCount: data.approximate_presence_count ?? 0,
		available: true,
		banner: null,
		channels,
		defaultMessageNotifications: GuildDefaultMessageNotifications.OnlyMentions,
		description: null,
		widgetEnabled: false,
		emojis: [],
		explicitContentFilter: GuildExplicitContentFilter.Disabled,
		icon: data.icon,
		id: data.id,
		joinedTimestamp: null,
		mfaLevel: GuildMFALevel.None,
		name: data.name,
		ownerId: data.owner ? userId : null,
		partnered: data.features.includes(GuildFeature.Partnered) ?? false,
		features: data.features,
		preferredLocale: Locale.EnglishUS,
		premiumSubscriptionCount: null,
		premiumTier: GuildPremiumTier.None,
		roles: [],
		splash: null,
		systemChannelId: null,
		vanityURLCode: null,
		verificationLevel: GuildVerificationLevel.None,
		verified: data.features.includes(GuildFeature.Verified) ?? false,
	});

	const serialized: PartialOauthFlattenedGuild = isNullOrUndefined(guild)
		? mockGuild
		: flattenGuild({
				...guild,
				channels,
			});

	return {
		...serialized,
		manageable: await getManageable(data, guild, userId),
		permissions: Number(data.permissions),
		wolfstarIsIn: !isNullOrUndefined(guild),
	};
}

export async function transformOauthGuildsAndUser({
	user,
	guilds,
}: LoginData): Promise<TransformedLoginData> {
	if (!user || !guilds) {
		return { guilds, user };
	}

	const userId = user.id;

	const transformedGuilds: OauthFlattenedGuild[] = await Promise.all(
		guilds.map((guild) => transformGuild(userId, guild)),
	);

	return { transformedGuilds, user };
}

export async function getCurrentToken(event: H3Event) {
	const tokens = await event.context.$authorization.resolveServerTokens();

	if (
		isNullOrUndefined(tokens) ||
		!("access_token" in tokens) ||
		isNullOrUndefined(tokens.access_token)
	) {
		throw errors.unauthorized();
	}

	return tokens;
}

export const canManage = async (guild: APIGuild, member: APIGuildMember) => {
	const shouldManage = await manage(guild, member);
	if (!shouldManage) {
		throw createError({
			message: "Insufficient permissions",
			status: 403,
			why: "You do not have the required permissions to manage this guild",
			fix: "Ask a server administrator to grant you the Manage Guild permission",
		});
	}
};

export const getCurrentUser = defineCachedFunction(
	async (event: H3Event) => {
		const tokens = await getCurrentToken(event);

		const rest = new REST({
			authPrefix: "Bearer",
		}).setToken(tokens.access_token);

		const api = useApi(rest);

		Sentry.metrics.count("discord_api.call", 1, {
			attributes: { endpoint: "users.getCurrent" },
		});
		const user = await instrumentDiscordApiCall("users.getCurrent", () =>
			api.users.getCurrent(),
		).catch((error: DiscordAPIError) => {
			throw createError({
				cause: error,
				message: "Failed to fetch user data",
				status: 500,
				why: "Discord API returned an error when fetching the current user",
			});
		});

		Sentry.metrics.count("discord_api.call", 1, {
			attributes: { endpoint: "users.getGuilds" },
		});
		const guilds = await instrumentDiscordApiCall("users.getGuilds", () =>
			api.users.getGuilds(),
		).catch((error: DiscordAPIError) => {
			throw createError({
				cause: error,
				message: "Failed to fetch user guilds",
				status: 500,
				why: "Discord API returned an error when fetching the user's guild list",
			});
		});

		return { guilds, user };
	},
	{
		getKey: async (event: H3Event) => {
			const userId = await getUserIdFromEvent(event);
			return userId;
		},
		maxAge: hours(1),
	},
);

export const getCurrentMember = defineCachedFunction(
	async (event: H3Event, guildId: string) => {
		const tokens = await getCurrentToken(event);

		const rest = new REST({
			authPrefix: "Bearer",
		}).setToken(tokens.access_token);

		const api = useApi(rest);

		Sentry.metrics.count("discord_api.call", 1, {
			attributes: { endpoint: "users.getGuildMember", guild_id: guildId },
		});
		const member = await instrumentDiscordApiCall(
			"users.getGuildMember",
			() => api.users.getGuildMember(guildId),
			{ guild_id: guildId },
		).catch((error: DiscordAPIError) => {
			throw createError({
				cause: error,
				message: "Failed to fetch guild member data",
				status: 500,
				why: "Discord API returned an error when fetching the user's guild membership",
			});
		});

		return member;
	},
	{
		getKey: async (event: H3Event, guildId: string) => {
			const userId = await getUserIdFromEvent(event);
			return `user:${userId}:guild:${guildId}`;
		},
		maxAge: hours(1),
	},
);

export const getMember = defineCachedFunction(
	async (guildId: string, userId: string) => {
		const api = useApi();

		Sentry.metrics.count("discord_api.call", 1, {
			attributes: { endpoint: "guilds.getMember", guild_id: guildId },
		});
		const result = await instrumentDiscordApiCall(
			"guilds.getMember",
			() => api.guilds.getMember(guildId, userId),
			{ guild_id: guildId },
		).catch((error) => {
			const discordError = error as DiscordAPIError;

			let message = "";
			switch (discordError.code) {
				case 10_007: {
					// Unknown Member
					message = `Unknown Member: ${userId} in Guild: ${guildId}`;

					break;
				}
				default: {
					message = `Failed to fetch member: ${userId} in Guild: ${guildId}`;
				}
			}

			throw createError({
				cause: error,
				message,
				status: 500,
				why: "Discord API returned an error when fetching the guild member",
			});
		});
		return result;
	},
	{
		maxAge: hours(1),
		getKey: (guildId, userId) => `user:${userId}:guild:${guildId}`,
	},
);

export const getGuildChannels = defineCachedFunction(
	async (guildId: string) => {
		const api = useApi();
		Sentry.metrics.count("discord_api.call", 1, {
			attributes: { endpoint: "guilds.getChannels", guild_id: guildId },
		});
		const result = await instrumentDiscordApiCall(
			"guilds.getChannels",
			() => api.guilds.getChannels(guildId),
			{ guild_id: guildId },
		).catch((error: DiscordAPIError) => {
			throw createError({
				cause: error,
				message: `Failed to fetch channels for guild: ${guildId}`,
				status: 500,
				why: "Discord API returned an error when fetching the guild's channel list",
			});
		});
		return result;
	},
	{
		maxAge: hours(1),
	},
);

export const getGuild = defineCachedFunction(
	async (guildId: string) => {
		const api = useApi();
		Sentry.metrics.count("discord_api.call", 1, {
			attributes: { endpoint: "guilds.get", guild_id: guildId },
		});
		const result = await instrumentDiscordApiCall(
			"guilds.get",
			() => api.guilds.get(guildId, { with_counts: true }),
			{ guild_id: guildId },
		).catch((error: DiscordAPIError) => {
			throw createError({
				cause: error,
				message: `Failed to fetch guild: ${guildId}`,
				status: 500,
				why: "Discord API returned an error when fetching guild data",
			});
		});
		return result;
	},
	{
		maxAge: hours(1),
		getKey: (guildId) => `guild:${guildId}`,
	},
);

export const fetchCommands = defineCachedFunction(
	async () => {
		const {
			public: { apiBaseUrl },
		} = useRuntimeConfig();
		Sentry.metrics.count("bot_api.call", 1, {
			attributes: { endpoint: "commands.fetch" },
		});
		const commands = await instrumentBotApiCall("commands.fetch", () =>
			$fetch<WolfCommand[]>(`${apiBaseUrl}/commands`, {
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			}),
		);
		return commands;
	},
	{
		maxAge: hours(1),
		getKey: () => "commands",
	},
);
