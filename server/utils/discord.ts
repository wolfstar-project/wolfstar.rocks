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
import { readSettings, readSettingsPermissionNodes } from "~~/server/database";

function isAdmin(member: APIGuildMember, roles: readonly string[]): boolean {
  const memberRolePermissions = BigInt(cast<{ permissions: string }>(member).permissions);
  return roles.length === 0
    ? PermissionsBits.has(memberRolePermissions, PermissionFlagsBits.ManageGuild)
    : hasAtLeastOneKeyInMap(new Map(roles.map(role => [role, true])), member.roles.map(r => r));
}

async function manageAbility(guild: APIGuild, member: APIGuildMember) {
  if (!member.user || !member.user.id) {
    return false;
  }
  if (guild.owner_id === member.user.id)
    return true;

  const settings = await readSettings(guild.id);
  const nodes = readSettingsPermissionNodes(settings);
  const commands = await fetchCommands();
  const conf = commands.find(cmd => cmd.name === "conf");

  return isAdmin(member, settings.rolesAdmin) && (conf ? await nodes.run(member, conf) ?? true : true);
};

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

  const member = await useApi().guilds.getMember(guild.id, id).catch(() => undefined);
  if (!member)
    return false;

  return manageAbility(guild, member);
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

  const channels = isNullOrUndefined(data) ? [] : await useApi().guilds.getChannels(data.id).catch(() => []);

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
    widgetEnabled: false,
    explicitContentFilter: GuildExplicitContentFilter.Disabled,
    emojis: [],
    icon: data.icon,
    id: data.id,
    joinedTimestamp: null,
    mfaLevel: GuildMFALevel.None,
    name: data.name,
    ownerId: data.owner ? userId : null,
    permissions: Number(data.permissions),
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
  });

  const serialized: PartialOauthFlattenedGuild
    = isNullOrUndefined(guild)
      ? mockGuild
      : flattenGuild({
          ...guild,
          channels,
        });

  return {
    ...serialized,
    permissions: Number(data.permissions),
    manageable: await getManageable(userId, data, guild),
    wolfstarIsIn: !isNullOrUndefined(guild),
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
