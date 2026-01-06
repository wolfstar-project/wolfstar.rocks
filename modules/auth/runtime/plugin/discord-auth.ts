/**
 * Auth plugin for Discord OAuth
 * Delegates to nuxt-auth-utils for session management
 */
export default defineNuxtPlugin({
  name: "discord-auth",
  enforce: "pre",
  setup: () => {
    // nuxt-auth-utils already manages the session automatically
    // This plugin is kept for compatibility and future extensions
  },
});
