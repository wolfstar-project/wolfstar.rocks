---
title: wolfstar.rocks v2.0
description: Why we shipped a release that was never meant to exist, and what v3 is waiting for.
date: 2026-08-20
tags:
    - release
    - dashboard
category: Release
image: /assets/blog/wolfstar-rocks-v2.png
authors:
    - name: RedStar
      avatar:
          src: https://github.com/RedStar071.png
      to: https://x.com/redstar071
---

This release was not supposed to exist. The plan was v3: one jump that would land the new dashboard and the rewritten
data layer together. That plan is still the plan — it just moved. What did not move is the work already sitting on
`main`: finished, reviewed, and waiting on a rewrite it does not depend on. So we shipped it. This is v2.0.

## What v3 is waiting for

v3 is a data problem before it is a feature problem. The dashboard keeps its own Prisma schema, and the bot keeps its
own — two definitions of the same guilds, the same moderation cases, the same settings, drifting apart one migration at
a time. Every dashboard feature that touches guild data pays for that drift: a field the bot renamed, a shape the
dashboard normalises differently, a column that exists on one side and not the other.

v3 is where that stops. The dashboard's models get rewritten to match the bot's, field for field, so there is exactly
one description of a guild and both sides read it the same way. That is not a refactor we can land halfway, and it is
not a refactor worth rushing while the bot's own schema is still moving. So v3 waits.

## What shipped anyway

Almost none of the work queued behind v3 actually needed the new models. It sits above them: authentication, language,
theming, the log views, the error surface. Holding it hostage to a schema rewrite would have meant sitting on finished
code for months and shipping it all at once — the exact release shape that makes regressions impossible to bisect.

The highlights of v2.0:

- **Authentication moved to Better Auth.** The custom OAuth flow and its hand-rolled CSRF state are gone; Discord
  sign-in, session refresh, and token handling now run through one audited library.
- **The dashboard speaks more than English.** Nuxt i18n, Tolgee for translation management, and Lunaria for tracking how
  far behind each locale is. Untranslated keys fall back to English instead of rendering empty.
- **Guild logs and an audit trail.** Command, moderation, and activity views, backed by a hash-chained audit log that
  records who changed what.
- **Settings that survive a reload.** Theme, language, and reduced-motion preferences are consolidated behind one
  storage key, and `/profile` works for signed-out visitors too.
- **A real error page.** Fatal errors render our own page, translated, instead of a bare framework fallback.
- **Fixes that only show up in the details.** Coherent colours with JavaScript disabled, no horizontal scroll from
  full-bleed sections, safer Sentry reporting, and a stable SSR build.

## Two tracks from here

Shipping v2.0 splits the road. This release is the first track, and it ends here: it is the last time for a while that
the site gains a batch of features in one piece. The second track is everything after it — bug fixes, dependency
updates, accessibility and performance work, translations catching up. Maintenance, deliberately. If a release between
now and v3 looks small, that is the plan working, not the project stalling.

That also makes the maintenance track cheap to reason about. Nothing in it touches the data layer, so nothing in it
conflicts with the schema rewrite happening alongside it. The two tracks stay out of each other's way, which is the
whole reason for drawing the line here rather than after v3.

## Where the radical changes land

The interesting work is not disappearing, it is moving. WolfStar v7 is a rebuild, not an upgrade, and a dashboard that
matches it cannot be grown out of this one in small steps. Once the v7 alpha or beta is close to usable, the redesigned
dashboard and the bot changes that come with it will go live on `main.wolfstar.rocks` — the radical version, running
against the rewritten models, while this site keeps serving the bot people use today.

So: v3 is not cancelled, and it is not late in the way a missed deadline is late. It is parked behind a rewrite that has
to happen once and happen properly. Everything that did not need to wait for it is live now.
