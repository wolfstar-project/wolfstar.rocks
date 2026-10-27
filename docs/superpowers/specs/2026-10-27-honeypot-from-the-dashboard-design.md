# The honeypot from the dashboard, and the bot told of dashboard writes

Date: 2026-10-27
Status: proposed

## Purpose

The Honeypot section shows the trap but cannot change it: the channel, the action, the warning and whether it is on
are "set in Discord" with `/honeypot`. The owner wants it to work like the other modules: a switch in the banner, the
trap channel picked from the dashboard, the action and the warning edited there.

Those four are read-only today for a reason: when they change the bot does more than store them. It checks its
permissions in the channel, posts the warning there, takes it down from the channel it left (the message's place is
in Redis, `wolfstar:honeypot:notices`) and does all of it under the honeypot lock.

While reading the bot for this, a wider gap came up: **the bot never learns that the dashboard wrote settings.** Each
process caches a guild's settings (`projects/bot/src/lib/database/settings/functions.ts`) and drops them only after
its own write (`settingsUpdate` shard message), on `GUILD_DELETE`, or on restart. The website writes Postgres and
tells nobody, so every dashboard save (auto-moderation, logs, moderation, roles…) is ignored by a running bot until
it restarts.

## Decisions (owner, 2026-10-27)

- The bot watches the settings: the website saves the honeypot like any other module, and the bot, told of each save,
  puts the warning in order. (Not a request queue like Join Guard's.)
- Everything is editable from the dashboard: the switch, the trap channel, the action and the warning.

## The bot is told of every dashboard write

- The website runs `pg_notify('guild_settings_update', '<json>')` inside the transaction of every write of guild
  settings (`settings.patch`, the access-legacy removal, the auto-moderation rule routes, and every later write), with
  `{ "guildId": "…", "keys": ["honeypotChannel", …] }`, the flat keys that changed. Postgres delivers it only on
  commit. The payload stays far under the 8000-byte limit (keys only, never values).
- The bot holds one `LISTEN guild_settings_update` connection (shared with Join Guard's `join_guard_request`, wolfstar#298)
  in the sharder process, and broadcasts `settingsUpdate { guildId, keys }` to every cluster. Each cluster
  invalidates its cache as it does today, then emits `Events.DashboardSettingsUpdate(guildId, keys)` when the guild
  is its own.
- A dropped connection reconnects with backoff; after a reconnect the bot invalidates every cached guild, since
  notifications sent while it was away are lost.

## The honeypot follows its settings

A listener of `DashboardSettingsUpdate` runs when `keys` holds `honeypotChannel`, `honeypotAction` or
`honeypotWarning`. Under `withHoneypotLock`, from fresh settings:

- `honeypotChannel` is `null`: `removeHoneypotNotice(guildId)`;
- otherwise: `refreshHoneypotNotice(guildId, honeypotChannel, { warning, action })`, which also takes the warning off
  the channel the trap left.

When that fails (the bot lost a permission since the website checked), the bot writes nothing back: it logs the
failure to the honeypot's log channel when it has one, as `/honeypot setup` reports `setupNoticeFailed`.

## The website

- **Switch.** `honeypotChannel` is the on state, as in the bot (`/honeypot disable` clears it, the rest is kept). The
  banner (`GuildModuleBanner`) gets a switch; off stages `honeypotChannel: null`; on opens the form with the channel
  picker empty and required: the save is refused with "Pick the honeypot channel." until one is chosen. The off state
  keeps the `/honeypot setup` hint for a server that wants the bot to create a fresh channel.
- **Fields.** The channel (`SelectChannel`, text channels, not the catches channel), the action (the choice cards,
  enabled) and the warning (the toggle row, enabled) are staged like the other settings and saved with the save bar.
  The help texts lose "Set in Discord".
- **Permissions, before saving.** The `settings.patch` route refuses a honeypot change the bot could not carry out, as
  the commands do: in the trap channel the bot needs View Channel, Send Messages, Read Message History and Manage
  Messages, plus Kick Members (Kick) or Ban Members (Softban, Ban); in the catches channel View Channel, Send Messages
  and Embed Links. Computed from the guild's roles, the bot member and the channel's overwrites (the code of
  `server/utils/command-permissions/requirements.ts`), refused with 422 `honeypot-permissions` and the list of what is
  missing, shown under the field. The trap and the catches channel cannot be the same.
- **Audit.** Unchanged: the settings write is audited as today.

## Order and compatibility

The website's notify is harmless without a listener, so it can ship first: the dashboard fields only become editable
once the bot release that listens is deployed. Until then, the section stays as it is.

## Tests

- Website: the notify runs in the transaction with the changed keys (and not when nothing changed); the permission
  check per action and channel; the switch stages `null`; a save with the switch on and no channel is refused; the
  fields are enabled; axe for the section in `test/nuxt/a11y.spec.ts`.
- Bot: the listener invalidates and emits for the owning cluster; reconnect invalidates everything; the honeypot
  listener removes the warning on `null`, refreshes it on a channel, action or warning change, and ignores other keys.
