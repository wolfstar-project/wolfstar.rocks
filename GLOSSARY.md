---
scope: every user-visible string, public route segment, doc heading, and product noun in WolfStar.rocks
owns: what a concept is called. COPY.md owns how a sentence says it. VISION.md owns what may be built. .claude/DESIGN.md owns the visual system
last-reviewed: 2026-10-10
---

# Glossary

Canonical vocabulary for WolfStar.rocks. Every user-visible string, doc heading, and route segment uses these
terms and no synonyms.

This file owns what a concept is called. [`COPY.md`](COPY.md) owns how a sentence says it, including the
register per context and the banned language. Identifiers in code keep their existing names. See "Frozen
identifiers" at the end.

## Map

| Term                | Owner                              | Relation                       | Customer word         |
| ------------------- | ---------------------------------- | ------------------------------ | --------------------- |
| WolfStar            | `wolfstar-project/wolfstar`        | WolfStar 1—N server            | "WolfStar"            |
| Staryl              | WolfStar Project                   | Staryl 1—N server              | "Staryl"              |
| WolfStar.rocks      | this repository                    | one                            | "WolfStar.rocks"      |
| server              | Discord                            | server 1—N channel, 1—N case   | "server"              |
| dashboard           | `app/pages/(app)`                  | account 1—N manageable server  | "dashboard"           |
| settings            | the bot's per-server configuration | server 1—1 settings            | "settings"            |
| filter              | `guild_settings.filter`            | server 1—N filter              | "filter"              |
| case                | the bot's moderation record        | server 1—N case                | "case"                |
| appeal              | the bot's `Appeal`                 | case 1—1 appeal (unique index) | "appeal"              |
| honeypot            | the bot's `GuildHoneypot`          | server 1—1 honeypot channel    | "Honeypot"            |
| Auto-Delete         | the bot's `GuildAutoDelete`        | channel 1—1 (unique index)     | "Auto-Delete"         |
| Auto-Purge          | the bot's `GuildAutoPurge`         | channel 1—1 (unique index)     | "Auto-Purge"          |
| Auto-Message        | the bot's `GuildAutoMessage`       | channel 1—1 (unique index)     | "Auto-Message"        |
| moderation history  | `/guilds/[id]/logs`                | server 1—N case                | "Moderation history"  |
| command history     | `CommandLog`                       | server 1—N command run         | "Command history"     |
| settings activity   | `AuditEvent`                       | server 1—N audit event         | "Settings activity"   |
| logging channel     | server settings                    | log event N—1 channel          | "logging channel"     |
| subscription        | Staryl                             | server 1—N subscription        | "subscription"        |
| invite              | Discord OAuth                      | bot 1—N server                 | "Invite"              |
| sign in             | `better-auth`, Discord OAuth       | account 1—1 Discord user       | "Sign in"             |
| dashboard access    | `permissions.users`/`.roles` rules | server 1—N rule                | "Dashboard access"    |
| command permissions | Discord, per bot command           | command 1—N row (max 100)      | "Discord permissions" |
| command rules       | the bot's `/commands`              | command 1—1 rule               | "Command rules"       |

Collisions

- "Audit log" is Discord's own record. Ours is "settings activity" in the product and "audit trail" in
  engineering writing. Never mix them.
- "Moderation history" is the dashboard view of cases. A "moderation log channel" is a Discord channel that
  receives live messages. One is a place to search, the other a place to watch.
- "Alert" is a filter's soft action. See the open questions for how it meets Staryl's notifications.
- An Auto-Purge's "messages to purge" picks which messages a channel clears. It is not a filter: a filter
  is an Auto Moderation rule with soft and hard actions.
- An appeal is about a case and is not one. Accepting it makes a new case (an unban, an unmute, a timeout
  end) that undoes the first.
- "Language" names the dashboard's own language. A bot's server language is a separate setting. Always say
  which one.

## Terms

### WolfStar

**Is:** the Discord moderation bot from the WolfStar Project. Its direction is moderation only.

**Casing:** `WolfStar`, one word, capital W and S.

**Never:** Wolfstar, wolfStar, Wolf Star, WOLFSTAR, "the bot" as a replacement for the name in headings.

### Staryl

**Is:** the Discord app from the WolfStar Project that posts social updates into a server. Twitch live and
offline notifications are supported today, and its public invite is live.

**Casing:** `Staryl`.

**Never:** staryl, STARYL, Stary, "the notification bot" as a name.

### WolfStar.rocks

**Is:** this website: the marketing pages and the dashboard for both bots. Also the domain.

**Never:** WolfStar Dashboard (as a product name), "the panel", the website.

### server

**Is:** a Discord server. The unit WolfStar configures and the dashboard manages.

**Use for:** all user-facing text: titles, buttons, toasts, empty states.

**Never:** guild, discord server, community. `guild` stays in identifiers, routes, and API paths.

### dashboard

**Is:** the signed-in area where an admin manages a server, at `/guilds/*`.

