import type {
  FlattenedGuild,
  LoginData,
  OauthFlattenedGuild,
  PartialOauthFlattenedGuild,
  TransformedLoginData,
} from "#shared/types/discord";
import type {
  APIGuild,
  APIGuildMember,
  APIUser,
  RESTAPIPartialCurrentUserGuild,
} from "discord-api-types/v10";
import type { H3Event } from "h3";
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
import { readSettings } from "~~/server/database/settings/functions";
import { flattenGuild } from "~~/server/utils/ApiTransformers";
import { PermissionsBits } from "~/utils/bits";

function isAdmin(member: APIGuildMember, roles: readonly string[]): boolean {
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
        member.roles,
      );
}

async function canManage(
  guild: APIGuild,
  member: APIGuildMember,
): Promise<boolean> {
  if (!member.user || !member.user.id) {
    return false;
  }
  if (guild.owner_id === member.user.id)
    return true;

  const settings = await readSettings(guild.id);
  return isAdmin(member, settings.rolesAdmin);
}

async function getManageable(
  id: string,
  oauthGuild: RESTAPIPartialCurrentUserGuild,
  guild: APIGuild | undefined,
): Promise<boolean> {
  if (oauthGuild.owner)
    return true;
  if (typeof guild === "undefined") {
    return PermissionsBits.has(
      BigInt(oauthGuild.permissions),
      PermissionFlagsBits.ManageGuild,
    );
  }

  const member = await useApi().guilds.getMember(guild.id, id);
  if (!member)
    return false;

  return canManage(guild, member);
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

export const getGuilds = defineCachedFunction(
  async () => {
    const api = useApi();

    const guilds = await api.users.getGuilds().catch((error) => {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch guilds",
        data: {
          error: "guilds_fetch_failed",
          message: error.message || "Unknown error",
          details: error,
        },
      });
    });
    return guilds;
  },
  {
    maxAge: hours(1),
  },
);

export const getGuild = defineCachedFunction(
  async (_event: H3Event, guildId: string) => {
    const api = useApi();
    const guild = await api.guilds
      .get(guildId, { with_counts: true })
      .catch((error) => {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to fetch guilds",
          data: {
            field: "guild",
            error: "guilds_fetch_failed",
            message: error.message || "Unknown error",
            details: error,
          },
        });
      });
    return guild;
  },
  {
    getKey: (_event, guildId) => `guild:${guildId}`,
    maxAge: hours(1),
  },
);

export const getCurrentUser = defineCachedFunction(
  async (event: H3Event) => {
    // Get session token
    const tokens = await event.context.$authorization.resolveServerTokens();

    if (
      isNullOrUndefined(tokens)
      || !("access_token" in tokens)
      || isNullOrUndefined(tokens.access_token)
    ) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
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

    const user = await api.users.getCurrent().catch((error) => {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch user data",
        data: {
          field: "user",
          error: "user_fetch_failed",
          message: error.message || "Unknown error",
          details: error,
        },
      });
    });
    return user;
  },
  {
    maxAge: hours(1),
  },
);

export const getMember = defineCachedFunction(
  async (_event: H3Event, guild: APIGuild, user: APIUser) => {
    const api = useApi();
    const member = await api.guilds
      .getMember(guild.id, user.id)
      .catch((error) => {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to fetch member",
          data: {
            field: "member",
            error: "member_fetch_failed",
            message: error.message || "Unknown error",
            details: error,
          },
        });
      });
    return member;
  },
  {
    getKey: (_event, guild, user) => `guild:${guild.id}member:${user.id}`,
    maxAge: hours(1),
  },
);
