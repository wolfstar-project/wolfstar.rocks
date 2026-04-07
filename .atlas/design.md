# WolfStar.rocks Design Context

## Product

WolfStar.rocks is a full-stack dashboard for two Discord bots:

- **WolfStar** -- Discord moderation bot (logging, auto-moderation, role management)
- **Staryl** -- Social notifications bot (Twitch, YouTube alerts)

Built with Nuxt 4, Vue 3, TypeScript, Prisma, PostgreSQL. Deployed on Netlify.

## Target Audience

**Primary**: Discord server administrators and moderators (technical users).

- Familiar with Discord's UI patterns and terminology
- Comfortable with dashboards and configuration panels
- Usually managing multiple servers; efficiency matters
- Range from hobbyist community owners to large server admins

## Primary Use Cases

1. Managing guild/server settings through the dashboard
2. Viewing and configuring moderation tools (auto-mod, logging)
3. Profile management (viewing servers, account settings)
4. Bot setup and onboarding (OAuth invite flow)

## Brand Personality and Tone

**Friendly and casual** -- warm, encouraging, approachable. Inspired by Discord's own voice.

### Voice Principles

- **Conversational**: Write like talking to a friend who runs Discord servers
- **Encouraging**: Help users feel confident, especially during setup or errors
- **Clear over clever**: Prioritize understanding; avoid puns in error/action contexts
- **Respectful of time**: Admins are busy -- be concise but complete

### Tone Adjustments by Context

| Context                   | Tone                                   |
| ------------------------- | -------------------------------------- |
| Marketing / landing pages | Enthusiastic, bold, aspirational       |
| Dashboard / settings      | Calm, clear, professional-friendly     |
| Errors / failures         | Empathetic, helpful, solution-oriented |
| Empty states              | Welcoming, action-oriented             |
| Success / confirmations   | Brief, warm, reassuring                |
| Loading states            | Informative, patient                   |

## Design References

- **Dyno.gg** -- Discord bot dashboard patterns, server management UX
- **Vercel** -- Clean layout, information density, typography hierarchy
- **Turborepo** -- Documentation structure, developer-friendly tone

## Design Tokens

- Uses `base-content`, `base-200`, `base-300` (Nuxt UI / Tailwind)
- Primary color for accents and CTAs
- `base-content/60` and `base-content/80` for muted/secondary text
- Error, info, success, warning semantic colors

## Terminology (Canonical Terms)

| Use                | Avoid                                  |
| ------------------ | -------------------------------------- |
| Server             | Guild (in UI; "guild" is fine in code) |
| Dashboard          | Panel, control center                  |
| Settings           | Preferences, configuration             |
| Sign in / Sign out | Log in / Log out (match Discord)       |
| WolfStar           | Wolfstar, wolfStar                     |
| Staryl             | staryl                                 |

## Copy Patterns (Existing)

- Error messages explain what happened + suggest a fix
- Empty states include a next action ("Start by inviting WolfStar...")
- Buttons use verb + noun ("Add App", "Clear Search", "Reload Page")
- Toast notifications use title + description pattern
- Section headers use concise labels ("Servers", "Settings")
