# Product filter documents: VISION, GLOSSARY, COPY

Date: 2026-10-10
Status: implemented, with the follow-up changes listed under "Follow-up changes"
Source of the pattern: `skilld-dev/skilld.dev` (`VISION.md`, `GLOSSARY.md`, `COPY.md`, `AGENTS.md`)

## Purpose

WolfStar.rocks has strong engineering rules (`AGENTS.md`) and a visual system (`.claude/DESIGN.md`), but no
written answer to three questions that every feature, page and string depends on:

1. **What may we build, and what must we refuse?** (product filter)
2. **What is each concept called, and what is it never called?** (vocabulary)
3. **How does a sentence say it, and which claims may it make?** (verbal identity)

skilld.dev solves this with three root-level "filter" documents that agents and reviewers read before
product, UI or copy work. This spec adapts that pattern to WolfStar.rocks.

Success means a reviewer can hold a proposal next to `VISION.md` and reject it in under a minute, and a
writer can settle a naming or wording argument by pointing at one line of `GLOSSARY.md` or `COPY.md`.

## Scope

In scope:

- `VISION.md`: mission, audience, money posture, principles, anti-scope, how the filter is used.
- `GLOSSARY.md`: canonical product vocabulary, with the words each term replaces.
- `COPY.md`: canonical strings, register per context, claims policy, banned language, open questions.
- A short "Read first" pointer in `AGENTS.md` so sessions load the three files.

Out of scope (recorded so they are not mistaken for omissions):

- Changing any shipped string in `i18n/locales/**` or any component. Divergences found were first listed in
  `COPY.md`. The follow-up section below records which were then fixed.
- Editing `.claude/DESIGN.md` or `README.md`. Both were handled in the follow-up section below.
- Porting skilld.dev's `docs/adr`, `docs/work`, `docs/runbooks` structure. That is a separate decision.

## Ownership boundaries

Each concern has one owner. A document links to the owner instead of copying its rules.

| Concern                                   | Owner                     |
| ----------------------------------------- | ------------------------- |
| What we build and refuse                  | `VISION.md`               |
| What a concept is called                  | `GLOSSARY.md`             |
| How a sentence says it, what it may claim | `COPY.md`                 |
| Visual system, tokens, components         | `.claude/DESIGN.md`       |
| Engineering rules and invariants          | `AGENTS.md` (`CLAUDE.md`) |
| Translation mechanics (keys, locales)     | `docs/arch/i18n.md`       |

Known overlap: `.claude/DESIGN.md` already carries "Brand Personality & Voice", "Terminology" and "Copy
Patterns". Those sections were the starting point for `COPY.md` and `GLOSSARY.md`, so the two files agree
with them today. After approval, the DESIGN.md sections should shrink to a link, so one file owns the words.

## What was adapted from skilld.dev, and what was dropped

Kept as mechanism:

- A `VISION.md` that exists to reject ideas, with a hard cap on principles, falsifiable principles and a
  named test per principle.
- A money posture and an anti-scope list that settle arguments in advance.
- A glossary with a map table, a `Never` list per term, and a collisions list.
- A copy file with canonical strings, "register by context", a banned-language table where every row carries
  its reason, and an open-questions list that is emptied by folding answers back in.
- Front matter (`scope`, `owns`, `last-reviewed`) on each file.

Replaced because the product differs:

- skilld's "two loops" (anonymous discovery, authenticated watching) becomes two surfaces: the marketing
  pages and the signed-in dashboard. They are separate audiences with separate primary actions.
- skilld's provenance, curation and digest principles have no WolfStar counterpart and are dropped.
- skilld's Cloudflare, SEO-suppression, skills.sh and CLI material is dropped.

## Facts the documents rely on

Every claim in the three files traces to one of these sources. No metric, testimonial or roadmap date is
invented. Where a source conflicts with another, the conflict goes to "Open questions".

| Fact                                                                                         | Source                                                        |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| WolfStar.rocks is the web dashboard for WolfStar (moderation) and Staryl (social alerts)     | `README.md`, `AGENTS.md`                                      |
| Both repositories are public under Apache 2.0, checked 2026-10-10                            | `gh repo view` for `wolfstar-project/wolfstar` and `.rocks`   |
| Funding is voluntary donation (Ko-fi, Patreon, GitHub Sponsors)                              | `README.md` "Sponsor"                                         |
| WolfStar focuses on moderation, Staryl on notifications; slash commands only                 | `content/blog/wolfstar-v7.md`                                 |
| v3 aligns the dashboard's data models with the bot's; v2.x is a maintenance track            | `content/blog/wolfstar-rocks-v2.md`                           |
| Staryl has no public invite and sends Twitch live and offline alerts today                   | `i18n/locales/en/marketing.json`                              |
| Settings changes are audited in a SHA-256 hash chain, verified offline with `audit:verify`   | `docs/arch/audit-logging.md`                                  |
| Marketing pages must not invent testimonials, usage metrics, member data or reliability data | `.claude/DESIGN.md` "Design Decisions"                        |
| User-facing terms: Server, Sign in, Dashboard, Settings, Invite                              | `.claude/DESIGN.md` "Terminology"                             |
| Accessibility is first-class; theme works with JavaScript disabled                           | `AGENTS.md` "Core Requirements", `docs/arch/design-tokens.md` |

