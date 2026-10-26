# Dashboard access and Discord command permissions

Date: 2026-10-26
Status: proposed
Depends on: the bot's wolfstar-project/wolfstar#338 (retires `/permission-nodes`, moves per-command rules into `/commands`), which is open

## Purpose

The permission nodes (`permissions.users` and `permissions.roles` in the server settings) were written for
message commands: allow and deny lists of command names, categories (`Moderation.*`) and `*`, with the
roles ordered by position. In V7 they do one thing: decide who may open the dashboard, because both
`canManage` functions, `server/utils/discord/index.ts` here and `projects/bot/src/lib/api/utils.ts` in the
bot, run them on the `settings` command. They never stop a slash command, and the dashboard has no page
that shows or edits them: only the settings API accepts them.

This design splits them into two things that each do one job:

1. **Dashboard access.** Who may open and manage a server's dashboard besides the owner and the admins,
   stored in the same columns with a new entry shape.
2. **Command permissions.** The permissions Discord itself holds for the bot's commands, the ones in
   Server Settings → Integrations → WolfStar, edited from the dashboard with the user's own Discord
   authorization. Discord stays the source of truth and applies them in its clients.

Success means a server owner can give a trusted member the dashboard without handing out Manage Server,
can keep an admin out of it, and can decide from the dashboard which roles, members and channels see each
of the bot's commands, without a slash command and without the settings of another server being touched.

## Decisions already taken

These were settled with the owner on 2026-10-26 and are not open:

- **One switch, not per section.** A dashboard access rule grants or denies the whole dashboard. Every
  API route has one gate, `canManage()`, and so does the bot; per-section rules would need a route-to-section
  map in both repositories. The entry shape leaves room for a `sections` field so that can come later
  without a migration.
- **Two separate layers, the bot's read-only.** The rules the bot's `/commands` modal keeps in
  `commandsRestrictions` (allowed roles and users, ignored channels, roles and users) stay the bot's. The
  dashboard shows them and does not edit them, and does not offer to "publish" them to Discord: the bot's
  rules bind the bot's administrators too, Discord's do not, so a translation would change their meaning.
- **Same columns, new entry shape.** Dashboard access rules live in `permissions.users` and
  `permissions.roles`, next to the legacy nodes, told apart by their shape. No contract change, no
  migration; the bot has to learn the new shape (see "What the bot needs").
- **Order of delivery.** This document, then the site's pull request, which carries both parts and the
  tests, and which the bot's update turns fully on.

## Vocabulary

To add to `GLOSSARY.md` in the pull request:

| Term                   | Is                                                                                                             | Never                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| dashboard access       | the rule that lets a role or member open a server's dashboard, or keeps them out                               | permission node, dashboard permission                    |
| command permissions    | Discord's own permissions for the bot's commands, per role, member and channel                                 | integration permissions, overrides, overwrites (in copy) |
| app default            | the command permissions Discord applies to every command without permissions of its own                        | global permissions, synced permissions                   |
| command rules          | the per-command rules the bot's `/commands` keeps (allowed roles and users, ignored channels, roles and users) | restrictions (in copy), bot permissions                  |
| legacy permission node | an entry in the old allow/deny shape, kept until it is imported or removed                                     | node, permission                                         |

In code, `overwrite` is the Discord API's word for one `{ id, type, permission }` row and stays in
identifiers.

## Part 1: dashboard access

### Who gets in today

`manage()` in `server/utils/discord/index.ts`:

1. the owner, always;
2. otherwise a member who is an admin (`isAdmin`: a role in `rolesAdmin` when that list is set, else
   Administrator or Manage Server in their permissions) **and** whom the legacy nodes do not deny on the
   `settings` command (`nodes.run(member, …) ?? true`).

Two defects found while reading, fixed by this design:

- The site runs the nodes on `"conf"`, the command's old name. The bot maps `conf` to `settings`
  (`RenamedCommands` in `projects/bot/src/lib/database/utils/matchers/Command.ts`); the site's matcher does
  not, and since the bot's API lists no command named `conf`, every node but `*` is ignored here. The site
  must run them on `"settings"` and take the same renamed-commands map.
- `canManage` is called inside `settings.patch.ts`'s body rather than its `authorize` option. That is fine
  for a non-cached handler and is not changed here, but the new routes use `authorize`.

### The entry shape

Both columns are JSON arrays. Today every entry is a legacy node:

```json
{ "id": "123", "allow": ["settings"], "deny": ["Moderation.*"] }
```

A dashboard access entry is:

