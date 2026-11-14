# Dashboard access and Discord command permissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the permission nodes' only V7 job with explicit dashboard access rules, and let the dashboard edit Discord's own command permissions for the bot with the user's OAuth token.

**Architecture:** Part 1 keeps the two `GuildPermissions` JSON columns and adds an entry shape marked by a `dashboard` key; a pure resolver decides access before the legacy node fallback in `manage()`. Part 2 is a read → change → full-write sync against Discord's command permissions endpoints, with the pure overwrite logic in `shared/`, the editor checks in `server/utils/command-permissions/`, a scope check through `GET /oauth2/@me`, and a three-tab Commands section.

**Tech Stack:** Nuxt 4 / Nitro, Vue 3 `<script setup>`, Nuxt UI, `@discordjs/core` (`API`) and `@discordjs/rest`, `discord-api-types/v10`, Better Auth 1.7 (cookie account), Valibot, evlog audit, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-26-dashboard-access-and-command-permissions-design.md`

## Global Constraints

- Work in `/home/redstar/codes/wolfstar.rocks.feat-dashboard-access-command-permissions` (branch `feat/dashboard-access-command-permissions`, base `refactor/v3`). Never edit `vendor/`.
- No contract change, no migration, no submodule bump.
- A dashboard entry is exactly `{ id, allow: [], deny: [], dashboard: "allow" | "deny" }`; the empty lists are required (the pinned bot runs `for … of node.allow`).
- Owner always passes `manage()`; no entry can change that.
- Every `server/api` handler uses `defineWrappedResponseHandler`, checks in `authorize` (`authorizeGuildManager` from `server/utils/guilds/manager.ts`), validates with Valibot schemas in `shared/schemas/`, and sets its own `rateLimit`.
- The user's Discord token is never returned to the client, never logged, never put in a cache key in clear.
- Command ids are read from Discord (`getGlobalCommands`, `getGuildCommands`), never hard-coded.
- At most 100 overwrites per command; `@everyone` is the guild id; "All channels" is `BigInt(guildId) - 1n`, via `APIApplicationCommandPermissionsConstant.Everyone` / `.AllChannels`.
- Components call `ts()`, never `t()`; English strings go in `i18n/locales/en/*.json`, other locales get empty placeholders with `pnpm i18n:check:fix`; labels are verb plus object; no exclamation marks; follow `COPY.md` and the spec's vocabulary table ("dashboard access", "command permissions", "app default", "command rules", "legacy permission node").
- No hardcoded colours; axe checks go in `test/nuxt/a11y.spec.ts`.
- Test runs: `NODE_OPTIONS=--max-old-space-size=3072 pnpm vp test run <path> --coverage.enabled=false`; nuxt project files add `--browser.connectTimeout=900000`. One heavy job at a time (4 GB machine).
- Commit after each task with a Conventional Commit whose scope is an allowed one (`dashboard`, `auth`, `api`, `ui`, `i18n`, `docs`); the pre-commit hook rebuilds `i18n/schemas`.

## Review Focus

1. **A rule names a role that was deleted or a member who left.** Access resolution skips ids the guild no longer has without throwing; the editor shows them as "not in the server" and lets them be removed. Test in Task 1 (`resolveDashboardAccess` ignores unknown role ids) and Task 5 (picker keeps unknown ids).
2. **Someone edits the same command in Discord's own settings while the tab is open.** The PUT answers 409 with Discord's current rows and writes nothing. Test in Task 8 (`overwritesEqual` order-insensitive) and Task 10 (route returns 409 on a changed snapshot).
3. **The user signs in again the ordinary way after granting the scope.** The tab shows "Authorize with Discord" again instead of failing on save. Test in Task 9 (`hasCommandPermissionsScope` false for a token whose `/oauth2/@me` scopes lack it).
4. **A run of saves hits Discord's rate limit or a 403 halfway.** Saved commands stay saved, the run stops at the failing one, and the preview marks which were sent. Test in Task 12 (`runSequentialSaves` stops at the first failure and reports the sent ids).
5. **A command is renamed or unregistered between staging and production.** It appears as "not registered" and cannot be edited; Discord's rows for an id the bot no longer lists are not shown as editable. Test in Task 10 (`matchRegisteredCommands` marks bot commands without a Discord id).

---

## File Structure

| File                                                                                                                                                      | Responsibility                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `shared/utils/dashboard-access.ts` (create)                                                                                                               | entry types, `isDashboardEntry`, `resolveDashboardAccess`, `classifyLegacyNode`, `stripLegacyNodes` |
| `server/database/settings/types.ts` (modify)                                                                                                              | `PermissionsNode` becomes the union                                                                 |
| `server/database/settings/validation.ts` (modify)                                                                                                         | both shapes accepted, mixed refused                                                                 |
| `server/database/settings/structures/PermissionNodeManager.ts` (modify)                                                                                   | dashboard entries never run as command nodes                                                        |
| `server/database/settings/utils/matchers/command.ts` (modify)                                                                                             | `RenamedCommands` (`conf` → `settings`)                                                             |
| `server/utils/discord/index.ts` (modify)                                                                                                                  | `manage()` order; export `hasAdminPermissions`                                                      |
| `server/utils/dashboard-access.ts` (create)                                                                                                               | `assertCanEditDashboardAccess` for the settings PATCH                                               |
| `server/api/guilds/[guild]/access/legacy.delete.ts` (create)                                                                                              | owner-only removal of legacy nodes                                                                  |
| `server/api/guilds/[guild]/members/search.get.ts` (create)                                                                                                | member search                                                                                       |
| `app/composables/useGuildMemberSearch.ts`, `app/components/guild/MemberPicker.vue` (create)                                                               | shared member picker                                                                                |
| `app/components/guild/settings/Access.vue` (create), `app/utils/dashboard-nav.ts`, `app/pages/app.vue` (modify)                                           | Dashboard access section                                                                            |
| `shared/utils/command-permissions.ts` (create)                                                                                                            | overwrite logic                                                                                     |
| `server/utils/command-permissions/requirements.ts` (create)                                                                                               | editor checks                                                                                       |
| `server/utils/discord/provider.ts`, `server/utils/discord/token-scopes.ts` (create), `app/pages/oauth/login.vue`                                          | incremental scope                                                                                   |
| `server/api/guilds/[guild]/command-permissions/index.get.ts`, `[command].put.ts` (create), `shared/schemas/command-permissions.ts` (create)               | sync API                                                                                            |
| `shared/utils/command-rules.ts` (create)                                                                                                                  | read-only port of the bot's `readCommandRestrictions`                                               |
| `app/components/guild/commands/*.vue`, `app/composables/useCommandPermissions.ts` (create), `app/components/guild/settings/DisabledCommands.vue` (modify) | Commands tabs                                                                                       |
| `shared/audit/actions.ts`, `shared/types/audit-log.ts` (modify)                                                                                           | new audit actions                                                                                   |
| `GLOSSARY.md`, `docs/arch/auth.md`, `docs/arch/vue-components.md` (modify)                                                                                | vocabulary and notes                                                                                |

---

### Task 1: Dashboard access resolver

**Files:**

- Create: `shared/utils/dashboard-access.ts`
- Test: `test/unit/shared/utils/dashboard-access.spec.ts`

**Interfaces:**

- Produces:

    ```ts
    export type DashboardAccess = "allow" | "deny";
    export interface LegacyPermissionNode {
    	id: string;
    	allow: readonly string[];
    	deny: readonly string[];
    }
    export interface DashboardAccessEntry {
    	id: string;
    	allow: readonly [];
    	deny: readonly [];
    	dashboard: DashboardAccess;
    }
    export type PermissionEntry = LegacyPermissionNode | DashboardAccessEntry;
    export function isDashboardEntry(entry: PermissionEntry): entry is DashboardAccessEntry;
    export function createDashboardEntry(
    	id: string,
    	dashboard: DashboardAccess,
    ): DashboardAccessEntry;
    export interface AccessSubject {
    	userId: string;
    	roleIds: readonly string[];
    }
    export interface GuildRolePosition {
    	id: string;
    	position: number;
    }
    export function resolveDashboardAccess(
    	subject: AccessSubject,
    	entries: { users: readonly PermissionEntry[]; roles: readonly PermissionEntry[] },
    	guildRoles: readonly GuildRolePosition[],
    ): DashboardAccess | null;
    export const DASHBOARD_COMMAND_NAMES: readonly string[]; // ["settings", "conf", "*", "Management.*", "Management.settings"]
    export type LegacyClassification =
    	| { kind: "importable"; access: DashboardAccess; dropped: string[] }
    	| { kind: "not-convertible" };
    export function classifyLegacyNode(node: LegacyPermissionNode): LegacyClassification;
    export function stripLegacyNodes(entries: readonly PermissionEntry[]): DashboardAccessEntry[];
    ```

- [ ] **Step 1: Write the failing tests**

    - `isDashboardEntry` true for `createDashboardEntry("1", "allow")`, false for `{ id: "1", allow: ["settings"], deny: [] }`.
    - `createDashboardEntry("1", "deny")` deep-equals `{ id: "1", allow: [], deny: [], dashboard: "deny" }`.
    - `resolveDashboardAccess`: user entry `deny` wins over a role entry `allow`; with roles `A` (position 5) `deny` and `B` (position 2) `allow` and the member holding both, returns `"deny"`; swapping positions returns `"allow"`; a role entry for an id absent from `guildRoles` is ignored (returns `null` when it is the only one); legacy nodes in either list are ignored; no entries returns `null`.
    - `classifyLegacyNode({ id, allow: ["settings", "ban"], deny: [] })` → `{ kind: "importable", access: "allow", dropped: ["ban"] }`; `deny: ["Management.*"]` alone → `access: "deny"`, `dropped: []`; both lists matching → `"allow"`; `allow: ["Moderation.*"]` → `{ kind: "not-convertible" }`; `conf` and `*` importable.
    - `stripLegacyNodes` keeps only dashboard entries, in order.

- [ ] **Step 2: Run** `NODE_OPTIONS=--max-old-space-size=3072 pnpm vp test run test/unit/shared/utils/dashboard-access.spec.ts --coverage.enabled=false` — expected FAIL, module not found.

- [ ] **Step 3: Implement** in `shared/utils/dashboard-access.ts`. Role order: highest `position` first, ties broken by the higher id first, the same order `PermissionNodeManager.getSortedRoles` reverses into. `classifyLegacyNode` matches names case-insensitively against `DASHBOARD_COMMAND_NAMES`.

- [ ] **Step 4: Run** the same command — expected PASS.

- [ ] **Step 5: Commit** `feat(dashboard): resolve dashboard access entries`.

### Task 2: Store, validate and apply the new entries

**Files:**

- Modify: `server/database/settings/types.ts:60-64`, `server/database/settings/validation.ts:109-117`, `server/database/settings/structures/PermissionNodeManager.ts`, `server/database/settings/utils/matchers/command.ts`, `server/utils/discord/index.ts:73-104`
- Test: `test/unit/server/database/settings-validation.spec.ts`, `test/unit/server/database/command-matcher.spec.ts`, `test/unit/server/utils/discord/manage-settings-thread.spec.ts`

**Interfaces:**

- Consumes: Task 1's `PermissionEntry`, `isDashboardEntry`, `resolveDashboardAccess`.
- Produces: `export type PermissionsNode = PermissionEntry` in `types.ts`; `export function hasAdminPermissions(guild: APIGuild, member: APIGuildMember, adminRoles: readonly string[]): boolean` (today's `isAdmin`, renamed and exported) in `server/utils/discord/index.ts`.

- [ ] **Step 1: Write the failing tests**

    - validation: `parseSettingsChanges([["permissionsRoles", [{ id: SNOWFLAKE, allow: [], deny: [], dashboard: "allow" }]]])` has no errors and keeps `dashboard`; `dashboard: "maybe"` errors; `{ dashboard: "allow", allow: ["settings"], deny: [] }` errors with a message naming the mixed shape; a legacy node still parses as today.
    - matcher: `matchAny(["conf"], "settings")` is true when the mocked command list has `settings`.
    - `PermissionNodeManager.run` with a member holding a role that has only a dashboard entry returns `null`.
    - `canManage` (in `manage-settings-thread.spec.ts`, extend its mocks so `readSettingsPermissionNodes` returns a manager whose `run` records its second argument):
        - a non-admin member with a user entry `allow` passes;
        - an Administrator member with a role entry `deny` throws 403;
        - the owner passes with a user entry `deny`;
        - an admin with no dashboard entries calls `run(member, "settings")` (not `"conf"`) and passes when it returns `null`.

- [ ] **Step 2: Run** the three spec files — expected FAIL.

- [ ] **Step 3: Implement**
    - `types.ts`: replace the `PermissionsNode` interface with the re-export of `PermissionEntry` from `#shared/utils/dashboard-access`.
    - `validation.ts`: `validatePermissionNodes` returns `createDashboardEntry(id, dashboard)` when `item.dashboard !== undefined` (refusing non-empty `allow`/`deny` and values other than `"allow"`/`"deny"`), else today's legacy node.
    - `PermissionNodeManager`: `runUser` and the sort skip entries where `isDashboardEntry`; `add`/`remove` refuse a dashboard entry's id with a 400.
    - matcher: `const RenamedCommands: Record<string, string> = { conf: "settings" }` applied in `matchName`, as the bot's `Command.ts` does.
    - `manage()`: owner → `resolveDashboardAccess({ userId, roleIds: member.roles }, { users: settings.permissionsUsers, roles: settings.permissionsRoles }, guild.roles)`; `"allow"` → true, `"deny"` → false; `null` → `hasAdminPermissions(...) && ((await nodes.run(member, "settings")) ?? true)`.

- [ ] **Step 4: Run** the three spec files — expected PASS; then `pnpm typecheck` — expected no errors.

- [ ] **Step 5: Commit** `feat(dashboard): apply dashboard access entries before the legacy nodes`.

### Task 3: Guard writes of the access rules

**Files:**

- Create: `server/utils/dashboard-access.ts`
- Modify: `server/api/guilds/[guild]/settings.patch.ts` (after `parseSettingsChanges`, before the transaction)
- Test: `test/unit/server/utils/dashboard-access.spec.ts`

**Interfaces:**

- Consumes: Task 1's resolver, Task 2's `hasAdminPermissions`.
- Produces: `export function assertCanEditDashboardAccess(guild: APIGuild, member: APIGuildMember, settings: ReadonlyGuildData, changes: Partial<GuildData>): void` — no-op when `changes` has neither `permissionsUsers` nor `permissionsRoles`.

- [ ] **Step 1: Write the failing tests**
    - owner may write anything, including a `deny` on their own id;
    - a member who passes `hasAdminPermissions` with no entries may write;
    - a member admitted only by a user entry `allow` (no Manage Server) gets an error with `status: 403` and `why` naming "only the owner or a member who can manage the server";
    - an admin whose change adds a `deny` for their own user id gets `status: 409` and `why` naming the lock-out; the same for a role entry `deny` on their highest role when no user entry of theirs allows;
    - a change of other keys only is a no-op.

- [ ] **Step 2: Run** `… test/unit/server/utils/dashboard-access.spec.ts` — expected FAIL.

- [ ] **Step 3: Implement** with `createError` from `evlog` (`message`, `status`, `why`, `fix`); the lock-out check runs `resolveDashboardAccess` on the entries after the change. In `settings.patch.ts`, call it with `trx.settings` once the transaction is open and before `trx.write`, so it reads what the database has now.

- [ ] **Step 4: Run** the spec — expected PASS.

- [ ] **Step 5: Commit** `feat(dashboard): let only server managers edit dashboard access`.

### Task 4: Owner removal of the legacy nodes, and the audit actions

**Files:**

- Create: `server/api/guilds/[guild]/access/legacy.delete.ts`, `shared/schemas/dashboard-access.ts`
- Modify: `shared/audit/actions.ts`, `shared/types/audit-log.ts`, `server/api/guilds/[guild]/logs/index.get.ts` (`DASHBOARD_AUDIT_ACTIONS` filter, if it enumerates)
- Test: `test/unit/shared/utils/dashboard-access.spec.ts` (extend), `test/unit/shared/audit-actions.spec.ts` (create if no audit test exists)

**Interfaces:**

- Produces: audit actions `guildAccessLegacyRemoved` (`"guild.access.legacy-removed"`), `guildCommandPermissionsUpdate` (`"guild.command-permissions.update"`), `guildCommandPermissionsAccessDenied` (`"guild.command-permissions.access-denied"`), all three added to `DashboardAuditAction` and `DASHBOARD_AUDIT_ACTIONS`; `LegacyRemovalSchema = object({ confirm: literal("REMOVE") })`; route `DELETE /api/guilds/:guild/access/legacy` → `{ removed: number }`.

- [ ] **Step 1: Write the failing tests** — `DASHBOARD_AUDIT_ACTIONS` contains the three names; `stripLegacyNodes` on a mixed list drops the legacy entries and returns the count difference the route reports.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement** the route: `authorize: authorizeGuildManager("Insufficient permissions to remove legacy permission nodes")`, then 403 unless `member.user.id === guild.owner_id`, body via `readValidatedBody(event, (b) => parse(LegacyRemovalSchema, b))`, one `writeSettingsTransaction` writing `stripLegacyNodes` of both columns, audit `guildAccessLegacyRemoved` with `changes: { removed }`, `rateLimit: { enabled: true, limit: 2, window: seconds(30) }`.
- [ ] **Step 4: Run** — expected PASS; `pnpm typecheck` clean.
- [ ] **Step 5: Commit** `feat(api): let the owner remove legacy permission nodes`.

### Task 5: Member search

**Files:**

- Create: `server/api/guilds/[guild]/members/search.get.ts`, `shared/schemas/member-search.ts`, `app/composables/useGuildMemberSearch.ts`, `app/components/guild/MemberPicker.vue`
- Test: `test/unit/shared/schemas/member-search.spec.ts`, `test/nuxt/components/guild/MemberPicker.spec.ts`, `test/nuxt/a11y.spec.ts`

**Interfaces:**

- Produces:
    - `MemberSearchQuerySchema = object({ query: pipe(string(), trim(), minLength(1), maxLength(100)) })`.
    - `GET /api/guilds/:guild/members/search?query=` → `FlattenedMember[]` (at most 25; a snowflake query resolves through `getMember`, 404 from Discord becomes `[]`).
    - `useGuildMemberSearch(guildId: MaybeRefOrGetter<string | null>, query: MaybeRefOrGetter<string>)` → `{ results: ComputedRef<FlattenedMember[]>, pending: Ref<boolean> }`, debounced 300 ms, no request under 1 character.
    - `<GuildMemberPicker v-model:ids="string[]" :guild-id :label />` emitting `update:ids`; ids not in the results are rendered by id with `ts("guild_member_picker.not_in_server")`.

- [ ] **Step 1: Write the failing tests** — schema: `""` and a 101-character query fail, `" ab "` trims to `"ab"`; picker: renders a known member's display name, renders an unknown id with the "not in the server" text, removing a chip emits `update:ids` without it; axe passes in `a11y.spec.ts`.
- [ ] **Step 2: Run** the unit spec and `pnpm vp test run test/nuxt/components/guild/MemberPicker.spec.ts --coverage.enabled=false --browser.connectTimeout=900000` — expected FAIL.
- [ ] **Step 3: Implement** the route with `authorize: authorizeGuildManager("Insufficient permissions to search members")`, `useApi().guilds.searchForMembers(guildId, { query, limit: 25 })`, `flattenMember`, `rateLimit: { enabled: true, limit: 10, window: seconds(10) }`; the picker on `UInputMenu`, following `app/components/select/Roles.vue` for layout and labels; English strings under `guild_member_picker.*` in `i18n/locales/en/guilds.json`.
- [ ] **Step 4: Run** — expected PASS; `pnpm i18n:check:fix` then `pnpm vp run i18n:report` clean.
- [ ] **Step 5: Commit** `feat(dashboard): search members to pick them`.

### Task 6: Dashboard access section

**Files:**

- Create: `app/components/guild/settings/Access.vue`, `app/utils/dashboard-access-draft.ts`
- Modify: `app/utils/dashboard-nav.ts` (item after `commands`: `{ group: "tools", icon: "ic:round-admin-panel-settings", labelKey: "dashboard.nav.access", slug: "access" }`), `app/pages/app.vue` (`access: sectionComponent(() => import("~/components/guild/settings/Access.vue"), "form")`), `i18n/locales/en/dashboard.json`, `i18n/locales/en/guilds.json`
- Test: `test/unit/app-utils/dashboard-access-draft.spec.ts`, `test/nuxt/components/guild/settings/Access.spec.ts`, `test/nuxt/a11y.spec.ts`

**Interfaces:**

- Consumes: Tasks 1, 4, 5.
- Produces (`dashboard-access-draft.ts`):

    ```ts
    export interface AccessRuleRow {
    	id: string;
    	access: DashboardAccess;
    }
    export function toRuleRows(entries: readonly PermissionEntry[]): AccessRuleRow[];
    export function toEntries(
    	rows: readonly AccessRuleRow[],
    	legacy: readonly PermissionEntry[],
    ): PermissionEntry[]; // legacy entries kept, after the dashboard ones, ids unique
    export function importLegacy(
    	entries: readonly PermissionEntry[],
    	id: string,
    ): PermissionEntry[]; // replaces one importable node by its dashboard entry
    ```

- [ ] **Step 1: Write the failing tests**
    - draft: `toEntries(toRuleRows(x), legacyOf(x))` round-trips; a row whose id also has a legacy node replaces the node; `importLegacy` on a not-convertible id returns the input unchanged.
    - component: with `rolesAdmin` empty it shows the "Manage Server or Administrator" line; with a legacy importable node it shows the import button and the dropped command names; the not-convertible block shows a "Download legacy nodes as JSON" button; the "Remove legacy nodes" button is present only when the current user is the owner; choosing `allow` shows the "opens the dashboard without Manage Server" note; axe passes.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement** — state through `useGuildSettings` / staged changes with `setGuildDataChange()` for `permissionsRoles` and `permissionsUsers` only (never clearing other keys); roles with `SelectRole`, members with `GuildMemberPicker`; the owner removal dialog requires typing `REMOVE` and calls Task 4's route, then refreshes `useGuildData`; JSON download built client-side from the legacy entries (`Blob`, filename `legacy-permission-nodes-<guildId>.json`); the owner id comes from the guild data already loaded.
- [ ] **Step 4: Run** — expected PASS; i18n check and report clean.
- [ ] **Step 5: Commit** `feat(dashboard): add the dashboard access section`.

### Task 7: Command rules (read-only)

**Files:**

- Create: `shared/utils/command-rules.ts`
- Test: `test/unit/shared/utils/command-rules.spec.ts`

**Interfaces:**

- Produces: `export interface CommandRule { command: string; allowedChannels: string[]; ignoredChannels: string[]; allowedRoles: string[]; ignoredRoles: string[]; allowedUsers: string[]; ignoredUsers: string[] }` and `export function readCommandRules(value: unknown): CommandRule[]` — a port of #338's `readCommandRestrictions` (spec, Part 2 → UI, tab 2).

- [ ] **Step 1: Write the failing tests** — non-array → `[]`; two entries for the same `command` merge and dedupe; `{ channel: S1, commands: ["ban", "kick"] }` yields `ignoredChannels: [S1]` for both; non-snowflake ids dropped; an entry with every list empty is omitted; unknown fields ignored.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement**, `isSnowflake` from `#shared/utils/snowflake`.
- [ ] **Step 4: Run** — expected PASS.
- [ ] **Step 5: Commit** `feat(dashboard): read the bot's command rules`.

### Task 8: Overwrite logic

**Files:**

- Create: `shared/utils/command-permissions.ts`
- Test: `test/unit/shared/utils/command-permissions.spec.ts`

**Interfaces:**

- Produces:

    ```ts
    import type { APIApplicationCommandPermission } from "discord-api-types/v10";
    export type Overwrite = APIApplicationCommandPermission; // { id, type, permission }
    export const MAXIMUM_COMMAND_OVERWRITES = 100;
    export function everyoneId(guildId: string): string;
    export function allChannelsId(guildId: string): string;
    export function normalizeOverwrites(rows: readonly Overwrite[]): Overwrite[]; // last row per (id, type) wins, sorted by type then id
    export function overwritesEqual(a: readonly Overwrite[], b: readonly Overwrite[]): boolean;
    export type OverwriteChange =
    	| { kind: "set"; row: Overwrite } // add or flip
    	| { kind: "remove"; id: string; type: Overwrite["type"] }
    	| { kind: "reset" }; // use app default
    export function applyChanges(
    	current: readonly Overwrite[],
    	changes: readonly OverwriteChange[],
    ): Overwrite[];
    export class OverwriteLimitError extends Error {
    	readonly count: number;
    }
    export function assertOverwriteLimit(rows: readonly Overwrite[]): void;
    export interface OverwriteDiff {
    	added: Overwrite[];
    	removed: Overwrite[];
    	flipped: Overwrite[];
    }
    export function diffOverwrites(
    	before: readonly Overwrite[],
    	after: readonly Overwrite[],
    ): OverwriteDiff;
    export function isAppDefault(commandId: string, applicationId: string): boolean;
    export function usesAppDefault(rows: readonly Overwrite[] | undefined): boolean; // undefined or empty
    export function snapshotOf(sets: Readonly<Record<string, readonly Overwrite[]>>): string; // stable string of normalized sets, keys sorted
    ```

- [ ] **Step 1: Write the failing tests**, with `GUILD = "110000000000000000"`:
    - `everyoneId(GUILD) === GUILD`; `allChannelsId(GUILD) === "109999999999999999"`.
    - read → change → write: current `[roleA allow, channelX deny]`, change `set roleB deny` → result has all three; change `set roleA deny` → roleA flipped, others kept; `remove channelX` → only roleA; `reset` → `[]`.
    - conflict: `overwritesEqual([a, b], [b, a])` true; differs by one `permission` → false; duplicates collapse before comparing.
    - limit: 100 rows pass; 101 throw `OverwriteLimitError` with `count: 101`; `applyChanges` does not throw (the route checks), so a draft can be shown over the limit.
    - `diffOverwrites` reports one added, one removed, one flipped for a crafted pair.
    - `isAppDefault(APP, APP)` true; `usesAppDefault([])` and `usesAppDefault(undefined)` true.
    - `snapshotOf` equal for the same sets in different key and row order.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement**; the two constants through `APIApplicationCommandPermissionsConstant` from `discord-api-types/v10`.
- [ ] **Step 4: Run** — expected PASS.
- [ ] **Step 5: Commit** `feat(dashboard): merge Discord command permission overwrites`.

### Task 9: Incremental scope and the scope check

**Files:**

- Modify: `server/utils/discord/provider.ts` (add `export const COMMAND_PERMISSIONS_SCOPE = "applications.commands.permissions.update"`; sign-in scopes unchanged), `app/pages/oauth/login.vue`
- Create: `server/utils/discord/token-scopes.ts`
- Test: `test/unit/server/utils/discord/token-scopes.spec.ts`, `test/unit/server/utils/discord-provider.spec.ts` (extend)

**Interfaces:**

- Produces:
    - `export async function readTokenScopes(accessToken: string, fetcher?: typeof $fetch): Promise<readonly string[]>` — `GET https://discord.com/api/v10/oauth2/@me` with `Authorization: Bearer`, returns `scopes`.
    - `export async function hasCommandPermissionsScope(event: H3Event): Promise<boolean>` — `getCurrentToken(event)` then `readTokenScopes`, memoized on `event.context` for the request.
    - `login.vue`: `?grant=command-permissions` adds `scopes: [COMMAND_PERMISSIONS_SCOPE]` to `signInDiscord.execute`; any other `grant` value is ignored.

- [ ] **Step 1: Spike, by hand, before the tests.** With `pnpm dev` and a test account, open `/oauth/login?grant=command-permissions&next=/app`, approve, then call `hasCommandPermissionsScope` through a throwaway route and confirm `true`; sign in again without `grant` and confirm `false`. If Better Auth's social sign-in drops `scopes` or the cookie keeps the old token, switch to `/link-social` with `scopes` and record which one works in `docs/arch/auth.md`. Delete the throwaway route.
- [ ] **Step 2: Write the failing tests** — `readTokenScopes` sends the bearer header and returns the scopes of a mocked response; on a 401 it returns `[]`; the token string never appears in any `console`/logger call (spy on `useLogger().set` and assert no argument contains it); `DISCORD_OAUTH_SCOPES` still equals `["guilds", "guilds.members.read"]`.
- [ ] **Step 3: Run** — expected FAIL.
- [ ] **Step 4: Implement**; no caching across requests (the spec's per-session cache is optional and left out unless the spike shows the call is slow).
- [ ] **Step 5: Run** — expected PASS. **Commit** `feat(auth): request the command permissions scope on demand`.

### Task 10: Editor requirements and the sync API

**Files:**

- Create: `server/utils/command-permissions/requirements.ts`, `server/utils/command-permissions/commands.ts`, `shared/schemas/command-permissions.ts`, `server/api/guilds/[guild]/command-permissions/index.get.ts`, `server/api/guilds/[guild]/command-permissions/[command].put.ts`
- Test: `test/unit/server/utils/command-permissions/requirements.spec.ts`, `test/unit/server/utils/command-permissions/commands.spec.ts`, `test/unit/shared/schemas/command-permissions.spec.ts`

**Interfaces:**

- Consumes: Tasks 8 and 9, `authorizeGuildManager`/`useManagedGuild`, `fetchCommands`.
- Produces:

    ```ts
    // requirements.ts
    export type EditorRequirementFailure =
    	| { code: "manage-guild" }
    	| { code: "manage-roles" }
    	| { code: "role-above"; roleId: string }
    	| { code: "channel-hidden"; channelId: string };
    export function checkEditorRequirements(input: {
    	guild: APIGuild;
    	member: APIGuildMember;
    	channels: readonly APIChannel[];
    	rows: readonly Overwrite[];
    }): EditorRequirementFailure | null;
    // commands.ts
    export interface RegisteredCommand {
    	id: string | null;
    	name: string;
    	command: string;
    	category: string;
    	description: string;
    }
    export function matchRegisteredCommands(
    	botCommands: readonly WolfCommand[],
    	discordCommands: readonly { id: string; name: string }[],
    ): RegisteredCommand[]; // one per top-level name, id null when Discord has none
    // schemas
    export const CommandPermissionsPutSchema; // { snapshot: string (1..256), permissions: array(max 100) of { id: snowflake, type: 1|2|3, permission: boolean } }
    // GET → { applicationId, commands: RegisteredCommand[], permissions: Record<string, Overwrite[]>, snapshot: string,
    //         authorization: { scopeGranted: boolean; manageGuild: boolean; manageRoles: boolean } }
    // PUT body { snapshot: string; permissions: Overwrite[] } → { permissions: Overwrite[]; snapshot: string }
    //     snapshot is snapshotOf({ [commandId]: rows }) for that one command
    ```

- [ ] **Step 1: Write the failing tests**
    - requirements: owner passes everything; Administrator passes Manage Guild/Roles; Manage Guild without Manage Roles → `manage-roles`; a row for a role at or above the member's highest role → `role-above` with its id (`@everyone` row exempt); a channel row the member cannot view (computed from overwrites; `allChannelsId` exempt) → `channel-hidden`.
    - `matchRegisteredCommands`: bot entries `ban add` and `ban remove` (`command: "ban"`) map to one Discord command `ban`; a bot command without a Discord counterpart has `id: null`; Discord commands the bot does not list are dropped.
    - schema: 101 permissions fail; `type: 4` fails; non-snowflake id fails.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement**
    - GET: `authorize: authorizeGuildManager("Insufficient permissions to read command permissions")`; application id from `runtimeConfig.discord.clientId`; commands from `getGlobalCommands` + `getGuildCommands` (bot token) matched to `fetchCommands()`; sets from `getGuildCommandsPermissions` (Discord 10066 "unknown application command permissions" → `{}`), keyed by command id; `authorization` from `hasCommandPermissionsScope` and the member's permission bits; `rateLimit: { enabled: true, limit: 5, window: seconds(10) }`.
    - PUT, in the spec's order: scope (403 `{ code: "scope-missing" }`), `checkEditorRequirements` (403 with the failure), `assertOverwriteLimit`, re-read the command's set with `getGuildCommandPermissions` (10066 → `[]`) and compare `snapshotOf` with the body (409 `{ code: "conflict", permissions: current }`), `editGuildCommandPermissions(token.access_token, appId, guildId, commandId, { permissions })` — `commandId` may equal the application id; Discord 403 → 403 `{ code: "discord-refused", message }`; a `RateLimitError` after `@discordjs/rest`'s retries → 503 `{ code: "rate-limited", retryAfter }`; audit `guildCommandPermissionsUpdate` with `{ commandId, before, after }` on success and `guildCommandPermissionsAccessDenied` on each refusal; `rateLimit: { enabled: true, limit: 5, window: seconds(10) }`. Errors carry `data` with the code so the client can branch.
- [ ] **Step 4: Run** — expected PASS; `pnpm typecheck` clean.
- [ ] **Step 5: Commit** `feat(api): read and write Discord command permissions`.

### Task 11: Commands section tabs and the rules tab

**Files:**

- Create: `app/components/guild/commands/Tabs.vue`, `app/components/guild/commands/Rules.vue`
- Modify: `app/pages/app.vue` (`commands` renders `GuildCommandsTabs` with the same `commands` prop), `app/components/guild/settings/DisabledCommands.vue` (unchanged inside, now tab 1), `i18n/locales/en/guilds.json`
- Test: `test/nuxt/components/guild/commands/Rules.spec.ts`, `test/nuxt/a11y.spec.ts`

**Interfaces:**

- Consumes: Task 7's `readCommandRules`; `useGuildSettings` for `commandsRestrictions`.
- Produces: `<GuildCommandsTabs :commands />` with tab values `disabled | rules | discord`, tab 3 a slot filled in Task 12.

- [ ] **Step 1: Write the failing tests** — rules tab lists a command with its allowed roles by name and its ignored channels; shows the "edited with /commands in Discord, binds the bot's administrators too" line; with no rules shows the empty state; axe passes for the tabs.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement** with `UTabs`; role and channel names from `useGuildData`, member ids through the picker's id-only rendering (no search here); no edit controls.
- [ ] **Step 4: Run** — expected PASS; i18n check and report clean.
- [ ] **Step 5: Commit** `feat(dashboard): show the bot's command rules in the Commands section`.

### Task 12: Discord permissions tab

**Files:**

- Create: `app/composables/useCommandPermissions.ts`, `app/utils/command-permissions-run.ts`, `app/components/guild/commands/DiscordPermissions.vue`, `app/components/guild/commands/PermissionCard.vue`, `app/components/guild/commands/ChangesPreview.vue`
- Modify: `app/components/guild/commands/Tabs.vue`, `i18n/locales/en/guilds.json`
- Test: `test/unit/app-utils/command-permissions-run.spec.ts`, `test/nuxt/components/guild/commands/DiscordPermissions.spec.ts`, `test/nuxt/a11y.spec.ts`

**Interfaces:**

- Consumes: Tasks 5, 8, 10.
- Produces:

    ```ts
    // command-permissions-run.ts
    export interface SaveOutcome {
    	sent: string[];
    	failed: { commandId: string; code: string; permissions?: Overwrite[] } | null;
    }
    export async function runSequentialSaves(
    	drafts: readonly { commandId: string; permissions: Overwrite[]; snapshot: string }[],
    	save: (
    		commandId: string,
    		body: { snapshot: string; permissions: Overwrite[] },
    	) => Promise<void>,
    ): Promise<SaveOutcome>; // awaits each save before the next; stops at the first rejection
    // useCommandPermissions(guildId) → { data, pending, refresh, drafts, setChange(commandId, change), resetToDefault(commandId), changedCommandIds, saveAll(): Promise<SaveOutcome> }
    ```

- [ ] **Step 1: Write the failing tests**
    - `runSequentialSaves`: three drafts, the second rejects with `{ data: { code: "conflict", permissions: [...] } }` → `sent` is the first id, `failed.commandId` the second, the third never called; the calls are strictly sequential (the second starts after the first resolves).
    - component, with a mocked GET:
        - `scopeGranted: false` shows the "Authorize with Discord" button linking to `/oauth/login?grant=command-permissions&next=/app` and no editable rows;
        - `manageRoles: false` disables "Review changes" and names Manage Roles;
        - the App default card comes first;
        - a command without rows shows "Uses app default", one with rows "Custom";
        - "Use app default" on a custom card clears its rows in the draft;
        - "Review changes" lists added, removed and flipped rows per command and the Administrator note;
        - a 409 during "Send to Discord" shows Discord's current rows next to the draft and a "Reload command permissions" button;
        - the 100 counter turns into an error at 101 and blocks review;
        - axe passes.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement** — `useFetch` of Task 10's GET keyed by guild; drafts per command id built with `applyChanges`; role rows with `SelectRole` (plus `@everyone` = `everyoneId`), channels with `SelectChannel` (plus "All channels" = `allChannelsId`), members with `GuildMemberPicker`; each row has an allow/deny segmented control; preview from `diffOverwrites`; sends through `$fetch` PUT, one at a time via `runSequentialSaves`, then `refresh()`; the snapshot sent per command is `snapshotOf({ [id]: data.permissions[id] ?? [] })` from the data the page loaded.
- [ ] **Step 4: Run** — expected PASS; i18n check and report clean.
- [ ] **Step 5: Commit** `feat(dashboard): edit Discord command permissions`.

### Task 13: Docs, full checks and the pull request

**Files:**

- Modify: `GLOSSARY.md` (the five terms of the spec's vocabulary table, with "Never" columns), `docs/arch/auth.md` (incremental scope, which sign-in path the spike chose, the token rule), `docs/arch/vue-components.md` (Commands tabs, Access section), `CLAUDE.md` Dashboard section (one line each for `access` and the Commands tabs), `test/unit/guardrails/forbidden-patterns.test.ts` (a rule: no `"conf"` passed to `nodes.run`)

- [ ] **Step 1:** Write the docs and the guardrail; run `… test/unit/guardrails --coverage.enabled=false` — expected PASS.
- [ ] **Step 2:** Run in sequence, one at a time: `pnpm lint:fix`, `pnpm typecheck`, `pnpm vp run knip`, `pnpm vp run i18n:report`, `pnpm test:unit`, `pnpm test:nuxt` (with the heap and timeout flags; rerun only failing files with `--testTimeout=60000`), then `pnpm build` with `NUXT_PUBLIC_SITE_URL` set. Expected: no errors.
- [ ] **Step 3:** Commit `docs(dashboard): document dashboard access and command permissions`.
- [ ] **Step 4:** Open the PR against `refactor/v3` with the `wolfstar-agent-kit:pr` skill. The body links the spec, says the bot's half (spec, "What the bot needs") is not in it, and asks the open question the spec leaves: whether #338's owner removal should keep dashboard entries.
- [ ] **Step 5:** Report to the user the four bot-side items from the spec, item 3 (#338's removal would empty the dashboard entries) first.
