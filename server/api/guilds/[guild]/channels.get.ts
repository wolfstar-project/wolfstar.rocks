import { isNullOrUndefined } from '@sapphire/utilities/isNullish'
import { createError } from 'h3'
import useApi from '~~/server/utils/api'
import authMiddleware from '~~/server/utils/middlewares/auth'
import { createRest } from '~~/server/utils/rest'
import { manageAbility } from '~~/shared/utils/abilities'

defineRouteMeta({
  openAPI: {
    tags: ['Discord Api'],
    description: 'Get guild channel data',
    parameters: [
      {
        in: 'path',
        name: 'guild',
        required: true,
        description: 'The guild ID to fetch data for',
      },
    ],
  },
})

export default defineEventHandler({
  onRequest: [
    authMiddleware(),
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
    const api = useApi(createRest())
    const guild = await api.guilds.get(guildId, { with_counts: true })
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
    const member = await api.guilds.getMember(guild.id, user.id)
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

    const channels = await api.guilds.getChannels(guild.id)

    // Return flattened guild data

    return channels.map(channel => flattenGuildChannel(channel as any))
  },
})