```json
{ "id": "123", "allow": [], "deny": [], "dashboard": "allow" }
```

- `id`: a role snowflake in `permissions.roles`, a user snowflake in `permissions.users`.
- `dashboard`: `"allow"` or `"deny"`. Its presence marks the new shape.
- `allow` and `deny` are present and empty. The bot that runs today iterates `node.allow` and `node.deny`
  with `for … of` (`matchAny` in `projects/bot/src/lib/database/utils/matchers/Command.ts`), so an entry
  without them would throw inside the bot's `canManage` for every non-owner of the server; with two empty
  lists the old bot reads the entry as a node that matches nothing and falls through to its admin check.
  That is the compatibility the site needs to write the new shape before the bot's update ships
  (builder's check, settled here).
- An entry is one or the other: `dashboard` with empty lists, or the legacy lists without `dashboard`. One
  entry per `id` across both shapes.
- Reserved for later, not written now: `sections: string[]`, the dashboard sections the rule covers. Absent
  means the whole dashboard.

A key instead of a version number, because a legacy entry never carries `dashboard`, so there is nothing to
misread, and because a number would need a table of what each number means. (Owner's call was "a new shape
recognised by a field"; this is that field.)

The site's `PermissionsNode` type becomes a union, `validatePermissionNodes` accepts both shapes and
refuses an entry that carries `dashboard` with a non-empty list, and `MAXIMUM_SETTING_LIST_LENGTH` (250)
still bounds each column.

### How a request is decided

`manage(guild, member, settings)`, mirrored by the bot's `canManage`:

1. The owner: allowed. Nothing below can change that, so the owner can never lock themselves out.
2. The first dashboard entry that names the member decides, in this order:
    - the member's own entry in `permissions.users`;
    - the entries in `permissions.roles` for roles the member has, the highest role first (the same order
      `PermissionNodeManager` already computes from the guild's role positions).
      `"allow"` admits the member, with or without Manage Server; `"deny"` keeps them out, admin or not.
3. No dashboard entry: the rule of today. The member must be an admin, and the legacy nodes, run on
   `settings`, must not deny them. Legacy nodes keep applying until they are imported or removed, which is
   what the bot's #338 promises ("they stay stored and keep applying to the dashboard").

"No rule gives access to someone without the permissions `canManage` asks for today, except by an explicit
choice": the explicit choice is the `"allow"` entry itself. The editor says, next to the allow option, that
the role or member will open the dashboard without Manage Server, and the preview repeats it before the
save. There is no second switch to flip.

### Who may edit the rules

A member who is in by an `"allow"` entry alone must not be able to let others in. Writing
`permissionsUsers` or `permissionsRoles` is accepted only from the owner or from a member who passes step 3's
admin check on their own; `parseSettingsChanges` cannot see the member, so `settings.patch.ts` checks it
before the write and answers 403 with the reason.

A write that would deny the writer themselves (their own user entry, or a role entry for a role they hold
that would be the first match) is refused with 409 and a message that says so. The owner is exempt, since
rule 1 ignores entries.

### The legacy nodes

The dashboard access section lists the legacy entries of both columns and sorts them:

- **Importable**: an entry whose `allow` or `deny` contains `settings`, `conf`, `*`, `Management.*` or
  `Management.settings` — the names that already mean "the dashboard" to both `canManage`s. The section
  shows the dashboard entry it would become (`allow` if `allow` matches, else `deny`; `allow` wins if both,
  as in `runUser`/`runRole`) and the other command names the entry holds, which are dropped: in V7 a node
  does nothing but gate the dashboard, so nothing else is lost. Import is a click per entry, or one for all
  importable entries, and is a normal settings write that replaces the legacy entry with the dashboard one.
- **Not convertible**: every other entry. Shown with its lists, never converted, because a wildcard, a
  category or the role order has no allow/deny equivalent and guessing would change what the server set
  up. A "Download as JSON" button exports both columns' legacy entries as the bot does.
- **Removal**: the owner only, all legacy entries of the server at once, after typing `REMOVE` in the
  dialog, as in the bot. Dashboard entries are not touched by it.

### Where it lives

A new dashboard section, `access`, in the `tools` group of `app/utils/dashboard-nav.ts` after Commands,
labelled "Dashboard access", component `app/components/guild/settings/Access.vue`:

- A line that says who is in without a rule (the owner, members with Manage Server or Administrator, or
  the roles in `rolesAdmin` when set) with a link to the Roles section.
- Two lists, roles and members, each row a picker plus allow/deny, with the explanation next to allow. Role
  rows show the position order and say the highest matching role wins; a member row says it wins over
  roles.
- The legacy block described above, shown only when legacy entries exist.
- Changes are staged and saved through the existing settings bar, like every other `GuildData` key, keyed
  `permissionsRoles` and `permissionsUsers`. The section owns only those two keys of the staged draft.

Audit: the existing `guild.settings.update` event records the before and after of the two keys;
`guild.settings.access-denied` already covers refused writes. One new action, `guild.access.legacy-removed`,
records the owner's removal with the number of entries dropped.

## Part 2: Discord command permissions

### What Discord gives us

Verified against the Discord documentation (Application Commands → Permissions):

- `PUT /applications/{application.id}/guilds/{guild.id}/commands/{command.id}/permissions` takes only a
  Bearer token of a user who authorized `applications.commands.permissions.update`. The bot's token is
  refused.
- The user needs Manage Guild and Manage Roles, must be able to run the command they edit, and must be
  able to manage the roles, members and channels the overwrites name.
- The PUT replaces the command's whole set in that server. Up to 100 overwrites per command.
- An overwrite is `{ id, type, permission }`, `type` 1 role, 2 user, 3 channel. `@everyone` is the
  `guild_id`; "all channels" is `guild_id - 1` (`APIApplicationCommandPermissionsConstant.Everyone` and
  `.AllChannels` in `discord-api-types`). Threads inherit the parent channel's row.
- With `id` equal to the application id, the set is the **app default**, applied to every command without
  overwrites of its own. Discord's client shows such a command as synced, and one with its own set as not
  synced.
- The batch endpoint is disabled: one PUT per command, under the rate limit.
- A deleted or renamed command loses its permissions. Command ids differ between staging, beta and
  production and are read from Discord, never hard-coded.
- Administrator always runs every command.
- Each change raises `APPLICATION_COMMAND_PERMISSIONS_UPDATE` on the gateway.

`@discordjs/core` already wraps all of it: `getGlobalCommands`, `getGuildCommands`,
`getGuildCommandsPermissions`, `getGuildCommandPermissions` and
`editGuildCommandPermissions(userToken, …)`, the last one taking the user's token explicitly.

### Authorization

The site asks Discord for `guilds` and `guilds.members.read` at sign-in (`DISCORD_OAUTH_SCOPES` in
`server/utils/discord/provider.ts`) and keeps the account in a signed cookie, there being no database for
Better Auth (`account.storeAccountCookie` in `server/auth.config.ts`).

- The extra scope, `applications.commands.permissions.update`, is requested only when the user opens the
  command permissions tab and the server reports the token does not carry it. The tab then shows a
  "Authorize with Discord" button that starts a new Discord sign-in with the extended scope list and a
  `callbackURL` back to the tab (Better Auth's social sign-in and `/link-social` both take `scopes`; the
  builder picks the one that replaces the account cookie and keeps the session, and verifies it on a spike
  first). `prompt: "consent"` stays, so Discord shows the new scope.
- The server learns the token's scopes from Discord's `GET /oauth2/@me`, which lists them, cached per
  session for a few minutes. Better Auth's stored `scope` is not relied on, since the cookie account is
  not a database row.
- The token stays where `resolveServerTokens()` keeps it. It is never sent to the client and never logged;
  `editGuildCommandPermissions` receives it as an argument and nothing else does.
- A later ordinary sign-in replaces the cookie with a token without the scope; the tab notices through the
  scope check and asks again.

### API

New routes under `server/api/guilds/[guild]/command-permissions/`, all `defineWrappedResponseHandler`
with `canManage` in `authorize`, Valibot schemas in `shared/schemas/command-permissions.ts`, and their own
rate limits:

- `GET …/command-permissions` returns, in one call:
    - `applicationId`;
    - `commands`: the bot's chat input commands with their Discord ids: the union of the application's global
      commands and its guild commands for this server (bot token, cached an hour alongside `fetchCommands`),
      each matched by name to the entry of the bot's `/commands` API for its description and category;
    - `permissions`: Discord's current sets for the server (`getGuildCommandsPermissions`, bot token, not
      cached), one array per command id plus the app default under the application id;
    - `snapshot`: a hash of `permissions`, the value the client sends back on save;
    - `authorization`: `{ scopeGranted, manageGuild, manageRoles }` for the current member, so the tab can
      say what is missing before anything is tried.
- `PUT …/command-permissions/:commandId` with `{ snapshot, permissions }`:
    1. requires the scope (403 `scope-missing` with the authorize URL otherwise);
    2. checks the member: Manage Guild and Manage Roles, or Administrator, or the owner; every role in
       `permissions` below the member's highest role, unless owner; every channel in `permissions` visible
       to the member; 403 with the first failing check named;
    3. validates: at most 100 rows, types in 1–3, ids that are snowflakes of this server's roles, channels or
       the two constants, members by snowflake only, no duplicate `(id, type)`;
    4. re-reads the command's current set from Discord and compares it with the client's `snapshot` of that
       command, order-insensitively; a difference is 409 `conflict` with the current set, and nothing is
       written;
    5. `editGuildCommandPermissions(userToken, applicationId, guildId, commandId, { permissions })`.
       `commandId` may be the application id, which edits the app default. An empty `permissions` clears the
       command's own set, which is "use app default".
    6. Discord's 403 becomes 403 `discord-refused` with Discord's message; 429 is retried by
       `@discordjs/rest`'s own handling, which queues per route, and the route answers 503 `rate-limited`
       with `retryAfter` if the retry budget runs out.
    7. Audit `guild.command-permissions.update` with `{ commandId, before, after }`, and
       `guild.command-permissions.access-denied` for steps 1, 2 and the Discord 403.
- Saves are sequential: the client sends one PUT at a time and waits. On Workers nothing can queue across
  requests, and Discord's limit per route is low enough that sequence is the only safe order.

### UI

The Commands section becomes three tabs:

1. **Disabled commands**: the page as it is.
2. **Command rules**: the bot's `/commands` rules, read-only. One row per command with a rule: allowed roles
   and users, ignored channels, roles and users, and a line that says they are edited with `/commands` in
   Discord and bind the bot's administrators too. `commandsRestrictions` is the `disabledInChannels` column
   of `GuildCommands` (`server/database/settings/columns.ts`), which #338 does not rename, so no submodule
   bump is needed. Its entries, from #338's `commands-menu/restrictions.ts`:

    ```ts
    { command: string; allowedChannels: Snowflake[]; ignoredChannels: Snowflake[];
      allowedRoles: Snowflake[]; ignoredRoles: Snowflake[]; allowedUsers: Snowflake[]; ignoredUsers: Snowflake[] }
    ```

    `command` is the piece name (`warnThresholds`), a subcommand being ruled with its parent. The column may
    still hold the older `{ channel, commands }` entries, which mean "these commands ignore this channel".
    The site ports `readCommandRestrictions` into `shared/utils/command-rules.ts`: unknown fields and
    malformed entries are skipped, both shapes are read, and the result is matched to the bot's `/commands`
    API entries by their `command` field (`name` when an older bot sends no `command`). The same API entries
    carry the Discord-registered `name`, which is how tab 3 matches Discord's command list; the two tabs
    never match by guessing a case convention.

3. **Discord permissions**: the sync.
    - A line that says these are Discord's own permissions, the same as Server Settings → Integrations →
      WolfStar, that Discord hides a command from whoever may not use it, and that members with Administrator
      always see every command.
    - Without the scope: the explanation and the "Authorize with Discord" button; nothing else is editable.
    - Without Manage Server or Manage Roles: the lists are shown and the save is disabled, with the missing
      permission named.
    - First card, **App default**: the rows every command inherits.
    - One card per command, with a status chip: "Uses app default" (no rows of its own) or "Custom". Rows
      are grouped as roles, members and channels, each with allow/deny, an add picker (roles from
      `/roles`, channels from `/channels`, members from the members search), `@everyone` and "All
      channels" offered as the first choices of their groups, and the count against 100.
    - "Use app default" on a custom card removes its rows.
    - Nothing is sent as it is edited. "Review changes" opens the preview: per command, the rows added,
      removed and flipped, and the status it will have; "Send to Discord" saves one command after another
      with a progress line. A 409 stops the run, shows Discord's current rows next to the draft and offers
      to reload.

### Member search, shared by both parts

Both parts pick members, and the dashboard has no way to: `GET …/members` asks Discord for the member list
with no limit, which Discord answers with one member. Settled with the owner on 2026-10-26: a shared
search.

- `GET …/members/search?query=` under `server/api/guilds/[guild]/members/`, `defineWrappedResponseHandler`
  with `canManage` in `authorize`, calling Discord's `GET /guilds/{id}/members/search` with the bot token
  and a `limit` of 25, a Valibot schema for the query (1 to 100 characters), its own rate limit, and the
  result flattened by the existing `flattenMember`. Searching by snowflake is covered too: a query that is
  a snowflake is looked up with `GET /guilds/{id}/members/{id}` so an id pasted from developer mode still
  resolves.
- `useGuildMemberSearch(guildId)` in `app/composables/`, debounced, taking `MaybeRefOrGetter` inputs like
  the log composables.
- `GuildMemberPicker` in `app/components/guild/`, a combobox with the avatar, display name and username of
  each result, used by the dashboard access section and by the members group of the command permissions
  cards. Picked members whose row the search no longer returns (they left the server) are still shown by
  id with a "not in the server" note, never dropped silently.

### Pure logic, where the tests go

`shared/utils/command-permissions.ts`, no I/O:

- `everyoneId(guildId)` and `allChannelsId(guildId)` from `APIApplicationCommandPermissionsConstant`;
- `normalizeOverwrites(rows)`: dedupe by `(id, type)`, sort, for comparison;
- `overwritesEqual(a, b)`: the conflict check;
- `applyChange(current, change)`: add, remove or flip one row, keeping the rest, returning the full set
  to send;
- `assertOverwriteLimit(rows)`: the 100 cap;
- `diffOverwrites(before, after)`: what the preview shows;
- `isAppDefault(commandId, applicationId)` and `usesAppDefault(set)`.

`server/utils/command-permissions/requirements.ts`: `checkEditorRequirements(member, guild, rows)`
returning the first failing check, tested with fixtures for owner, admin, Manage Guild without Manage
Roles, a role above the member's, a channel they cannot see.

Part 1's `manage()` ordering and `validatePermissionNodes` get unit tests too: owner bypass, user entry over
role entry, highest role first, allow without Manage Server, deny on an admin, legacy fallback, mixed-shape
entry refused, the lock-out guard, the import classification.

## What the bot needs (not done here, to report)

1. `PermissionNodeManager` and `PermissionsNode` in `projects/database` take the union shape; a dashboard
   entry is never run as a command node.
2. `canManage` in `projects/bot/src/lib/api/utils.ts` applies the same order as "How a request is
   decided", so the bot's API agrees with the site.
3. #338's owner removal of the legacy nodes must keep dashboard entries. As written it would empty the
   columns.
4. The bot's permission node serializer (`serializers/permissionNode.ts`) requires exactly three keys, so
   once a server holds a dashboard rule its `permissionsRoles`/`permissionsUsers` fail validation in the
   bot's settings transfer import, its settings menu and its API PATCH. It must accept the `dashboard` key.
5. Until `/permission-nodes` is gone (#338), `add` on a role or member that has a dashboard rule rebuilds
   the entry without `dashboard`, so a deny silently disappears and a denied admin gets back in; `remove`
   errors on it and `reset` deletes it. #338 removes the command; until it ships, those three must refuse
   a dashboard rule.
6. Optional: a listener for `APPLICATION_COMMAND_PERMISSIONS_UPDATE` that writes an audit row, so changes
   made in Discord's own settings show up in the activity feed.

No contract change and no migration: the columns and their JSON type stay as they are.

## Non-goals

- Per-section dashboard access (the shape reserves `sections`).
- Editing the bot's `/commands` rules from the dashboard, or translating them to Discord.
- Converting legacy nodes without a click, or guessing an equivalent for a wildcard or a category.
- Caching Discord's permission sets, or editing more than one command per request.
- A bot-side cache invalidation: the bot reads settings from its own cache and drops it on its own writes,
  the same for every setting the dashboard changes.

## Risks and what the builder verifies first

- **The scope step with a cookie account.** Better Auth's `/link-social` and social sign-in accept
  `scopes`; whether the callback replaces the cookie account and keeps the session, database-less, is
  checked on a throwaway branch before the tab is built. If neither does, the fallback is a dedicated
  sign-in route with the extended scope list, which the callback already handles.
- **`GET /oauth2/@me` cost.** One call per session every few minutes; if it proves noisy, the tab can
  instead try the PUT and treat Discord's scope error as "not granted".
- **Command matching.** Discord's command list and the bot's `/commands` API are matched by name; a command
  the bot lists but Discord does not (unregistered) is shown as "not registered" and cannot be edited.
- **Bot parity.** Until the bot ships its update, an `"allow"` entry admits a member to the site's API but
  not to the bot's, and a `"deny"` entry is ignored by the bot's: the pinned bot reads a dashboard entry as
  a node with two empty lists (verified in its `PermissionNodeManager` and `matchAny`), which matches
  nothing and never throws. Both `canManage`s guard different APIs, so nothing breaks, but
  `docs/arch/auth.md` says it until the bot's pull request lands.
