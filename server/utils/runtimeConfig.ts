import type { NitroRuntimeConfig } from 'nitropack/types'
import { cast } from '@sapphire/utilities/cast'
import { config } from 'dotenv'

let runtimeConfigInstance: NitroRuntimeConfig

export function generateRuntimeConfig () {
  return {
  preset: process.env.NUXT_NITRO_PRESET,
	public: {
			clientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID,
			apiBase: process.env.NUXT_PUBLIC_API_BASE,
      environment: process.env.NODE_ENV,
  },
  sentry: {
      authToken: process.env.SENTRY_AUTH_TOKEN,
      project: process.env.SENTRY_PROJECT,
      org: process.env.SENTRY_ORG,
    },
	discordToken: process.env.NUXT_OAUTH_DISCORD_BOT_TOKEN,
  discordClientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID,
  discordClientSecret: process.env.NUXT_OAUTH_DISCORD_CLIENT_SECRET,
}
}

if (typeof useRuntimeConfig !== 'undefined') {
  runtimeConfigInstance = useRuntimeConfig();
} else {
  config()
  runtimeConfigInstance = cast<NitroRuntimeConfig>(generateRuntimeConfig());
}

export const runtimeConfig = runtimeConfigInstance
