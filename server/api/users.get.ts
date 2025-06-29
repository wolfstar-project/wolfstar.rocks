import { Result } from '@sapphire/result'
import { isNullOrUndefined } from '@sapphire/utilities/isNullish'
import authMiddleware from '~~/server/utils/middlewares/auth'
import { createRateLimit } from '~~/server/utils/middlewares/ratelimit'
import useApi from '~~/shared/utils/api'
import { setRest } from '~~/shared/utils/rest'
import { seconds } from '~~/shared/utils/times'

defineRouteMeta({
  openAPI: {
    tags: ['Discord Api'],
    description: 'Get the current user and their guilds',
  },
})

export default defineEventHandler({
  onRequest: [
    authMiddleware(),
    createRateLimit({
      max: 2,
      time: seconds(10),
      auth: true,
    }),
  ],
  handler: defineWrappedHandlingError(async (event) => {
    // Get session token

    const tokens = await event.context.$authorization.resolveServerTokens()

    if (isNullOrUndefined(tokens) || !('access_token' in tokens) || isNullOrUndefined(tokens.access_token)) {
      throw createError({
        statusCode: 401,
        message: 'None tokens OR access token not found',
      })
    }

    // Initialize REST client
    setRest({
      token: tokens.access_token,
    })

    // Fetch user data

    const user = (await Result.fromAsync(async () => useApi().users.getCurrent())).unwrapOrElse((error) => {
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch user',
        stack: error instanceof Error ? error.stack : undefined,
      })
    })

    // Fetch guilds
    const guilds = (await Result.fromAsync(async () => useApi().users.getGuilds())).unwrapOrElse((error) => {
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch guilds',
        stack: error instanceof Error ? error.stack : undefined,
      })
    })

    // Return transformed or raw data based on query param
    return await transformOauthGuildsAndUser({
      user,
      guilds,
    })
  }),
})
