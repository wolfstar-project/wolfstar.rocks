---
scope: WolfStar.rocks (marketing pages for WolfStar and Staryl, the signed-in dashboard, guild logs, Discord sign-in, the audit trail)
distilled-from: README.md, AGENTS.md, .claude/DESIGN.md, content/blog/wolfstar-v7.md, content/blog/wolfstar-rocks-v2.md, the shipped homepage and Staryl copy in i18n/locales/en/marketing.json
last-reviewed: 2026-10-10
hard-cap: 7 principles, ~200 lines. Adding a principle requires removing one.
---

# Vision

What WolfStar.rocks is, why it exists, and what it refuses to become. This document exists to reject ideas,
not inspire them. If a section here cannot reject anything real, it is wallpaper. Cut it.

---

## Mission

**Moderation, with a paper trail.** WolfStar.rocks is the web dashboard for the WolfStar Project's Discord
bots. It gives the people who run a Discord server one place to configure WolfStar, and one place to review
what WolfStar and their own team did afterward. Configuring is the visible half. The record is the lasting
half.

**Two bots, one dashboard.**

- **WolfStar** moderates a server: configurable filters, escalation rules, moderation cases, event logging,
  and command access.
- **Staryl** brings social updates into a server. Twitch live and offline alerts are what it does today. It
  has no public invite yet, and every page that mentions it says so.

**What the site is.** The dashboard is not a second product beside the bots. It is their control room. A
feature belongs here only if it configures or reviews what WolfStar or Staryl does in a server.

**What it is not.** A bot directory, a hosting platform, a community network, or a place to browse for new
bots. The only apps it presents are the two the WolfStar Project builds.

---

## Who it is for

**Primary: the server admin or moderator.** Someone who manages a Discord server, is allowed to change its
bot settings, and wants to do it without memorizing setup commands or editing files. They want to know what
WolfStar will do before it does it, and who changed what afterward.

**Secondary: the visitor deciding whether to invite WolfStar.** They have not signed in and may never. They
want to see the bot work, read what it does in plain words, and reach an invite link or a support server
without an account.

**Who it is not for.**

- **The bot collector** browsing for a long list of features. WolfStar's stated direction is moderation
  only (blog post v7), and the dashboard follows it.
- **The platform buyer** wanting white-label hosting, seat management, or a service agreement. The project
  calls itself a hobby project (blog post v7), not a vendor.
- **The growth marketer** wanting promoted placement, referral mechanics, or engagement funnels inside a
  moderation tool.

---

## Money posture

**WolfStar.rocks is open source and funded by voluntary donations.** The dashboard and the bot are both
public under Apache 2.0 (checked 2026-10-10). The README links Ko-fi, Patreon, and GitHub Sponsors. That is
the whole funding story, and it settles arguments in advance: no feature is justified by revenue, so
features are judged by the principles below.

**Rejects:** paywalls on moderation features or on the record; ads; sponsored or promoted placement;
donation prompts inside the dashboard; any feature whose justification is "future monetization."

**Test:** does the change create an obligation to anyone other than the admin using it? If yes, fail.

---

## The two surfaces

Each surface has one audience and one primary action. A change that strengthens that action is high
leverage. A change that touches neither is suspect.

1. **The marketing pages** (`/wolfstar`, `/staryl`, `/commands`, blog, changelog) serve the visitor.
   They end in one action: invite the bot, or ask in the support server. They prove value with working
   demonstrations, such as a command box that behaves like Discord, not with claims.
2. **The dashboard** (`/guilds/*`, `/profile`) serves the admin. Sign in with Discord, choose a server you
   manage, then configure it or review its history. The primary action is saving a setting or finding a
   record.

If a feature cannot be traced to one of these, the pull request description must explain why.

---

## Universal surface gate

Applies to every user-facing route. Each page state gets one primary question, one primary action, and one
owning concern. An overview may show a verdict and compact doorways. It does not become a second home for
every concern it links to.

**Test:** can the page be named as one question, and does every artifact on it help answer that question?
Is there one obvious next action? If not, split, move, merge, or cut before building.

---

## Principles

The filter for WolfStar.rocks work, precise enough to hold a proposal next to it and say no in 30 seconds.

### 1. One bot, one purpose

WolfStar moderates. Staryl notifies. Each bot's pages, settings, and commands describe that bot only. The
v7 plan chose quality over quantity on purpose, and the dashboard inherits that choice.

**How to apply:** a new dashboard section names the bot it configures and the bot capability it exposes. A
feature that serves neither is not built here, however popular it is on other bots.

**Test:** can the feature be described as part of moderating a server or routing a social update? If it is
a third thing, fail.

### 2. The record is part of the product

Every moderation action, command outcome, and dashboard settings change is attributable: who, what, and
when. Settings changes enter a hash-chained audit trail that can be replayed and verified offline. A feature
that changes state without leaving a record is incomplete.

