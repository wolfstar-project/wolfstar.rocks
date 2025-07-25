import { sentryCloudflareNitroPlugin } from '@sentry/nuxt/module/plugins'
import { runtimeConfig } from '~~/server/utils/runtimeConfig'

export default defineNitroPlugin(process.env.NUXT_NITRO_PRESET !== 'node-server' ? () => {} : sentryCloudflareNitroPlugin((nitroApp) => {
  // You can access `nitroApp` here if needed
  return {
    dsn: runtimeConfig.public.sentry.dsn,
    tracesSampleRate: 1.0,
    debug: nitroApp.h3App.options.debug,
  }
}))
