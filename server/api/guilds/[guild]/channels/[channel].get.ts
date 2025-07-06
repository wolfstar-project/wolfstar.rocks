import { isNullOrUndefined } from '@sapphire/utilities/isNullish'
import { createError } from 'h3'
import useApi from '~~/server/utils/api'
import authMiddleware from '~~/server/utils/middlewares/auth'
import { manageAbility } from '~~/shared/utils/abilities'

defineRouteMeta({
  openAPI: {
    tags: ['Discord Api'],
    description: 'Get guild data',
    parameters: [
      {
        in: 'path',
        name: 'guild',
        required: true,
        description: 'The guild ID to fetch data for',
      },
      {
        in: 'path',
        name: 'channel',
        required: true,
        description: 'The channel ID to fetch data for',
      },
    ],
  },
})

export default defineEventHandler({
  onRequest: [
    authMiddleware()
  ],
  handler: async (event) => {
    // Get guild ID from params
    const guildId = getRouterParam(event, 'guild')
    if (isNullOrUndefined(guildId)) {
      throw createError({
        statusCode: 400,
        message: 'Guild ID is required',
      })
    }

    // Fetch guild data
    const guild = await useApi().guilds.get(guildId, { with_counts: true })
    if (isNullOrUndefined(guild)) {
      throw createError({
        statusCode: 400,
        message: 'Guild not found',
      })
    }

    const user = await event.context.$authorization.resolveServerUser()
    // Check if user ID is provided
    if (isNullOrUndefined(user)) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required',
      })
    }

    // Fetch member data
    const member = await useApi().guilds.getMember(guild.id, user.id)
    if (isNullOrUndefined(member)) {
      throw createError({
        statusCode: 400,
        message: 'Member not found',
      })
    }

    if (await denies(event, manageAbility, guild, member)) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions',
      })
    }

    const channelId = getRouterParam(event, 'channel')
    if (isNullOrUndefined(channelId)) {
      throw createError({
        statusCode: 400,
        message: 'Member ID is required',
      })
    }

    const channels = await useApi().guilds.getChannels(guild.id)

    if (isNullOrUndefined(channels)) {
      throw createError({
        statusCode: 404,
        message: 'Guild member not found',
      })
    }

    const channel = channels.find(channel => channel.id === channelId)

    if (isNullOrUndefined(channel)) {
      throw createError({
        statusCode: 404,
        message: 'Channel not found',
      })
    }

    return flattenGuildChannel(channel as any)
  },
})
