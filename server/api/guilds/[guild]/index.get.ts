import { isNullOrUndefined } from '@sapphire/utilities/isNullish'
import { createError } from 'h3'
import authMiddleware from '~~/server/utils/middlewares/auth'
import { manageAbility } from '~~/shared/utils/abilities'
import useApi from '~~/shared/utils/api'

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

    const channels = (await useApi().guilds.getChannels(guild.id)) as any

    // Return flattened guild data
    return flattenGuild({ ...guild, channels })
  },
})