**How to apply:** a write path in the dashboard emits its audit event, and a denied attempt emits its own.
Known gap, recorded honestly: sign-in, sign-out, session-refresh, and OAuth-state events are defined but not
emitted today (see `docs/arch/audit-logging.md`). Closing that gap is in scope. Pretending it is closed is
not.

**Test:** after a change, can an admin find who made it and what it changed? If not, fail.

### 3. The server's own permissions decide

Only members who can manage a server can read its logs or change its settings. The check runs on every
request, including a response served from cache. A visitor never sees another server's data, and a denial is
recorded.

**How to apply:** permission checks live in the handler's `authorize` option, never in a UI conditional
alone. New log or settings routes ship with a denial test.

**Test:** can a signed-in member without manage rights on a server read or write its data through any
route, cached or not? If yes, fail.

### 4. One description of a server

The dashboard and the bot describe the same guilds, cases, and settings. A second, drifting description
makes every feature pay for the drift, which is exactly what held v3 back. New dashboard models start from
the bot's shape, not from the dashboard's convenience.

**How to apply:** do not add a dashboard-only field that mirrors bot data. A schema change that the bot
does not already agree with waits for the bot, not the other way around.

**Test:** if the bot renames a field tomorrow, does the dashboard need a second source of truth edited? If
yes, fail.

### 5. Claims are verifiable from the repository

The site says what the code does and nothing more. Demonstrations are real: the command demo behaves like
Discord, and the filter examples are the filters a server can configure. No testimonials, usage counts, server counts, uptime figures, or
"trusted by" lines without a source and a date.

**How to apply:** every number, capability, or "open source" claim on a page maps to code, a test, or a
dated source. The claims policy and the banned words live in `COPY.md`.

**Test:** for each claim on the page, can a reviewer point to the line of code or the dated source that
makes it true? If not, fail.

### 6. Stable before new

The end goal is stability, speed, a good experience, and accessibility. The v2.0
release split the road into a feature track that ended there and a maintenance track after it: fixes,
dependency updates, accessibility, performance, translations. A small release between now and v3 is the
plan working.

**How to apply:** work that needs the v3 data layer waits for v3. A change that widens the surface faster
than its tests and accessibility checks cover is not ready.

**Test:** does this change depend on models the bot has not agreed to yet? If yes, it waits. Is it covered by
the checks the pre-commit list requires? If not, it is not done.

### 7. Calm and accessible by default

The interface is a control room, not a billboard. Accessibility is part of the first design pass, not a
later audit: keyboard operation, reduced motion, readable themes even when JavaScript is off. The voice is
direct and calm, even in errors. Full systems live in `.claude/DESIGN.md` and `COPY.md`. This principle
makes them vetoes.

**How to apply:** a new surface ships with its empty state, its error state, its keyboard path, and its
reduced-motion behavior. Copy passes the banned-language list.

**Test:** can an admin complete the primary action with a keyboard alone and with reduced motion on? If not,
fail.

---

## Anti-scope

1. **We are not a bot directory.** The only apps presented are WolfStar and Staryl. No third-party bot
   listings, rankings, or reviews.
2. **We are not a hosting platform.** Self-hosting the dashboard against your own bot is documented in the
   README. Running bots or servers for others is not a feature.
3. **No pay-to-play, ever.** No sponsored content, promoted placement, or ads. This is the money posture
   made permanent.
4. **We do not optimize engagement.** Sessions per week is not a goal. Time to a saved setting and time to a
   found record are. No streaks, no notification escalation, no re-engagement campaigns.
5. **We do not manufacture social proof.** No invented testimonials, member counts, or reliability claims.
   If a number is not measured and sourced, it is not shown.
6. **We are not a second Discord.** Chat-like demos exist to show what the bot does. The dashboard never
   becomes a message client.

---

## How this filter gets used

- **Roadmap:** every feature traces to a surface and passes the applicable principles. Eligibility first,
  then placement (the surface gate). Anything that fails either is cut.
- **PR review:** every visible UI change states the page question, the primary action, and the owning
  concern, and records PASS or FAIL against the applicable principles. Citing one principle never waives
  another.
- **Subtraction:** every added route, section, or noun names what it removes, merges, or moves. Every
  surface is a permanent maintenance loan.
- **AI sessions:** this file is referenced from `AGENTS.md`, so every session loads it. Evaluate a proposal
  against the principles before writing code.
- **Disagreement:** when this document and existing code conflict, this document wins. Existing code is
  evidence, not precedent. Change the code or record a dated, narrowly scoped exception. Do not weaken the
  rule to bless drift.

## When to update this doc

Edit freely. It is a two-way door. The only commitments:

- Hard cap: 7 principles. Adding one removes one.
- Every principle must be falsifiable: a real pull request, feature, or row it would reject.
- Principles accrete evidence. Quote user feedback and measurements in place, the way a principle without a
  scar is a guess.
- The money posture changes only through a dated written decision, not an edit.
