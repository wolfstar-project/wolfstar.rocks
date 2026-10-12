# Architecture notes

Long-form notes moved out of `AGENTS.md` so each session loads the rules and
reads the detail on demand. `AGENTS.md` keeps a "Traps" list of the rules that
fail silently. These files carry the reasons.

| Note                                          | When to read                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| [Nuxt 5 compatibility](nuxt-5.md)             | Read before touching `nuxt.config.ts`, `modules/`, `config/`, or `test/e2e/`. |
| [Server API patterns](server-api.md)          | Read before adding or changing a route under `server/api/`.                   |
| [Vue component patterns](vue-components.md)   | Read before adding a component, composable, or page.                          |
| [Authentication and feedback](auth.md)        | Read before changing sign-in, sessions, tokens, or the feedback flow.         |
| [Settings and preferences](settings.md)       | Read before changing appearance, language, or motion preferences.             |
| [Localization (i18n)](i18n.md)                | Read before changing locale files, translation keys, or the i18n runtime.     |
| [Storage and caching](storage-and-caching.md) | Read before changing Nitro storage mounts or cache drivers.                   |
| [Audit logging](audit-logging.md)             | Read before adding an audit event or touching the hash chain.                 |
| [View Transitions](view-transitions.md)       | Read before changing router transitions or page-level motion.                 |
| [Design token discipline](design-tokens.md)   | Read before writing component styles or theme CSS.                            |

## Keeping these notes honest

- A note states why a rule exists, not only what it is. A rule without a reason
  cannot tell the next writer when it stops applying.
- When a trap can be matched by text, add it to
  `test/unit/guardrails/forbidden-patterns.test.ts` as well.
- Do not copy a rule into a second note. Link to the owner.
