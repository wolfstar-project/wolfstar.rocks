# Onboarding on the dashboard

Date: 2026-11-26
Status: proposed
Issue: wolfstar-project/wolfstar.rocks#613 (Linear WOL-123)
Depends on: the bot's pull request for wolfstar-project/wolfstar#418, which adds the contract below.

## Purpose

An administrator sets up what a new member must pass before they are in: a sequence of stages, each with a
challenge. The bot (#418) runs the stages in Discord. The dashboard gives the administrator the same
configuration, tells them what is blocked and how to unblock it, and shows how many members passed.

This is part of moderating a server (VISION principle 1): it stops raid and spam accounts at the door.

## Decisions (owner, 2026-11-26)

- The dashboard is built now against the contract below. The bot has no onboarding model yet. The pull
  request merges after the bot's pull request and the submodule bump, as Join Guard did.
- A stage is one verification: a moment, a challenge, and what happens when the member fails.
- Challenges: Button, Emoji, Question, and Captcha on the site.
- Onboarding is a section of its own. Join Guard stays as it is. The Captcha challenge reuses the
  Turnstile check of the `/verify` page.
- The Captcha challenge is in the contract, and the editor does not offer it in this pull request. A second
  pull request extends `/verify` and turns it on.
- A stage can give one role when the member passes it. The role is optional.
- The bot owns the verification message. The dashboard shows its channel and does not change it, as it does
  for the honeypot.
- When a member fails a stage, WolfStar does one of: nothing, kick, timeout.

## Approaches

1. **Stages as rows behind routes of their own, with one revision number per server (chosen).** Every
   write sends the revision it read. The server refuses a write with an old revision (409), so a stale edit
   never overwrites a newer one. It matches how auto-moderation rules and Join Guard rules are written.
2. **Stages as one JSON column staged with the save bar.** Less code, but the save bar has no conflict
   check, the bot cannot count verifications per stage by a foreign key, and a JSON column is a second
   description of a stage (VISION principle 4).
3. **Stages inside Join Guard.** One section fewer, but Join Guard answers "which accounts look like a
   raid", and Onboarding answers "what must every member pass". One page, two questions fails the surface
   gate.

## Contract (proposed to the bot)

```prisma
model GuildOnboarding {                       // one row per guild, a child of Modules
  id           BigInt  @id                    // guild id
  enabled      Boolean @default(false)        // the module switch, flat key `onboardingEnabled`
  logChannelId BigInt? @map("log_channel_id") // every pass, failure and action
  channelId    BigInt? @map("channel_id")     // where the bot posted the verification message
  messageId    BigInt? @map("message_id")     // that message, owned by the bot
  revision     Int     @default(0)            // +1 on every change of the log channel, the message or a stage
}

model GuildOnboardingStage {                  // at most 5 per guild, run in `position` order
  id             BigInt  @id @default(autoincrement())
  guildId        BigInt  @map("guild_id")
  position       Int
  name           String                       // 1 to 32 characters, unique per guild whatever the case
  enabled        Boolean @default(true)
  trigger        OnboardingStageTrigger       // Join | NativeOnboarding
  challenge      OnboardingChallenge          // Button | Emoji | Question | Captcha
  question       String?                      // Question only, 1 to 200 characters
  answers        String[] @default([])        // Question only, 1 to 5 answers of 1 to 100 characters
  maxAttempts    Int     @default(3) @map("max_attempts")    // 1 to 5
  timeLimit      Int     @default(600) @map("time_limit")    // seconds, 0 = none, else 60 to 86400
  roleId         BigInt? @map("role_id")      // given when the member passes
  failureAction  OnboardingFailureAction @default("None") @map("failure_action") // None | Kick | Timeout
  failureTimeout Int?    @map("failure_timeout")             // Timeout only, seconds, 60 to 2419200
  createdAt      TimestampString(3) @default(now()) @map("created_at")
}

model OnboardingVerification {                // one row per member and stage, written by the bot
  id         BigInt  @id @default(autoincrement())
  guildId    BigInt  @map("guild_id")
  userId     BigInt  @map("user_id")
  stageId    BigInt? @map("stage_id")         // SetNull when the stage is deleted
  stageName  String  @map("stage_name")
  status     OnboardingVerificationStatus     // Waiting | Passed | Failed | Left
  attempts   Int     @default(0)
  createdAt  TimestampString(3) @default(now()) @map("created_at")
  resolvedAt TimestampString(3)? @map("resolved_at")
}
```

`onboardingEnabled` is a flat `GuildData` key, counted with the other module switches. The log channel and
the stages are not `GuildData` keys: they are written at once, through the routes below.

The conflict check is one statement inside the write's transaction:
`UPDATE "GuildOnboarding" SET revision = revision + 1 WHERE id = $guild AND revision = $sent`. No row
changed means another write came first. The bot does the same in its panel.

## The section

Slug `onboarding`, in the modules group of the sidebar, after Join Guard. In order:

1. **Header.** Title, description, two badges: "N of M stages on", "N verified this week".
2. **Banner** with the module switch and the verdict: "Ready" or "N stages blocked".
3. **What is blocked.** Shown only when something is blocked. One line per blocker: what is blocked, why,
   and what to do. Examples:
    - "Stage 2 waits for Discord's onboarding, and this server has no Community. In Discord, open Server
      Settings, then Enable Community."
    - "WolfStar has no verification message in this server. Run `/settings onboarding` in Discord and
      post it."
    - "WolfStar cannot give @Member: the role is above its own."
    - "WolfStar cannot send messages in #mod-log."
4. **Stages.** "N / 5" and "New stage". One row per stage, in order: number, name, switch, chips (when,
   challenge, role, on failure), "Ready" or "Blocked", passed and failed this week, Move up, Move down,
   Edit, Delete. Reorder is two buttons, so it works with a keyboard.
   The editor is a dialog: name, enabled, when (On join, After Discord's onboarding), challenge (Button,
   Emoji, Question; a Question shows its text and its answers), attempts, time limit in minutes, role,
   on failure (Nothing, Kick, Timeout with a duration).
5. **Verification message.** The channel the bot posted it in, read only, or how to post it.
6. **Log channel.** A channel picker with its own Save. A refusal names the missing permissions.

A conflict (409) keeps what the administrator typed, shows "Another administrator changed the onboarding
while this page was open", and offers Reload. Reload reads the latest state and closes the editor.

## Server

All routes take `authorizeOnboardingManager` as `authorize`, validate with Valibot schemas from
`shared/schemas/onboarding.ts`, run `notifyGuildSettingsUpdate()` inside the transaction, and emit an audit
event (`onboardingStage.<name>`, `onboarding.logChannel`, `onboarding.order`). A denied attempt emits its
own.

- `GET /api/guilds/:guild/onboarding`: revision, log channel, verification channel, stages, this week's
  counts per stage, and the readiness.
- `PATCH /api/guilds/:guild/onboarding`: the log channel.
- `POST …/onboarding/stages`, `PATCH …/stages/:stage`, `DELETE …/stages/:stage`.
- `PUT …/onboarding/stages/order`: the ids in their new order.

Every write answers the whole new state, so the page replaces its copy.

Readiness is a pure function, `onboardingReadiness()` in `shared/utils/onboarding.ts`. It takes the stages,
whether the server has Community and Discord's onboarding on, the verification message, the bot's
permissions and its highest role, and returns a list of tagged blockers. The route gathers the inputs from
Discord with the bot's token. The limits and the body parsers live in the same file, so the bot can port
them.

## Non-goals

- The member's side of the Captcha challenge (`/verify`): second pull request.
- A queue of members waiting at a stage. The page shows counts, not members.
- Posting or moving the verification message from the dashboard.

## Order of work

Each phase ends with a screenshot.

1. Domain: types, limits, body parsers, readiness. Section in read-only form: header, banner, blockers,
   stage list, counts.
2. Writes on the page: editor, reorder, switch, delete, log channel, conflict.
3. Server: routes, authorization, audit, storage. Needs the bot's contract commit for the submodule.
4. Sidebar, module registry, glossary, architecture note, translations check.

## Left to the builder

- New glossary terms, to confirm in the pull request: **Onboarding** (the module), **stage** (not "step"
  or "phase"), **challenge** (not "test" or "puzzle"), **verification message** (not "panel").
- Icons, chip tones and exact copy, within `COPY.md` and `.claude/DESIGN.md`.
