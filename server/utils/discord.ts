import type {
  FlattenedGuild,
  FlattenedMember,
  LoginData,
  OauthFlattenedGuild,
  PartialOauthFlattenedGuild,
  TransformedLoginData,
} from "#shared/types/discord";
import type { DiscordAPIError } from "@discordjs/rest";
import type {
  APIGuild,
  RESTAPIPartialCurrentUserGuild,
} from "discord-api-types/v10";
import type { H3Event } from "h3";
import { useApi } from "#shared/utils";
import { PermissionsBits } from "#shared/utils/bits";
import { hours } from "#shared/utils/times";
import { REST } from "@discordjs/rest";
import { hasAtLeastOneKeyInMap, isNullOrUndefined } from "@sapphire/utilities";
import {
  GuildDefaultMessageNotifications,
  GuildExplicitContentFilter,
  GuildMFALevel,
  GuildPremiumTier,
  GuildVerificationLevel,
  Locale,
  PermissionFlagsBits,
} from "discord-api-types/v10";
import { readSettings, readSettingsPermissionNodes } from "~~/server/database/settings/functions";
import { flattenGuild } from "~~/server/utils/ApiTransformers";

function isAdmin(member: FlattenedMember, roles: readonly string[]): boolean {
  const permissionsValue
    = "permissions" in member && typeof member.permissions === "string"
      ? member.permissions
      : "0";
  const memberRolePermissions = BigInt(permissionsValue);
  return roles.length === 0
    ? PermissionsBits.has(
        memberRolePermissions,
        PermissionFlagsBits.ManageGuild,
      )
    : hasAtLeastOneKeyInMap(
        new Map(roles.map((role) => [role, true])),
        member.roles.map((role) => role.id),
      );
}

async function canManage(
  guild: APIGuild,
  member: FlattenedMember,
): Promise<boolean> {
  if (!member.user || !member.user.id) {
    return false;
  }
  if (guild.owner_id === member.user.id)
    return true;

  const settings = await readSettings(guild.id);
  const nodes = readSettingsPermissionNodes(settings);
  return isAdmin(member, settings.rolesAdmin) && (await nodes.run(member, "conf") ?? true);
}

async function getManageable(
  id: string,
  oauthGuild: RESTAPIPartialCurrentUserGuild,
  guild: APIGuild | undefined,
): Promise<boolean> {
  if (oauthGuild.owner)
    return true;
  if (isNullOrUndefined(guild)) {
    return PermissionsBits.has(
      BigInt(oauthGuild.permissions),
      PermissionFlagsBits.ManageGuild,
    );
  }

  const member = await getMember(guild.id, id);
  const flattenedMember = flattenMember(member, guild);
  if (!member)
    return false;

  return canManage(guild, flattenedMember);
}

export async function transformGuild(
  userId: string,
  data: RESTAPIPartialCurrentUserGuild,
): Promise<OauthFlattenedGuild> {
  const guild = await useApi()
    .guilds
    .get(data.id, {
      with_counts: true,
    })
    .catch(() => undefined);

  const mockGuild = {
    afkChannelId: null,
    afkTimeout: 60,
    applicationId: null,
    approximateMemberCount: 0,
    approximatePresenceCount: null,
    available: true,
    banner: null,
    channels: [],
    defaultMessageNotifications: GuildDefaultMessageNotifications.OnlyMentions,
    description: null,
    widgetEnabled: false,
    explicitContentFilter: GuildExplicitContentFilter.Disabled,
    emojis: [],
    icon: data.icon,
    id: data.id,
    joinedTimestamp: null,
    mfaLevel: GuildMFALevel.None,
    name: data.name,
    ownerId: data.owner ? userId : null,
    partnered: false,
    preferredLocale: Locale.EnglishUS,
    premiumSubscriptionCount: null,
    premiumTier: GuildPremiumTier.None,
    roles: [],
    splash: null,
    systemChannelId: null,
    vanityURLCode: null,
    verificationLevel: GuildVerificationLevel.None,
    verified: false,
  } as unknown as FlattenedGuild;

  const serialized: PartialOauthFlattenedGuild
    = guild === undefined
      ? mockGuild
      : flattenGuild({
          ...guild,
          channels: (await useApi().guilds.getChannels(guild.id)) as any,
        });

  return {
    ...serialized,
    permissions: Number(data.permissions),
    manageable: await getManageable(userId, data, guild),
    wolfstarIsIn: guild !== undefined,
  };
}

