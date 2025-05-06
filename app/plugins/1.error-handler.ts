import * as Sentry from '@sentry/nuxt'

export default defineNuxtPlugin((nuxtApp) => {
  // Gestione degli errori lato client
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    const error = err as Error & { statusCode?: number, response?: { status: number } }
    const statusCode = error?.statusCode ?? error?.response?.status ?? 500

    Sentry.captureException(error, {
      extra: {
        componentName: instance?.$.type?.name,
        info,
        statusCode,
      },
    })

    useLogger().error('Error:', error)
  }
})
