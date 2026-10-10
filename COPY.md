---
scope: every user-facing string: marketing pages, meta tags, dashboard UI, toasts, errors, empty states, blog and changelog, social cards
owns: the words. DESIGN.md owns the visual system and defers voice to this file. VISION.md owns what may be claimed at all. GLOSSARY.md owns what a concept is called
last-reviewed: 2026-10-10
---

# Copy

The canonical source for WolfStar.rocks' verbal identity. Pages, meta tags, and UI strings pull from here.
When a canonical string changes, change it here first, then propagate to `i18n/locales/en/*.json`. A string
that contradicts this file is a bug.

Translation mechanics (keys, placeholders, locale bundles) live in `docs/arch/i18n.md`. This file
covers only the English source text.

## Canonical assets

These exact strings. Do not paraphrase them per page. The "Where" column names the key that ships them.

| Asset                | String                                                                                                                                          | Where                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Names                | `WolfStar`, `Staryl`, `WolfStar.rocks` for the site and domain. Never Wolfstar, wolfStar, Wolf Star, STARYL                                     | guidance only: applies everywhere                                                                                                                          |
| Tagline              | Moderation, with a paper trail.                                                                                                                 | `marketing.wolfstar.hero.title`                                                                                                                            |
| WolfStar kicker      | Open-source Discord moderation                                                                                                                  | `marketing.wolfstar.hero.kicker`                                                                                                                           |
| WolfStar subtitle    | WolfStar filters disruptive messages, records moderation and command history, and gives your team one place to manage server settings.          | `marketing.wolfstar.hero.subtitle`                                                                                                                         |
| WolfStar description | WolfStar gives Discord moderation teams configurable AutoMod, searchable moderation and command history, and one dashboard for server settings. | `marketing.wolfstar.seo.description`, the site description (`nuxtSiteConfig.description`, `site.description`, `seo.meta.ogDescription`) and `package.json` |
| WolfStar proof title | One system from first warning to final review.                                                                                                  | `marketing.wolfstar.proof.title`                                                                                                                           |
| WolfStar proof steps | Set the rule · Keep the record · Review it together                                                                                             | `marketing.wolfstar.proof.step_*_title`                                                                                                                    |
| Dashboard section    | The control room is part of the product.                                                                                                        | `marketing.wolfstar.dashboard.title`                                                                                                                       |
| WolfStar CTA title   | Put the rules and the record in one place.                                                                                                      | `marketing.wolfstar.cta.title`                                                                                                                             |
| Staryl H1            | Social updates, where your server already is.                                                                                                   | `marketing.staryl.hero.title`                                                                                                                              |
| Staryl kicker        | Open-source social notifications                                                                                                                | `marketing.staryl.hero.kicker`                                                                                                                             |
| Staryl status        | Public invite not available yet                                                                                                                 | `marketing.staryl.hero.no_invite`                                                                                                                          |
| Staryl description   | Staryl is an in-development Discord app for social notifications from the WolfStar Project. Its public invite is not available yet.             | `marketing.staryl.seo.description`                                                                                                                         |
| Primary actions      | Invite WolfStar · Invite Staryl · Ask in support · View source · Sign in to dashboard · Browse commands                                         | `marketing.*.hero.*`, `marketing.*.cta.*`                                                                                                                  |
| Per-bot summary      | WolfStar combines configurable moderation, server event logging, and dashboard-managed settings.                                                | `marketing.other_apps.wolfstar_description`                                                                                                                |
| Per-bot summary      | Staryl brings social updates into Discord. Its public invite is not available yet.                                                              | `marketing.other_apps.staryl_description`                                                                                                                  |

### The product in four lengths

**5 words:** Moderation, with a paper trail.

**1 sentence:** WolfStar filters disruptive messages, records moderation and command history, and gives your
team one place to manage server settings.

**2 sentences (the two bots):** WolfStar combines configurable moderation, server event logging, and
dashboard-managed settings. Staryl brings social updates into Discord.

**1 paragraph:** use the WolfStar subtitle, then the proof steps in order: set the rule, keep the record,
review it together. Name Staryl only where the paragraph is about the project, and say its public invite is
not available yet.

### Value propositions

| For...                      | Value                                                                             |
| --------------------------- | --------------------------------------------------------------------------------- |
| Admins configuring a server | Choose what WolfStar catches and what happens next, without editing files         |
| Moderators reviewing        | Search moderation and command history by member, moderator, action, date, or text |
| Teams working together      | See who changed which setting, and when, in the same dashboard                    |

## Claims

Every claim maps to something a reader can check. `VISION.md`, principle 5, is the rule. This table is the
operating copy of it.

| Claim                 | May say                                                                                                                                | Never say                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Open source           | "open source", while both `wolfstar-project/wolfstar` and `wolfstar-project/wolfstar.rocks` are public. Checked 2026-10-10, Apache 2.0 | "open source" if either repository goes private: narrow to the one a reader can clone |
| Audit record          | "tamper-evident", with the mechanism: a SHA-256 hash chain verified offline                                                            | secure, immutable, unhackable, military-grade                                         |
| Staryl availability   | "in development", "public invite not available yet"                                                                                    | "coming soon", any date, "launching"                                                  |
| Staryl capability     | Twitch live and offline notifications, as of this review                                                                               | other platforms, unless the source list in the Staryl page says so                    |
| Scale and reliability | Nothing, unless measured, sourced, and dated                                                                                           | server counts, member counts, uptime, "trusted by", "thousands of"                    |
| Testimonials          | Nothing, unless a named person said it and agreed to be quoted                                                                         | invented or composite quotes                                                          |
| Languages             | Point to `/translation-status`                                                                                                         | a language count anywhere else                                                        |

## Register by context

