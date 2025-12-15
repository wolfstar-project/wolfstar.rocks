import type { User } from "#auth-utils";
import type {
  FlattenedCommand,
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
  APIUser,
  RESTAPIPartialCurrentUserGuild,
} from "discord-api-types/v10";
import type { H3Event } from "h3";
import { hours, minutes } from "#shared/utils/times";
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
import { PermissionsBits } from "~/utils/bits";

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

  const member = await getMember(guild, id);
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

export const getCurrentUser = defineCachedFunction(async (event: H3Event) => {
  // Get session token
  const tokens = await event.context.$authorization.resolveServerTokens();

  if (
    isNullOrUndefined(tokens)
    || !("access_token" in tokens)
    || isNullOrUndefined(tokens.access_token)
  ) {
    throw createApiError({
      statusCode: 401,
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
    throw createApiError({
      statusCode: 500,
      message: "Failed to fetch user data",
      error,
    });
  });

  const guilds = await api.users.getGuilds().catch((error: DiscordAPIError) => {
    throw createApiError({
      statusCode: 500,
      message: "Failed to fetch user guilds",
      error,
    });
  });

  return { user, guilds };
}, {
  maxAge: hours(1),
});

export const getMember = defineCachedFunction(async (guild: APIGuild | string, user: User | APIUser | string) => {
  const api = useApi();
  try {
    const result = await api.guilds
      .getMember(typeof guild === "string" ? guild : guild.id, typeof user === "string" ? user : user.id);
    return result;
  }
  catch (err) {
    const discordError = err as DiscordAPIError;

    const errors: Record<number, string> = {
      10007: `Unknown Member: ${typeof user === "string" ? user : user.id} in Guild: ${typeof guild === "string" ? guild : guild.id}`,
    };
    const defaultMessage = `Failed to fetch member: ${typeof user === "string" ? user : user.id} in Guild: ${typeof guild === "string" ? guild : guild.id}`;

    throw createApiError({
      statusCode: 500,
      message: errors[discordError.code as number] ?? defaultMessage,
    });
  }
}, {
  maxAge: hours(1),
});

export const getGuildChannels = defineCachedFunction(async (guildId: string) => {
  const api = useApi();
  try {
    const result = await api.guilds
      .getChannels(guildId);
    return result;
  }
  catch (err) {
    throw createApiError({
      statusCode: 500,
      message: `Failed to fetch channels for guild: ${guildId}`,
      error: err as Error,
    });
  }
}, {
  maxAge: hours(1),
});

export const getGuild = defineCachedFunction(async (guildId: string) => {
  const api = useApi();
  try {
    const result = await api.guilds
      .get(guildId, { with_counts: true });
    return result;
  }
  catch (err) {
    throw createApiError({
      statusCode: 500,
      message: `Failed to fetch guild: ${guildId}`,
      error: err as Error,
    });
  }
}, {
  maxAge: hours(1),
});

export const fetchCommands = defineCachedFunction(async () => {
  try {
    const config = runtimeConfig;
    const { apiBaseUrl } = config.public.app;

    if (!apiBaseUrl) {
      throw new Error("Bot API base URL is not configured");
    }

    // Fetch commands from the bot API
    const commands = await $fetch<FlattenedCommand[]>(`/commands`, {
      method: "GET",
      baseURL: apiBaseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return commands;
  }
  catch (error) {
    throw createApiError({
      statusCode: 500,
      message: "Failed to fetch commands from bot API",
      error: error as Error,
    });
  }
}, {
  maxAge: minutes(5),
});
