import type { APIGuild, APIUser } from "discord-api-types/v10";
import type { H3Event } from "h3";
import useApi from "~~/server/utils/api";

const logger = useLogger("@wolfstar/api");

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
  swr: false,
  maxAge: 2000,
});

export const getMember = defineCachedFunction(async (_event: H3Event, guild: APIGuild, user: APIUser) => {
  const api = useApi();
  const member = await api.guilds.getMember(guild.id, user.id).catch((error) => {
    logger.error("Failed to fetch member:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch member",
      data: {
        error: "member_fetch_failed",
        message: error.message || "Unknown error",
        details: error,
      },
    });
  });
  return member;
}, {
  swr: false,
  maxAge: 2000,
});
