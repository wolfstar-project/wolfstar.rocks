import type { GuildData } from '~~/server/database'
import { isNullOrUndefined } from '@sapphire/utilities'
import { z } from 'zod'
import { readSettings, serializeSettings } from '~~/server/database'
import authMiddleware from '~~/server/utils/middlewares/auth'
import { createRateLimit } from '~~/server/utils/middlewares/ratelimit'
import { manageAbility } from '~~/shared/utils/abilities'
import useApi from '~~/shared/utils/api'
import { seconds } from '~~/shared/utils/times'

const querySchema = z.object({
  shouldSerialize: z.boolean().optional(),
  userId: z.string().optional(),
})

defineRouteMeta({
  openAPI: {
    tags: ['Discord Api'],
    description: 'Get guild settings',
    parameters: [
      {
        in: 'path',
        name: 'guild',
        required: true,
        description: 'The guild ID to fetch settings for',
      },
    ],
  },
})

export default defineEventHandler({
  onRequest: [
    authMiddleware(),
    createRateLimit({
      max: 10,
      time: seconds(10),
      auth: true,
    }),
  ],
  handler: async (event) => {
    // Get guild ID from params
    const guildId = getRouterParam(event, 'guild')
    if (isNullOrUndefined(guildId)) {
      throw createError({
        statusCode: 400,
        message: 'No guild id provided',
      })
    }

    // Validate query parameters
    const query = await getValidatedQuery(event, querySchema.parse)
    const { shouldSerialize } = query

    // Initialize API client

    // Fetch guild data
    const guild = await useApi().guilds.get(guildId, { with_counts: true })
    if (!guild) {
      throw createError({
        statusCode: 400,
        message: 'Guild not found',
      })
    }

    const user = await event.context.$authorization.resolveServerUser()
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    // Fetch member data
    const member = await useApi().guilds.getMember(guild.id, user.id)
    if (!member) {
      throw createError({
        statusCode: 400,
        message: 'Member not found',
      })
    }

    // Check permissions
    if (await denies(event, manageAbility, guild, member)) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions',
      })
    }

    // Read and return settings
    const settings = await readSettings(guild.id)
    return shouldSerialize ? serializeSettings(settings) : (settings as unknown as GuildData)
  },
})