export async function transformOauthGuildsAndUser({
  user,
  guilds,
}: LoginData): Promise<TransformedLoginData> {
  if (!user || !guilds)
    return { user, guilds };

  const userId = user.id;

  const transformedGuilds = await Promise.all(
    guilds.map((guild) => transformGuild(userId, guild)),
  );
  return { user, transformedGuilds };
}

export const getCurrentToken = defineCachedFunction(async (event: H3Event) => {
  // Get session token
  const tokens = await event.context.$authorization.resolveServerTokens();

  if (
    isNullOrUndefined(tokens)
    || !("access_token" in tokens)
    || isNullOrUndefined(tokens.access_token)
  ) {
    throw createError({
      status: 401,
      message: "Authentication required",
      data: {
        error: "no_access_token",
        message: "None tokens OR access token not found",
      },
    });
  }

  return tokens;
}, {
  maxAge: days(7),
});

export const getCurrentUser = defineCachedFunction(async (event: H3Event) => {
  const tokens = await event.context.$authorization.resolveServerTokens();

  if (
    isNullOrUndefined(tokens)
    || !("access_token" in tokens)
    || isNullOrUndefined(tokens.access_token)
  ) {
    throw createError({
      status: 401,
      message: "Authentication required",
      data: {
        error: "no_access_token",
        message: "None tokens OR access token not found",
      },
    });
  }

  // Initialize REST client
  const rest = new REST({
    authPrefix: "Bearer",
  }).setToken(tokens.access_token);

  const api = useApi(rest);

  const user = await api.users.getCurrent().catch((error: DiscordAPIError) => {
    throw createError({
      status: 500,
      message: "Failed to fetch user data",
      cause: error,
    });
  });

  const guilds = await api.users.getGuilds().catch((error: DiscordAPIError) => {
    throw createError({
      status: 500,
      message: "Failed to fetch user guilds",
      cause: error,
    });
  });

  return { user, guilds };
}, {
  maxAge: hours(1),
});

export const getMember = defineCachedFunction(async (guildId: string, userId: string) => {
  const api = useApi();

  const result = await api.guilds
    .getMember(guildId, userId)
    .catch((error) => {
      const discordError = error as DiscordAPIError;

      let message = "";
      switch (discordError.code) {
        case 10007: // Unknown Member
          message = `Unknown Member: ${userId} in Guild: ${guildId}`;

          break;
        default:
          message = `Failed to fetch member: ${userId} in Guild: ${guildId}`;
      }

      throw createError({
        status: 500,
        message,
      });
    });
  return result;
}, {
  maxAge: hours(1),
});

export const getGuildChannels = defineCachedFunction(async (guildId: string) => {
  const api = useApi();
  const result = await api.guilds
    .getChannels(guildId)
    .catch(() => {
      throw createError({
        status: 500,
        message: `Failed to fetch channels for guild: ${guildId}`,
      });
    });
  return result;
}, {
  maxAge: hours(1),
});

export const getGuild = defineCachedFunction(async (guildId: string) => {
  const api = useApi();
  const result = await api.guilds
    .get(guildId, { with_counts: true })
    .catch(() => {
      throw createError({
        status: 500,
        message: `Failed to fetch guild: ${guildId}`,
      });
    });
  return result;
}, {
  maxAge: hours(1),
});

export const fetchCommands = defineCachedFunction(async () => {
  const { public: { app: { apiBaseUrl } } } = runtimeConfig;

  if (!apiBaseUrl) {
    throw createError({
      status: 500,
      message: "Bot API base URL is not configured",
    });
  }

  const commands = await $fetch<FlattenedCommand[]>(`/commands`, {
    method: "GET",
    baseURL: apiBaseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return commands;
}, {
  maxAge: hours(1),
});
