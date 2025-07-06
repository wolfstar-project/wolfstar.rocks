import { isNullOrUndefined } from '@sapphire/utilities/isNullish'
import { createError } from 'h3'
import useApi from '~~/server/utils/api'
import authMiddleware from '~~/server/utils/middlewares/auth'
import { manageAbility } from '~~/shared/utils/abilities'


defineRouteMeta({
  openAPI: {
    tags: ['Discord Api'],
    description: 'Get guild role data',
    parameters: [
      {
        in: 'path',
        name: 'guild',
        required: true,
        description: 'The guild ID to fetch data for',
      },
      {
        in: 'path',
        name: 'role',
        required: true,
        description: 'The role ID to fetch data for',
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

    const roleId = getRouterParam(event, 'role')
    if (isNullOrUndefined(roleId)) {
      throw createError({
        statusCode: 400,
        message: 'Role ID is required',
      })
    }

    const role = await useApi().guilds.getRole(guild.id, roleId)

    if (isNullOrUndefined(role)) {
      throw createError({
        statusCode: 400,
        message: 'Guild Role not found',
      })
    }

    // Return flattened guild data
    return flattenRole(guild.id, role)
  },
})
