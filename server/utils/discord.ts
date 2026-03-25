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
import {
	GuildDefaultMessageNotifications,
	GuildExplicitContentFilter,
	GuildMFALevel,
	GuildPremiumTier,
	GuildVerificationLevel,
	Locale,
	PermissionFlagsBits,
} from "discord-api-types/v10";
import { createError } from "evlog";

// Limits concurrent guild transform API calls to avoid Discord rate limits
const GUILD_TRANSFORM_BATCH_SIZE = 10;

async function getUserIdFromEvent(event: H3Event): Promise<string> {
	const session = await getUserSession(event);
	const userId = session.user?.id;
	if (!userId) {
		throw errors.unauthorized();
	}
	return userId;
}

function isAdmin(member: APIGuildMember, roles: readonly string[]): boolean {
	const memberRolePermissions = BigInt(cast<{ permissions: string }>(member).permissions);
	return roles.length === 0
		? PermissionsBits.has(memberRolePermissions, PermissionFlagsBits.ManageGuild)
		: hasAtLeastOneKeyInMap(
				new Map(roles.map((role) => [role, true])),
				member.roles.map((r) => r),
			);
}

async function manage(guild: APIGuild, member: APIGuildMember) {
	if (!member.user || !member.user.id) {
		return false;
	}
	if (guild.owner_id === member.user.id) {
		return true;
	}

	const settings = await readSettings(guild.id);
	const nodes = readSettingsPermissionNodes(settings);
	const commands = await fetchCommands();
	const conf = commands.find((cmd) => cmd.name === "conf");

	return (
		isAdmin(member, settings.rolesAdmin) &&
		(conf ? ((await nodes.run(member, conf)) ?? true) : true)
	);
}

async function getManageable(
	oauthGuild: RESTAPIPartialCurrentUserGuild,
	guild: APIGuild | undefined,
): Promise<boolean> {
	if (oauthGuild.owner) {
		return true;
	}
	if (isNullOrUndefined(guild)) {
		return PermissionsBits.has(BigInt(oauthGuild.permissions), PermissionFlagsBits.ManageGuild);
	}

	const member = await useApi()
		.users.getGuildMember(guild.id)
		.catch(() => undefined);
	if (!member) {
		return false;
	}

	return manage(guild, member);
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
		afkTimeout: 60,
		applicationId: null,
		approximateMemberCount: data.approximate_member_count ?? 0,
		approximatePresenceCount: data.approximate_presence_count ?? 0,
		available: true,
		banner: null,
		channels,
		defaultMessageNotifications: GuildDefaultMessageNotifications.OnlyMentions,
		description: null,
		emojis: [],
		explicitContentFilter: GuildExplicitContentFilter.Disabled,
		icon: data.icon,
		id: data.id,
		joinedTimestamp: null,
		mfaLevel: GuildMFALevel.None,
		name: data.name,
		ownerId: data.owner ? userId : null,
		partnered: false,
		permissions: Number(data.permissions),
		preferredLocale: Locale.EnglishUS,
		premiumSubscriptionCount: null,
		premiumTier: GuildPremiumTier.None,
		roles: [],
		splash: null,
		systemChannelId: null,
		vanityURLCode: null,
		verificationLevel: GuildVerificationLevel.None,
		verified: false,
		widgetEnabled: false,
	});

	const serialized: PartialOauthFlattenedGuild = isNullOrUndefined(guild)
		? mockGuild
		: flattenGuild({
				...guild,
				channels,
			});

	return {
		...serialized,
		manageable: await getManageable(data, guild),
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
	const transformedGuilds: OauthFlattenedGuild[] = [];

	for (let i = 0; i < guilds.length; i += GUILD_TRANSFORM_BATCH_SIZE) {
		const batch = guilds.slice(i, i + GUILD_TRANSFORM_BATCH_SIZE);
		const results = await Promise.all(batch.map((guild) => transformGuild(userId, guild)));
		transformedGuilds.push(...results);
	}

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

		const user = await api.users.getCurrent().catch((error: DiscordAPIError) => {
			throw createError({
				cause: error,
				message: "Failed to fetch user data",
				status: 500,
				why: "Discord API returned an error when fetching the current user",
			});
		});

		const guilds = await api.users.getGuilds().catch((error: DiscordAPIError) => {
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

		const member = await api.users.getGuildMember(guildId).catch((error: DiscordAPIError) => {
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
			return `${userId}:${guildId}`;
		},
		maxAge: hours(1),
	},
);

export const getMember = defineCachedFunction(
	async (guildId: string, userId: string) => {
		const api = useApi();

		const result = await api.guilds.getMember(guildId, userId).catch((error) => {
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
	},
);

export const getGuildChannels = defineCachedFunction(
	async (guildId: string) => {
		const api = useApi();
		const result = await api.guilds.getChannels(guildId).catch((error: DiscordAPIError) => {
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
		const result = await api.guilds
			.get(guildId, { with_counts: true })
			.catch((error: DiscordAPIError) => {
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
	},
);

export const fetchCommands = defineCachedFunction(
	async () => {
		const {
			public: { apiBaseUrl },
		} = useRuntimeConfig();
		const commands = await $fetch<WolfCommand[]>(`${apiBaseUrl}/commands`, {
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		});
		return commands;
	},
	{
		maxAge: hours(1),
	},
);
