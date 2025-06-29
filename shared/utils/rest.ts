import type { RESTOptions } from '@discordjs/rest'
import { REST } from '@discordjs/rest'
import { runtimeConfig } from '~~/server/utils/runtimeConfig'

export let rest: REST

export function setRest(options?: Partial<RESTOptions> & { token?: string }) {
  if (!runtimeConfig.discordToken) {
    throw new Error('\'NUXT_OAUTH_DISCORD_BOT_TOKEN\' env is not defined')
  }

  rest = new REST({ ...options, authPrefix: /^Bearer\s/.test(options?.token ?? '') ? 'Bearer' : 'Bot' }).setToken(
    options?.token ?? runtimeConfig.discordToken,
  )
}
