# Settings and preferences

Read before changing appearance, language, or motion preferences.

- Browser-local appearance/locale/motion preferences are consolidated behind `useSettings()` (`app/composables/useSettings.ts`), backed by a single `wolfstar-settings` localStorage key (`AppSettings`: `colorMode`, `reduceMotion`, `selectedLocale`). Its `useLocalStorage` ref is created once in a detached `effectScope`, not in the first caller's own setup scope, so persistence survives that caller unmounting
- Prefer `useAppColorMode()`, `usePreferredLocale()`, and `useReduceMotion()` — thin wrappers around `useSettings()` — over reading/writing `wolfstar-settings` directly. `useAppColorMode()` also keeps `useColorMode().preference` in sync; `colorMode` supports `"system" | "light" | "dark" | "midnight"` (`midnight` is an experimental DaisyUI theme)
- Legacy keys (`wolfstar-theme`, `user-prefers-locale`, `user-prefers-reduced-motion`) migrate into `wolfstar-settings` once, only when `wolfstar-settings` has never been persisted — that check must run before the storage ref is created, since `useLocalStorage` writes defaults synchronously on first read
- `/profile` (aliased at `/account`) is not auth-gated: guests get a Settings tab (Appearance, Language, Accessibility) and a Discord sign-in CTA in place of the Servers tab, and guild data fetches skip `/api/users` when the user is anonymous
- Theme and language controls live on `/profile`, not the footer
