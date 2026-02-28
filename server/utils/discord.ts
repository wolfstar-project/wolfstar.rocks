import type {
	FlattenedGuild,
	LoginData,
	OauthFlattenedGuild,
	PartialOauthFlattenedGuild,
	TransformedLoginData,
} from "#shared/types/discord";
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
	const guild = await useApi()
		.guilds.get(data.id, {
			with_counts: true,
		})
		.catch(() => undefined);

	const channels = isNullOrUndefined(data)
		? []
		: await useApi()
				.guilds.getChannels(data.id)
				.catch(() => []);

	const mockGuild = cast<FlattenedGuild>({
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

	const transformedGuilds = await Promise.all(
		guilds.map((guild) => transformGuild(userId, guild)),
	);
	return { transformedGuilds, user };
}

export const getCurrentToken = defineCachedFunction(
	async (event: H3Event) => {
		const tokens = await event.context.$authorization.resolveServerTokens();

		if (
			isNullOrUndefined(tokens) ||
			!("access_token" in tokens) ||
			isNullOrUndefined(tokens.access_token)
		) {
			throw createError({
				data: {
					error: "no_access_token",
					message: "None tokens OR access token not found",
				},
				message: "Authentication required",
				status: 401,
			});
		}

		return tokens;
	},
	{
		maxAge: days(7),
	},
);

export const canManage = async (guild: APIGuild, member: APIGuildMember) => {
	const shouldManage = await manage(guild, member);
	if (!shouldManage) {
		throw createError({
			data: {
				details: {
					guild: guild.id,
					member: member.user.id,
				},
				error: "insufficient_permissions",
				message: "Insufficient permissions",
			},
			message: "Insufficient permissions",
			status: 403,
		});
	}
};

export const getCurrentUser = defineCachedFunction(
	async (event: H3Event) => {
		const tokens = await event.context.$authorization.resolveServerTokens();

		if (
			isNullOrUndefined(tokens) ||
			!("access_token" in tokens) ||
			isNullOrUndefined(tokens.access_token)
		) {
			throw createError({
				data: {
					error: "no_access_token",
					message: "None tokens OR access token not found",
				},
				message: "Authentication required",
				status: 401,
			});
		}

		const rest = new REST({
			authPrefix: "Bearer",
		}).setToken(tokens.access_token);

		const api = useApi(rest);

		const user = await api.users.getCurrent().catch((error: DiscordAPIError) => {
			throw createError({
				cause: error,
				message: "Failed to fetch user data",
				status: 500,
			});
		});

		const guilds = await api.users.getGuilds().catch((error: DiscordAPIError) => {
			throw createError({
				cause: error,
				message: "Failed to fetch user guilds",
				status: 500,
			});
		});

		return { guilds, user };
	},
	{
		maxAge: hours(1),
	},
);

export const getCurrentMember = defineCachedFunction(
	async (event: H3Event, guildId: string) => {
		const tokens = await event.context.$authorization.resolveServerTokens();

		if (
			isNullOrUndefined(tokens) ||
			!("access_token" in tokens) ||
			isNullOrUndefined(tokens.access_token)
		) {
			throw createError({
				data: {
					error: "no_access_token",
					message: "None tokens OR access token not found",
				},
				message: "Authentication required",
				status: 401,
			});
		}

		const rest = new REST({
			authPrefix: "Bearer",
		}).setToken(tokens.access_token);

		const api = useApi(rest);

		const member = await api.users.getGuildMember(guildId).catch((error: DiscordAPIError) => {
			throw createError({
				cause: error,
				message: "Failed to fetch user data",
				status: 500,
			});
		});

		return member;
	},
	{
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
		const commands = await $fetch<WolfCommand[]>(`/api/commands`, {
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			method: "GET",
		});

		return commands;
	},
	{
		maxAge: hours(1),
	},
);