**Marketing phrase:** "the control room", as in "The control room is part of the product." It names the same
place. UI labels and routes keep "dashboard".

**Never:** panel, admin panel, control panel.

### settings

**Is:** the values an admin changes for a server: channels, roles, events, command access, filters.

**Use for:** page titles ("Event Settings"), buttons ("Save settings"), and toasts ("Settings saved").

**Never:** configuration, config, options. A bot command may still say "configuration key"; that is the bot's
word and the dashboard does not rename it.

### filter

**Is:** one rule that checks messages for one kind of infraction: capital letters, invites, links, new lines,
repeated messages, words, mentions, reactions, attachments. A filter has soft actions and a hard action.

**Marketing phrase:** "AutoMod", as in "Configurable message filters and escalation rules". It names the
whole set of filters. UI panels keep "filter".

**Dashboard section:** "Auto Moderation" holds the filters. The section that routes log events to their
logging channels is "Events", and the history of cases, commands and settings activity is "Logs".

**Never:** automod rule, spam rule, content rule.

### soft action

**Is:** what a filter does on every infraction: alert the member, delete the message, post to the moderation
log channel.

**Never:** warning (that is a moderation action), reaction.

### hard action

**Is:** the punishment a filter applies when a member passes its threshold: warning, mute, kick, softban, or
ban, with a duration where it applies.

**Never:** escalation (the rule is the threshold; the action is the hard action), penalty, sanction.

### threshold

**Is:** how many infractions within a time window trigger a filter's hard action.

**Use for:** "Violations before punishment" and "Time window (seconds)" in the dashboard; "escalation rule" in
marketing prose.

### case

**Is:** one recorded moderation action in a server, with an id, a type, a member, a moderator, a reason, and
a date. Shown as "Case {id}".

**Never:** ticket, incident, infraction (an infraction is the message that broke a filter, not the record).

### appeal

**Is:** a member's request to undo one of their cases, a ban, a mute or a timeout, with their answers to the
form questions the server sets. A moderator accepts it in Discord, and WolfStar undoes the case, or denies it.
One appeal per case.

**Use for:** the "Appeals" section and module, "appeal form", "form questions", "Appeals channel".

**Never:** ticket (collides with case), dispute, unban request, ban appeal (a mute or a timeout can be
appealed too).

**Casing:** `Appeals` as the section and module name, `appeal` in prose.

### honeypot

**Is:** a channel no member has a reason to write in. WolfStar kicks, softbans or bans whoever writes there,
the moderators aside, and deletes what they sent. `/honeypot setup` in Discord creates it and posts its
warning.

**Use for:** the "Honeypot" section and module, "the honeypot channel". "Trap" may explain it in a
sentence; it is not its name.

**Caught:** a member WolfStar acted on after they wrote in the honeypot channel.

**Never:** trap channel, bait channel, spam trap.

**Casing:** `Honeypot` as the section and module name, `honeypot` in prose.

### Auto-Delete

**Is:** the messages of a channel deleted as they are sent, or a delay after, but the ones it keeps (links,
invites, images, mentions, embeds, only text) and the pinned ones. Set with `/autodelete`, one per channel.

**Use for:** the "Auto-Delete" section and module.

**Never:** auto-clean, slow delete, purge (that is Auto-Purge).

**Casing:** `Auto-Delete` in the UI, `autodelete` in identifiers and the section slug.

### Auto-Purge

**Is:** a channel cleared of its messages every interval, of every message or of the ones that match.
Set with `/autopurge`, one per channel.

**Use for:** the "Auto-Purge" section and module, "purge every", "messages to purge".

**Never:** cleanup, wipe, scheduled delete (that reads as Auto-Delete).

**Casing:** `Auto-Purge` in the UI, `autopurge` in identifiers and the section slug.

### Auto-Message

**Is:** a message WolfStar sends in a channel again every interval, skipping a round while the last message of
the channel is still its own. Set with `/automessage`, one per channel.

**Use for:** the "Auto-Message" section and module.

**Never:** announcement (a Discord channel type), reminder, broadcast, scheduled message.

**Casing:** `Auto-Message` in the UI, `automessage` in identifiers and the section slug.

### moderation action

**Is:** the type of a case: warning, timeout, mute, kick, softban, ban, voice mute, voice kick.

**Never:** punishment (in headings), strike.

### moderation history

**Is:** the dashboard view that lists a server's cases, filtered by member, moderator, action, date, or
search text.

**Never:** modlogs, mod log, case list.

### command history

**Is:** the dashboard view that lists command runs with their name, outcome, member, and date.

**Never:** command log (in UI), usage log.

### settings activity

**Is:** the dashboard view of who changed dashboard-managed settings and what changed. The engineering
name for the record behind it is the audit trail.

**Use for:** the dashboard view label and its page copy.

