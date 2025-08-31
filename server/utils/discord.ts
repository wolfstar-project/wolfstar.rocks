import type { APIGuild, APIGuildMember, APIUser, RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import type { H3Event } from "h3";
import type { FlattenedGuild, LoginData, OauthFlattenedGuild, PartialOauthFlattenedGuild, TransformedLoginData } from "#shared/types/discord";
import { hasAtLeastOneKeyInMap } from "@sapphire/utilities";
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
import useApi from "~~/server/utils/api";
import { flattenGuild } from "~~/server/utils/ApiTransformers";
import { PermissionsBits } from "~/utils/bits";

const logger = useLogger("@wolfstar/api");

function isAdmin(member: APIGuildMember, roles: readonly string[]): boolean {
  const permissionsValue = (member as unknown as { permissions?: string }).permissions;
  const memberRolePermissions = BigInt(permissionsValue ?? "0");
  return roles.length === 0
    ? PermissionsBits.has(memberRolePermissions, PermissionFlagsBits.ManageGuild)
    : hasAtLeastOneKeyInMap(new Map(roles.map(role => [role, true])), member.roles);
}

async function canManage(guild: APIGuild, member: APIGuildMember): Promise<boolean> {
  if (guild.owner_id === member.user.id)
    return true;

  const settings = await readSettings(guild.id);
  return isAdmin(member, settings.rolesAdmin);
}

async function getManageable(id: string, oauthGuild: RESTAPIPartialCurrentUserGuild, guild: APIGuild | undefined): Promise<boolean> {
  if (oauthGuild.owner)
    return true;
  if (typeof guild === "undefined")
    return PermissionsBits.has(BigInt(oauthGuild.permissions), PermissionFlagsBits.ManageGuild);

  const member = await useApi().guilds.getMember(guild.id, id);
  if (!member)
    return false;

  return canManage(guild, member);
}

export async function transformGuild(userId: string, data: RESTAPIPartialCurrentUserGuild): Promise<OauthFlattenedGuild> {
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
    approximateMemberCount: null,
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

  const serialized: PartialOauthFlattenedGuild = guild === undefined
    ? mockGuild
    : flattenGuild({ ...guild, channels: (await useApi().guilds.getChannels(guild.id)) as any });

  return {
    ...serialized,
    permissions: Number(data.permissions),
    manageable: await getManageable(userId, data, guild),
    wolfstarIsIn: typeof guild !== "undefined",
  };
}

export async function transformOauthGuildsAndUser({ user, guilds }: LoginData): Promise<TransformedLoginData> {
  if (!user || !guilds)
    return { user, guilds };

  const userId = user.id;

  const transformedGuilds = await Promise.all(guilds.map(guild => transformGuild(userId, guild)));
  return { user, transformedGuilds };
}

export const getGuild = defineCachedFunction(async (_event: H3Event, guildId: string) => {
  const api = useApi();
  const guild = await api.guilds.get(guildId, { with_counts: true }).catch((error) => {
    logger.error("Failed to fetch guilds:", error);
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
}, {
  getKey: (_event, guildId) => `${guildId}:${Date.now()}`,
  swr: false,
  maxAge: seconds(5),
});

export const getMember = defineCachedFunction(async (_event: H3Event, guild: APIGuild, user: APIUser) => {
  const api = useApi();
  const member = await api.guilds.getMember(guild.id, user.id).catch((error) => {
    logger.error("Failed to fetch member:", error);
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
}, {
  getKey: (_event, guild, user) => `${guild.id}-${user.id}:${Date.now()}`,
  swr: false,
  maxAge: seconds(5),
});