## Principles chosen for VISION.md

Seven, capped. Each names a real thing it would reject.

1. One bot, one purpose.
2. The record is part of the product.
3. The server's own permissions decide who can change it.
4. The dashboard and the bot share one description of a server.
5. Claims are verifiable from the repository.
6. Stable before new.
7. Calm and accessible by default.

## Acceptance criteria

- The three files exist at the repository root, and nothing else is added at the root.
- Each file carries front matter with `scope`, `owns` and `last-reviewed: 2026-10-10`.
- `VISION.md` has at most seven principles, and each has a falsifiable `Test`.
- Every term in `GLOSSARY.md` lists at least one `Never` word, and every collision names both sides.
- Every `COPY.md` banned-language row has a reason.
- No document states a number, date or capability absent from the source table above.
- `AGENTS.md` links the three files under a "Read first" heading.
- `vp fmt --check` passes on the new Markdown files.

## Open questions for review

1. **Site description.** `nuxtSiteConfig.description` and the bot's repository describe a "multipurpose"
   bot; the v7 plan and the homepage hero describe a moderation-only bot. The documents pick the shipped
   homepage wording as canonical and list the other as a divergence. Confirm which is the intended identity.
2. **Money posture.** The documents state the facts that exist (open source, voluntary donations) and
   forbid paywalled or promoted placement as a stance. If a paid tier is planned, VISION must change first.
3. **Staryl placeholders.** `marketing.staryl.proof.step_*_body` ship the literal text "Placeholder —
   describe …". `COPY.md` records this as a known defect rather than rewriting copy here.
4. **README roadmap.** `README.md` lists multi-language support as "on the roadmap", while the v2.0 post says
   it shipped. Not changed here.

## Follow-up changes

Applied after the three documents landed, so the copy matches the files that now govern it.

| Change                                                                                                                                            | Where                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| "Login" and "Log in" became "Sign in". "Guild" became "server" in sign-in, dashboard, and settings form copy                                      | `auth.json`, `dashboard.json`, `errors.json`, `guilds.json`  |
| Staryl placeholder step bodies replaced with copy built from facts already on the page (Twitch only, one streamer to one channel, slash commands) | `marketing.json`                                             |
| "Want more? We've got you covered." became "Two apps, one project."                                                                               | `marketing.json`                                             |
| "Search Wolfstar HQ" became "Search WolfStar HQ", and the SSR spec follows                                                                        | `marketing.json`, `test/nuxt/ssr.spec.ts`                    |
| Site description now carries the moderation-focused homepage wording instead of "multipurpose bot"                                                | `common.json`, `nuxt.config.ts` (two places), `package.json` |
| Stories follow the new strings                                                                                                                    | `app/pages/oauth/callback.stories.ts`, `guild.stories.ts`    |
| README says moderation bot, drops the unshipped login events from the audit claim, and lists multi-language as shipped                            | `README.md`                                                  |
| DESIGN.md "Brand Personality & Voice" and "Terminology" link to `COPY.md` and `GLOSSARY.md`, and "Copy Patterns" is removed                       | `.claude/DESIGN.md`                                          |

Applied to `en`, `en-US`, and `en-GB` alike, because the two regional files are full copies of `en` and
`en-US` is the default and fallback locale. `es` and `es-ES` held an English copy of
`errors.session_expired_description`, which became an empty placeholder as the localization rule requires.
Translations in other locales are left for the next Tolgee round. API error messages that still say "Guild"
are identifiers, recorded in `COPY.md` under "Known divergences".

## Engineering follow-ups from skilld.dev

Adopted after the copy work, from the same review of `skilld-dev/skilld.dev`.

| Change                                                                                                                                 | Where                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `timeout-minutes` on every workflow job. Reusable-workflow calls cannot carry one and are left alone                                   | `.github/workflows/*.yml`                                                                     |
| Forbidden-pattern guardrail tests for the greppable invariants in `AGENTS.md`, each with a reason and a self-check                     | `test/unit/guardrails/forbidden-patterns.test.ts`                                             |
| Sentry `bundleSizeOptimizations.excludeDebugStatements`                                                                                | `nuxt.config.ts`                                                                              |
| Declared skills by exact source commit, `skilld` bumped to 3.6.7, `skills:sync` and `skills:check` scripts, and a CI job for the check | `.skills/skilld.json`, `.skills/skilld-lock.yaml`, `package.json`, `pnpm-lock.yaml`, `ci.yml` |
| `AGENTS.md` cut from about 51 KB to about 18 KB. Long-form notes moved verbatim to `docs/arch/`, with a Traps list kept in `AGENTS.md` | `AGENTS.md`, `docs/arch/**`                                                                   |

Evaluated and not adopted: `trustPolicy: no-downgrade`. On the current lockfile it rejects 34 entries (the
cssnano and postcss family, `chokidar`, `@netlify/serverless-functions-api`, and others) and each version
bump would need a new exclusion. pnpm 11 already enforces a one-day `minimumReleaseAge` and blocks exotic
subdependencies by default. Revisit when the offending packages publish with provenance again.
