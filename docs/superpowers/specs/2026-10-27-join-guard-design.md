# Join Guard on the dashboard, and the verification page

Date: 2026-10-27
Status: proposed
Depends on: the bot's pull request for wolfstar-project/wolfstar#298 (the contract below), and on
wolfstar.rocks#480 (the member picker and the on-demand OAuth scope it adds).
References: the four "Console" exports (Phone 390, Foldable 720, Tablet 820, fused Manage + Dashboard
1440), `view = joinguard`, kept at `/home/redstar/scratch/mobile-design/{phone2,foldable,tablet,desktop}`.
The bot's brief, with the data contract both sides share: `/home/redstar/scratch/joinguard/bot-prompt-298.md`.

## Purpose

Raids and spam bots arrive with look-alike accounts: just created, default avatar, a generated name, an
unverified app. The bot (#298) stops them as they join by rules of conditions and actions, and can hold a
stopped member at a checkpoint until they verify on wolfstar.rocks. The website gives the guard its
settings, its rules and its queue, and serves the verification page.

## Decisions (owner, 2026-10-27)

- The website asks the bot to act through the database: it inserts a `JoinGuardRequest` and runs
  `NOTIFY join_guard_request, '<id>'` in the same transaction. It never changes roles, cases or the
  checkpoint rows itself.
- The captcha is Cloudflare Turnstile.
- The website is built now against the contract of the bot's brief; it is merged after the bot's pull
  request and the submodule bump.

## The section

A dashboard section `joinguard` in the modules group of `DASHBOARD_NAV` (icon a shield with a check, label
"Join Guard"), a module with a switch of its own table: `joinGuardEnabled` joins `OWN_TABLE_MODULE_SWITCHES`
and the module registry, like the appeals. In order, as in the reference:

1. **Header**: title, description, and two badges from the queue: "N stopped this week", "N waiting".
2. **Banner** (`GuildModuleBanner`) with the switch and "N members stopped this week, N waiting at the
   checkpoint."
3. **Guard rules**: "N / 10" and "New rule". A grid of rule cards (two columns from `lg`, one below):
   name, switch, "When the account has" chips (`< N days`, Default avatar, Generated name,
   `Name has "x"`, Unverified app), "WolfStar" chips (Checkpoint, `@role`, DM, `Alert #channel`, Kick,
   Ban; danger tone for Kick/Ban, blurple for Checkpoint, warning otherwise), Edit and Delete.
   The editor is a dialog: name (1–32), enabled, the conditions as checkboxes (age with a days field
   1–9999, stored as seconds in `accountAgeMax`; name contains with a text field 1–32), the actions as
   checkboxes (checkpoint, give a role with a role picker, DM, alert with a channel picker, kick, ban),
   and the summary sentence under them. Rules of the reference: kick and ban exclude each other and turn
   off the checkpoint and the role; the errors, in this order: "Give the rule a name.", "Pick at least one
   thing the account must have.", "The account age is a number of days, at least 1.", "Pick at least one
   thing WolfStar does.", "Turn the checkpoint on before sending members to it." Like the auto-moderation
   rules, a rule is a row written at once (no staged-changes bar): `GET/POST /api/guilds/:guild/joinguard/rules`,
   `PATCH/DELETE …/rules/:rule`, at most 10, audited under `joinGuardRule.<name>`.
4. **Verification checkpoint**: the switch "Send stopped members to the checkpoint"; the link
   `wolfstar.rocks/verify/<guildId>` with "Copy link" and "Post the button" (inserts a `PostButton`
   request); pending role, verified role, verification channel, "Kick after N hours" (0 = never, else
   1–168, stored in seconds); the minimum trust as three cards (Low, Trusted, Very trusted) with the scale
   line under them; "Checks on the page": captcha, linked accounts, shared ban list; the note that a
   moderator can always verify by hand with `/verify` and that nothing reads IPs or cookies.
5. **Allow list**: members (`GuildMemberPicker`) and roles (`SelectRoles` chips).
6. **Log and notices**: the guard log channel; "Tell the member in a DM" and its text (textarea, 500
   characters with a counter, `{server}` placeholder; empty means the bot's default text).
7. **Checkpoint queue**: filters Waiting, Verified, Kicked, Banned, All with counts; a row per member:
   avatar, name, trust badge (Not trusted / Low / Trusted / Very trusted), "created N ago", status badge,
   time, "Stopped by <rule> · <signals>", and for Waiting rows Verify and Kick (Kick asks for a reason).
   `GET /api/guilds/:guild/joinguard/checkpoints?status=&cursor=` (this week's counts ride on it);
   Verify and Kick insert `Verify`/`Kick` requests and the row shows "Sending…" until the request is
   processed (`GET …/requests/:id`), then the bot's outcome or its `error`.

Settings 4–6 are `GuildData` keys (the bot's flat keys `joinGuard*`) staged with the save bar, built with
`useSettingsForm` where a key is a plain picker, switch, number or choice. Every route takes the
manager's `authorize`, validates with Valibot schemas in `shared/schemas/join-guard.ts`, and is audited.

## The verification page: `/verify/[guild]`

A public page (no dashboard layout), prerendered shell, client-rendered state.

1. Not signed in: the guild's name and icon, what the check is, and "Sign in with Discord". The sign-in
   asks for `connections` too when the guild's `joinGuardConnections` is on (the `grant` mechanism of
   #480, a new grant `verify-connections`), and comes back to the same URL.
2. Signed in: `GET /api/verify/:guild` returns the guild's display data, the member's checkpoint row
   (none, Waiting, or resolved), what the page asks (captcha, connections, minimum trust) and the trust
   the account has now, with what is missing for the minimum ("link a Steam, GitHub, Twitch, X or Reddit
   account to Discord", "use an avatar of your own"…).
3. With a Waiting row and the trust at or above the minimum: the Turnstile widget (when captcha is on)
   and "Verify". `POST /api/verify/:guild` checks the Turnstile token server-side (siteverify with the
   secret), computes the trust again, refuses below the minimum or on the shared ban list, inserts a
   `Pass` request with `trust` and `linkedAccounts`, and notifies. The page polls
   `GET /api/verify/:guild/status` until the request is processed: "You're in — head back to Discord" or
   the bot's error.
4. Resolved rows: "You're already verified", "You were removed from the server", and so on.

Trust (computed on the server from the member's own token and the database):
`0` Not trusted; `1` Low: older than the age condition of the rule that stopped them, and not on the
shared ban list; `2` Trusted: also at least one linked account (`GET /users/@me/connections`, counting
verified connections of Steam, GitHub, Twitch, X, Reddit, YouTube, Xbox, PlayStation…); `3` Very
trusted: also public badges and an avatar of its own. Discord's OAuth does not expose a phone number, so
the reference's "phone" is left out. The website stores nothing about the connections but the count it
hands to the bot.

Runtime config: `NUXT_PUBLIC_TURNSTILE_SITE_KEY` and `NUXT_TURNSTILE_SECRET_KEY` (a secret, never sent to
the client), on Netlify and on the alpha Worker.

## Responsive

Below `md` the section follows the phone design (list/page shell of the mobile redesign; one column of
rule cards; queue rows stacked: name and badges, then the stopped line, then the buttons full width). The
foldable (720) and tablet (820) designs use one column of rule cards with the sidebar collapsed; from `lg`
the desktop grid.

## Tests

- Pure: the rule draft's validation and the kick/ban exclusivity; the chips and the summary sentence;
  days ↔ seconds; the trust computation for each level and each missing piece; the request kinds' bodies.
- Server: the schemas (limits, at least one condition and one action, 10 rules); the verify page's
  refusal below the minimum, on the shared ban list, without a Waiting row, with a bad Turnstile token.
- Components: the rule card and editor, the checkpoint card, the queue with a request in flight; axe in
  `test/nuxt/a11y.spec.ts`; the verify page states.