| Context               | Register                         | Example                                            |
| --------------------- | -------------------------------- | -------------------------------------------------- |
| Marketing (hero, CTA) | Editorial, declarative           | "Moderation, with a paper trail."                  |
| UI chrome (buttons)   | Short verb plus object           | "Save settings", "Invite WolfStar"                 |
| Descriptions (meta)   | Informative, concrete            | "Searchable moderation and command history."       |
| Success               | Warm, brief                      | "Settings saved."                                  |
| Error                 | Calm, actionable                 | "Couldn't save. Check your connection and retry."  |
| Warning               | Factual, forward-looking         | "This will affect all channels in your server."    |
| Empty state           | Helpful, inviting                | "No rules yet. Create your first moderation rule." |
| Loading               | Absent. Use a skeleton, not text |                                                    |
| Destructive action    | Explicit, one chance to confirm  | "Delete this rule? This cannot be undone."         |
| Data labels           | Always labeled with context      | "12 cases", never "12". "Updated 3d ago"           |

`.claude/DESIGN.md` links here for voice, tone, and copy patterns, so this file is the only owner of the
words.

### UI copy patterns

- **Buttons:** verb plus noun, with the object where space allows. "Save settings", "Delete rule", "Invite
  WolfStar". Avoid a bare "Save" or "Delete".
- **Toasts:** always a title and a description. Success: "Settings saved" with "Changes will apply to all
  channels." Error: "Save failed" with "Check your connection and try again."
- **Empty states:** heading plus the action. Never a heading alone.
- **Destructive dialogs:** a title, the explicit consequence, and a confirm button that names the action.
- **Accessible names:** an icon or card action names its object and its server. "Manage {name} server
  settings", not "Manage". A form carries a label that names it, such as "Channel settings form".
- **Eyebrow text:** do not stack a muted uppercase label directly above a heading that repeats it. If it
  carries real information, promote it into the heading or demote it to a line below.

## Copy principles

**Personality.** Approachable, competent, low friction. A calm, capable team member: never condescending,
never alarming unless the situation warrants it.

1. **Direct.** State what happens and why. No filler.
2. **Calm.** Even for errors, do not escalate. Offer a path forward.
3. **Concise.** UI copy fits in one glance. One strong sentence beats three weak ones.
4. **Specific.** Name the filter, the channel, the number. "Blocks messages with too many uppercase
   characters", not "Improves your chat".
5. **Plain.** Discord server terms are fine, because the audience uses them. Other jargon needs a reason.

## Banned language

Every row carries its reason, because a ban without one cannot tell the next writer whether a near miss is
also banned. Words that `GLOSSARY.md` lists as `Never` for a term are banned too, and are not repeated here.

| Never                                                                                               | Use instead                                   | Why                                                                                     |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| revolutionary, game-changing, supercharge, unlock, seamless, cutting-edge, next-generation, empower | the mechanism, or the number                  | Startup register. The reader runs a server and can tell                                 |
| AI-powered, smart, intelligent, magic, automate (as a selling word)                                 | name what the filter or rule does             | A rule that counts capital letters is not intelligence, and the claim cannot be checked |
| best, fastest, most powerful, ultimate, #1                                                          | the specific claim, with evidence             | A superlative without evidence is unfalsifiable                                         |
| secure, safe, unhackable, bulletproof, military-grade                                               | "tamper-evident", with the mechanism          | We can prove that the chain replays. We cannot prove a system is safe                   |
| trusted by, loved by, thousands of servers, growing community                                       | the measured number with its date, or nothing | An unsourced scale claim is invented social proof. See `VISION.md`, anti-scope 5        |
| coming soon, launching, available soon                                                              | "in development"                              | Promises a date that nobody set                                                         |
| Oops, Whoops, Uh oh, "We're so sorry"                                                               | what happened, then what the admin can do     | Apologetic theatre. The voice stays calm                                                |
| exclamation marks in UI copy                                                                        | a full stop                                   | A moderation tool does not shout at the person using it                                 |
| first person plural as the point of a CTA ("We've got you covered")                                 | the content, then the destination             | The words go to us. The reader needs the thing and where to get it                      |
| bare verbs as labels ("Save", "Delete", "OK")                                                       | verb plus object                              | A screen reader user hears a list of buttons without context                            |

## Known divergences

Shipped strings that still break this file. Resolve one, then delete it from this list.

1. **Translations of changed English strings.** The English source (`en`, `en-US`, `en-GB`) moved to
   "Sign in" and "server" and lost the Staryl placeholders and the first-person CTA. Other locales keep
   their earlier translations until the next Tolgee round marks them outdated.
2. **API and log messages.** Server error messages such as "Guild not found" and "Guild ID is required"
   (`server/api/guilds/**`, `server/utils/shared.ts`) and `app/layouts/dashboard.vue` log messages still say
   "guild". They are identifiers and diagnostics, not copy, but any message a visitor can read should say
   "server". Check which ones reach the UI before renaming, because API tests assert them.
3. **README feature bullets.** They use "powerful", "seamlessly", and "Secure", which the banned-language
   table rejects. The README is a repository document, so this is a style call, not a shipped-string bug.
4. **Bot repository description.** The `wolfstar-project/wolfstar` GitHub description still reads
   "A multipurpose Discord Bot". It lives outside this repository.

## Open questions

Wording calls this file does not settle. Add one, resolve it, fold the answer into the section above, then
delete it from this list.

1. **A "free" claim.** No page says WolfStar.rocks is free. If it should, `VISION.md` money posture is the
   first thing to confirm, because the claim would bind future pricing.
2. **Name for the whole project in marketing.** "WolfStar Project" appears in the Staryl description and
   "Also from WolfStar Project". Decide whether the homepage names the project or only the two bots.
