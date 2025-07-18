import { REST } from '@discordjs/rest'
import { isNullOrUndefined } from '@sapphire/utilities/isNullish'
import useApi from '~~/server/utils/api'
import authMiddleware from '~~/server/utils/middlewares/auth'


defineRouteMeta({
  openAPI: {
    tags: ['Discord Api'],
    description: 'Get the current user and their guilds',
  },
})

export default defineEventHandler({
  onRequest: [
    authMiddleware(),
  ],
  handler: async (event) => {
    // Get session token

    const tokens = await event.context.$authorization.resolveServerTokens()

    if (isNullOrUndefined(tokens) || !('access_token' in tokens) || isNullOrUndefined(tokens.access_token)) {
      throw createError({
        statusCode: 401,
        message: 'None tokens OR access token not found',
      })
    }

    // Initialize REST client
    const rest = new REST({
      authPrefix: 'Bearer',
    }).setToken(tokens.access_token)

    const api = useApi(rest)

    // Fetch user data
    const user = await api.users.getCurrent()
    if (isNullOrUndefined(user)) {
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch user',
      })
    }

    // Fetch guilds
    const guilds = await api.users.getGuilds()
    if (isNullOrUndefined(guilds)) {
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch guilds',
      })
    }

    // Return transformed or raw data based on query param
    return await transformOauthGuildsAndUser({
      user,
      guilds,
    })
  },
})