**Never:** audit log (collides with Discord's), changelog, activity feed, "security log".

### audit trail

**Is:** the tamper-evident, SHA-256 hash-chained record of security-relevant actions, persisted as audit
events and verified offline. Engineering and README term.

**Use for:** `AGENTS.md`, code comments, self-hosting docs.

**Never:** in dashboard UI, where it is "settings activity". Never "secure log", "immutable", or "unhackable".
"Tamper-evident" is the claim, because replaying the chain proves it.

### logging channel

**Is:** a server channel selected to receive one kind of log event, such as message edits or role changes.
An excluded channel is ignored for logged events.

**Never:** log room, audit channel.

### subscription

**Is:** one Staryl rule: one streamer, one channel, one alert type. Managed with Staryl's `add`, `remove`,
`reset`, `show`, and `test` commands.

**Never:** follow, feed, tracker, watch.

### source

**Is:** a platform Staryl reads updates from. Twitch is the only source today.

**Never:** integration, provider, connector.

### notification

**Is:** the message Staryl posts in a channel when a source changes: live or offline.

**Never:** ping, push, webhook (as a product word).

### invite

**Is:** the action and the link that adds WolfStar or Staryl to a server. "Invite WolfStar".

**Never:** add to server, install, authorize.

### sign in

**Is:** authenticating with Discord to reach the dashboard. The inverse is "sign out".

**Never:** log in, login, connect. `/login` stays a route alias.

### command

**Is:** a slash command. WolfStar and Staryl support slash commands only.

**Never:** prefix command, message command, bang command.

### dashboard access

**Is:** a rule that lets a role or member open a server's dashboard without Manage Server, or keeps them out
of it. The owner is never kept out. Stored next to the legacy permission nodes, told apart by `dashboard`.

**Never:** permission node, dashboard permission.

### legacy permission node

**Is:** an entry of the old `/permission-nodes` shape (commands allowed and denied). In V7 it only decides who
opens the dashboard, until it is imported as a dashboard access rule or removed by the owner.

**Never:** node, permission.

### command permissions

**Is:** Discord's own permissions for one of the bot's commands in a server, the ones of Server Settings →
Integrations, per role, member and channel. Discord applies them; the bot does not.

**Never:** integration permissions, overrides, overwrites (in copy; `overwrite` stays in code, as Discord's
API word for one row).

### app default

**Is:** the command permissions every command without permissions of its own uses. Discord shows such a
command as synced; one with its own is "Custom" here.

**Never:** global permissions, synced permissions.

### command rules

**Is:** where and by whom a command, or a group of commands, may run: allowed and ignored channels, roles and
members. An allowed role or member is an exception to an ignored one below it, not "only these": that is the
status "only the allowed roles and users". Members at WolfStar's administrator level are not held to them. Set
with the bot's `/commands`, or from a command's tile in the dashboard, which edits the channels, the roles and
that status of the command and keeps the members `/commands` set. Rules of a group are only edited in `/commands`.

**Never:** restrictions (in copy), bot permissions.

### support server

**Is:** the WolfStar Project's Discord server for questions, linked as "Ask in support".

**Never:** community server, help desk, ticket.

### changelog entry

**Is:** a dated record of one product change under `content/changelog`.

**Collides with:** blog post. A changelog entry states what changed. A blog post (`content/blog`) explains why,
or announces a direction.

**Never:** release note (as a content type), news.

### language

**Is:** the language the dashboard renders in, chosen under Profile. Translations are managed per locale.

**Collides with:** the bot's server language setting. Say "dashboard language" or "server language" when both
could be meant.

**Never:** locale (in UI). `locale` stays in code and i18n keys.

## Frozen identifiers

Routes, TypeScript types, composable names, Prisma models, API paths, and i18n keys keep their existing
names. A rename costs links, bookmarks, and translations.

| Identifier                              | Why it stays                                          |
| --------------------------------------- | ----------------------------------------------------- |
| `/guilds/*`, `server/api/guilds/**`     | Routes and API paths. User-facing word is "server"    |
| `/oauth/login`, `/oauth/callback`       | Registered with the Discord application               |
| `/login`, `/account`                    | `definePageMeta` aliases                              |
| `guild_card`, `guild_settings` i18n key | Locale files and Tolgee keys. The value says "server" |
| `CommandLog`, `AuditEvent`              | Prisma models shared with the bot or hash-chained     |

## Open questions

Terms this file does not settle. Resolve one, fold the answer into the section above, then delete it.

1. **Infraction, violation, punishment.** Marketing says "infraction", the dashboard labels say "Violations
   before punishment", and the filter panels label the result "Hard Action". Pick one noun for "a message
   that broke a filter" and one for "what happens to the member".
2. **Alert versus notification.** The filter's soft action is an "alert". The Staryl hero says "live and
   offline alerts". Reserve "alert" for filters and move Staryl copy to "notification", or accept both and
   record why.
3. **AutoMod.** Discord ships its own feature called AutoMod. Decide whether "AutoMod" stays as the
   marketing name for WolfStar's filters or whether "filters" alone is clearer.
