---
version: alpha
name: WolfStar.rocks
description: Architectural Night Sky — a sophisticated dashboard aesthetic blending an evocative dark hero with a minimalist, architectural light UI. Calm authority and advanced technology through precise achromatic forms and a cool indigo accent.
colors:
    primary: oklch(58% 0.233 277.117)
    secondary: oklch(0.5873 0.0204 272.13)
    accent: oklch(60% 0.152 181.912)
    neutral: oklch(14% 0.005 285.823)
    branding-wolfstar: oklch(63% 0.2502 28.13)
    branding-staryl: oklch(0.5873 0.0204 272.13)
    base-100: oklch(100% 0 0)
    base-200: oklch(90% 0 0)
    base-300: oklch(85% 0 0)
    base-content: oklch(0% 0 0)
    info: oklch(55% 0.16 232.661)
    success: oklch(76% 0.177 163.223)
    warning: oklch(82% 0.189 84.429)
    error: oklch(71% 0.194 13.428)
typography:
    caption:
        fontFamily: Inter
        fontSize: 13px
        fontWeight: 400
        lineHeight: 1.5
        letterSpacing: -0.13px
    button-label:
        fontFamily: Inter
        fontSize: 16px
        fontWeight: 500
        lineHeight: 1
        letterSpacing: -0.19px
    subheading:
        fontFamily: Inter
        fontSize: 18px
        fontWeight: 400
        lineHeight: 1.2
        letterSpacing: -0.18px
    heading:
        fontFamily: Inter
        fontSize: 40px
        fontWeight: 700
        lineHeight: 1.1
        letterSpacing: -0.8px
    heading-lg:
        fontFamily: Inter
        fontSize: 48px
        fontWeight: 700
        lineHeight: 1.1
        letterSpacing: -0.96px
    display:
        fontFamily: Inter
        fontSize: 54px
        fontWeight: 700
        lineHeight: 1.1
        letterSpacing: -1.08px
spacing:
    xs: 4px
    sm: 8px
    md: 16px
    lg: 32px
    xl: 64px
    section-gap: 32px
    card-padding: 16px
    element-gap: 8px
rounded:
    sm: 6px
    md: 8px
    lg: 12px
    full: 9999px
components:
    ghost-button:
        backgroundColor: "{colors.base-100}"
        textColor: "{colors.base-content}"
        typography: "{typography.button-label}"
        rounded: 0px
        padding: 5px 12px
    subtle-nav-button:
        backgroundColor: "rgba(255, 255, 255, 0.06)"
        textColor: "{colors.base-content}"
        typography: "{typography.button-label}"
        rounded: "{rounded.md}"
        padding: 5px 12px
    solid-dark-button:
        backgroundColor: "{colors.neutral}"
        textColor: "{colors.base-100}"
        typography: "{typography.button-label}"
        rounded: "{rounded.md}"
        padding: 7px 16px 8px 12px
    outlined-action-button:
        backgroundColor: "{colors.base-100}"
        textColor: "{colors.base-content}"
        typography: "{typography.button-label}"
        rounded: "{rounded.sm}"
        padding: 5px 12px
    blurred-nav-item:
        backgroundColor: "{colors.base-300}"
        textColor: "{colors.base-content}"
        typography: "{typography.caption}"
        rounded: "{rounded.full}"
        padding: 8px
    elevated-content-card:
        backgroundColor: "{colors.base-200}"
        textColor: "{colors.base-content}"
        typography: "{typography.subheading}"
        rounded: "{rounded.lg}"
        padding: "{spacing.card-padding}"
    hero-overlay-card:
        backgroundColor: "rgba(222, 226, 222, 0.16)"
        textColor: "{colors.base-content}"
        typography: "{typography.subheading}"
        rounded: 24px
        padding: "{spacing.card-padding}"
    wolf-indigo-featured-card:
        backgroundColor: "{colors.primary}"
        textColor: "{colors.base-100}"
        typography: "{typography.heading}"
        rounded: 24px
        padding: 128px 80px
    ghost-input-field:
        backgroundColor: "{colors.base-300}"
        textColor: "{colors.base-content}"
        typography: "{typography.button-label}"
        rounded: 0px
        padding: 8px 12px
    badge-info:
        backgroundColor: "{colors.info}"
        textColor: "{colors.base-content}"
        typography: "{typography.caption}"
        rounded: "{rounded.full}"
        padding: 2px 8px
    badge-success:
        backgroundColor: "{colors.success}"
        textColor: "{colors.base-content}"
        typography: "{typography.caption}"
        rounded: "{rounded.full}"
        padding: 2px 8px
    badge-warning:
        backgroundColor: "{colors.warning}"
        textColor: "{colors.base-content}"
        typography: "{typography.caption}"
        rounded: "{rounded.full}"
        padding: 2px 8px
    badge-error:
        backgroundColor: "{colors.error}"
        textColor: "{colors.base-content}"
        typography: "{typography.caption}"
        rounded: "{rounded.full}"
        padding: 2px 8px
    badge-wolfstar:
        backgroundColor: "{colors.branding-wolfstar}"
        textColor: "{colors.base-content}"
        typography: "{typography.caption}"
        rounded: "{rounded.full}"
        padding: 2px 8px
    badge-staryl:
        backgroundColor: "{colors.branding-staryl}"
        textColor: "{colors.base-content}"
        typography: "{typography.caption}"
        rounded: "{rounded.full}"
        padding: 2px 8px
    badge-accent:
        backgroundColor: "{colors.accent}"
        textColor: "{colors.base-content}"
        typography: "{typography.caption}"
        rounded: "{rounded.full}"
        padding: 2px 8px
    badge-secondary:
        backgroundColor: "{colors.secondary}"
        textColor: "{colors.base-content}"
        typography: "{typography.caption}"
        rounded: "{rounded.full}"
        padding: 2px 8px
---

## Overview

WolfStar.rocks employs a sophisticated aesthetic, blending an evocative, illustrative dark hero with a predominantly minimalist, architectural light UI. Typography is restrained and elegant — **Inter only** for all text (headings, body, navigation, buttons, labels). No serif or secondary font families are configured. Surfaces are layered with subtle translucency and soft, multi-layered shadows, creating depth without heaviness. The overall impression is one of calm authority and advanced technology, articulated through precise achromatic forms punctuated by a singular, cool indigo accent for interactive elements.

## Colors

The light theme palette anchors on high-contrast achromatic surfaces with a cool indigo primary accent. Semantic state colors (info, success, warning, error) and bot brand colors (Wolf Ember, Staryl Slate) are reserved for their designated roles.

- **Primary (`oklch(58% 0.233 277.117)`):** Wolf Indigo — highlight elements, featured card backgrounds, and active interface states.
- **Secondary (`oklch(0.5873 0.0204 272.13)`):** Wolf Slate — ghost button borders, input field text, and understated interactive outlines.
- **Accent (`oklch(60% 0.152 181.912)`):** Wolf Teal — decorative emphasis used sparingly to punctuate key moments.
- **Neutral (`oklch(14% 0.005 285.823)`):** Obsidian — deep base for hero sections and high-emphasis dark CTAs.
- **Branding WolfStar (`oklch(63% 0.2502 28.13)`):** Wolf Ember — reserved for WolfStar bot identity badges and avatar rings.
- **Branding Staryl (`oklch(0.5873 0.0204 272.13)`):** Staryl Slate — reserved for Staryl bot identity badges and avatar rings.
- **Base 100 (`oklch(100% 0 0)`):** Canvas White — main page and component backgrounds.
- **Base 200 (`oklch(90% 0 0)`):** Ash Gray — secondary sections and elevated card surfaces.
- **Base 300 (`oklch(85% 0 0)`):** Cool Gray — input fields, navigation elements, and soft contrast surfaces.
- **Base Content (`oklch(0% 0 0)`):** Pitch Black — primary text on light backgrounds.
- **Info (`oklch(55% 0.16 232.661)`):** Informational banners, tooltips, and neutral notifications.
- **Success (`oklch(76% 0.177 163.223)`):** Saved confirmations and positive feedback.
- **Warning (`oklch(82% 0.189 84.429)`):** Cautionary notices without alarm.
- **Error (`oklch(71% 0.194 13.428)`):** Destructive actions and validation failures.

### Dark and midnight themes

Surface tokens shift across three Nuxt UI themes (light, dark, midnight). Semantic colors (primary, secondary, info, success, warning, error) remain constant; only base surfaces and content invert.

| Token        | Light                          | Dark                             | Midnight                    |
| ------------ | ------------------------------ | -------------------------------- | --------------------------- |
| base-100     | `oklch(100% 0 0)` Canvas White | `oklch(25% 0.016 252)` Midnight  | `oklch(0% 0 0)` Pitch       |
| base-200     | `oklch(90% 0 0)` Ash Gray      | `oklch(23% 0.014 253)` Deep Navy | `oklch(10% 0 0)` Coal       |
| base-300     | `oklch(85% 0 0)` Cool Gray     | `oklch(20% 0.012 254)` Abyss     | `oklch(27% 0 0)` Charcoal   |
| base-content | `oklch(0% 0 0)` Pitch Black    | `oklch(90% 0 0)` Snow            | `oklch(87.609% 0 0)` Silver |

## Typography

Inter is the universal typeface — configured via `@nuxt/fonts`, latin subset, preloaded (weights 400, 500, 600, 700). Vary weight and size according to the type scale; never introduce additional font families.

| Role         | Size | Line Height | Letter Spacing | Use                                    |
| ------------ | ---- | ----------- | -------------- | -------------------------------------- |
| caption      | 13px | 1.5         | -0.13px        | Metadata, timestamps, fine print       |
| button-label | 16px | 1           | -0.19px        | Buttons, form labels, navigation links |
| subheading   | 18px | 1.2         | -0.18px        | Card titles, section intros            |
| heading      | 40px | 1.1         | -0.8px         | Page section headlines                 |
| heading-lg   | 48px | 1.1         | -0.96px        | Prominent section headlines            |
| display      | 54px | 1.1         | -1.08px        | Hero headlines and maximum emphasis    |

## Layout

The page structure features an initial full-bleed hero section with a dark, illustrative cityscape background and a centered headline. Following this, the layout transitions to a contained, max-width centered model for content sections. Sections alternate between Canvas White and Ash Gray backgrounds, establishing a clear visual rhythm. Content is arranged in two-column text-left/image-right patterns or centered text stacks. Navigation is a compact sticky top bar.

**Base unit:** 4px. **Density:** comfortable.

| Token        | Value | Role                                    |
| ------------ | ----- | --------------------------------------- |
| xs           | 4px   | Micro-adjustments                       |
| sm           | 8px   | Element gap between related controls    |
| md           | 16px  | Card padding, standard internal spacing |
| lg           | 32px  | Section gap between major blocks        |
| xl           | 64px  | Large section breaks and hero spacing   |
| section-gap  | 32px  | Vertical rhythm between page sections   |
| card-padding | 16px  | Internal padding for card containers    |
| element-gap  | 8px   | Gap between sibling UI elements         |

## Elevation & Depth

Depth is conveyed through tonal layering and soft, multi-layered shadows rather than heavy drop shadows.

| Context                    | Shadow                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Nav items                  | `rgba(0, 0, 0, 0.15) 0px 2px 6px 0px`                                                                        |
| Cards                      | `rgba(0, 0, 0, 0.08) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 4px 5px 0px`                                   |
| Wolf Indigo featured card  | `rgba(0, 0, 0, 0.06) 0px 2px 2px 0px, rgba(0, 0, 0, 0) 0px 6px 6px 0px, rgba(0, 0, 0, 0.04) 0px 0px 0px 5px` |
| Input fields and subtle UI | `rgba(0, 0, 0, 0.05) 0px 1px 8px 0px`                                                                        |

Glass utilities (`card-glass`, `nav-panel-glass`) add frosted translucency for navigation and overlay surfaces. Hero overlay cards use `rgba(222, 226, 222, 0.16)` for minimal visual intrusion over imagery.

## Shapes

Nuxt UI base radius is `0.5rem` (8px). The app applies a slightly larger card radius for hierarchy:

| Token | Value  | Context                             |
| ----- | ------ | ----------------------------------- |
| sm    | 6px    | Small UI elements, outlined buttons |
| md    | 8px    | Interactive blocks, nav buttons     |
| lg    | 12px   | Cards (`rounded-xl`)                |
| full  | 9999px | Avatars, pills, badges              |

Apply consistently: cards → `rounded-xl` (lg), interactive blocks → `rounded-lg` (md), avatars/pills → `rounded-full`.

## Components

### Ghost Button

Transparent background, `base-content` text, no border, 0px radius. Used for links within text or secondary actions.

### Subtle Nav Button

Translucent white background (`rgba(255, 255, 255, 0.06)`), `base-content` text, `rounded-md` (8px), 5px vertical / 12px horizontal padding.

### Solid Dark Button

`neutral` (Obsidian) background, `base-100` text, `rounded-md`, asymmetric padding (7px top, 8px bottom, 16px left, 12px right). High-emphasis CTAs in dark contexts.

### Outlined Action Button

Transparent background, `base-content` text, `secondary` border, `rounded-sm` (6px), 5px vertical / 12px horizontal padding.

### Blurred Nav Item

`base-300` background with blur (`nav-panel-glass` utility), `rounded-full`, `base-content` text, soft nav shadow. Used in the header.

### Elevated Content Card

`base-200` background, `rounded-lg` (12px), card shadow, `card-padding` (16px). Featured information blocks.

### Hero Overlay Card

Translucent `rgba(222, 226, 222, 0.16)` background, 24px radius, no shadow, 16px padding. Minimal intrusion over hero imagery.

### Wolf Indigo Featured Card

`primary` background, `base-100` text, 24px radius, complex featured shadow, generous padding (128px top, 80px sides/bottom).

### Ghost Input Field

`base-300` background, `secondary` text and border, 0px radius, standard input padding.

### Status and brand badges

Small pill badges (`rounded-full`, caption typography, 2px vertical / 8px horizontal padding) for semantic and brand colors:

- **badge-info** — `info` background
- **badge-success** — `success` background
- **badge-warning** — `warning` background
- **badge-error** — `error` background
- **badge-wolfstar** — `branding-wolfstar` background (WolfStar bot only)
- **badge-staryl** — `branding-staryl` background (Staryl bot only)
- **badge-accent** — `accent` background
- **badge-secondary** — `secondary` background

## Do's and Don'ts

### Do

- Use Inter for all text. Vary weight (400 for body, 500/600 for labels, 700 for headings) and size according to the Type Scale.
- Use `neutral` (or dark-theme `base-100`) as a deep background for hero sections, contrasting with light body text.
- Layer surfaces with `base-200` and `base-100` for subtle depth on light-themed pages.
- Apply `primary` sparingly as a functional accent for key cards or active states.
- Reserve `branding-wolfstar` and `branding-staryl` strictly for bot identity badges and avatar rings.
- Implement soft, layered shadows for card components to give elements a subtle lift.
- Maintain comfortable density with `element-gap` (8px) and `card-padding` (16px).
- Apply the radius convention consistently: cards → lg, interactive blocks → md, avatars/pills → full.

### Don't

- Avoid excessive use of `primary` outside clear accent roles.
- Do not introduce strong colors or gradients beyond defined brand accents.
- Resist heavy opaque backgrounds on light pages; favor subtle translucency for overlays.
- Do not introduce custom font families; Inter is the only configured typeface.
- Do not mix `rounded-*` classes arbitrarily; follow the sm/md/lg/full convention.
- Do not deviate from specified shadow values.
- Avoid cluttering the layout; let content breathe with `section-gap` (32px) vertically.

## Imagery

The visual language for imagery combines two distinct styles: a highly detailed, illustrative, dark-themed cityscape for the hero section, serving as an atmospheric backdrop, and minimalist, contained product screenshots or abstract graphics for content areas. Photography is absent. Illustrations are organic and atmospheric in the hero, while content area graphics are abstract and geometric, typically featuring outlined shapes and a subdued, near-achromatic palette. Icons are outlined, with a moderate stroke weight, and mostly monochromatic. Imagery acts as both decorative atmosphere in the hero to draw the user in and as explanatory content in product sections, with a balanced density on content-heavy pages.

## Agent Prompt Guide

Quick Color Reference:

- text: `oklch(0% 0 0)` — Pitch Black (`base-content`)
- background: `oklch(100% 0 0)` — Canvas White (`base-100`)
- border: `oklch(85% 0 0)` — Cool Gray (`base-300`)
- accent: `oklch(58% 0.233 277.117)` — Wolf Indigo (`primary`)
- primary action border: `oklch(0.5873 0.0204 272.13)` — Wolf Slate (`secondary`)

Example Component Prompts:

1. Create a hero section with a `neutral` background (`oklch(14% 0.005 285.823)`). Headline (Inter display, 54px, weight 700, `base-100`). Subtext (Inter subheading, 18px, weight 400, `base-100`).
2. Create an Elevated Content Card: background `base-200` (`oklch(90% 0 0)`), `rounded-lg`, card shadow, 16px padding. Title (Inter subheading, 18px, weight 600), body (Inter button-label, 16px, weight 400).
3. Create an Outlined Action Button: transparent background, 1px solid `secondary`, `base-content` text, `rounded-sm`. Text (Inter button-label, 16px, weight 500), 5px vertical / 12px horizontal padding.
4. Create a Blurred Nav Item: apply utility `nav-panel-glass`. Text (Inter caption, 13px, weight 400, `base-content`), 8px padding.

## Product

**WolfStar** — Discord server moderation bot. Provides warnings, bans, mute/kick, advanced logging, and configurable moderation workflows for server admins.

**Staryl** — Social platform notification bot. Sends real-time alerts to Discord when followed accounts post on Twitch, YouTube, and other supported platforms.

**Target audience:** Discord server administrators and moderators who need reliable, low-friction tooling to manage their community.

**Primary use cases:**

1. Configure moderation thresholds and auto-moderation rules
2. Review audit logs and moderation history for a server
3. Set up social notification subscriptions for Staryl
4. Manage per-channel settings and permission overrides

## Brand Personality & Voice

**Character:** Approachable, competent, low-friction. Like a calm, capable team member — never condescending, never alarming unless the situation warrants it.

**Voice principles:**

- **Direct.** State what happens and why. No filler words.
- **Calm.** Even for errors, don't escalate. Offer a path forward.
- **Concise.** UI copy should fit in one glance. Eliminate redundant words.
- **Inclusive.** Plain language. Avoid jargon unless the audience expects it (Discord server terms are fine).

### Tone by context

| Context            | Tone                            | Example                                           |
| ------------------ | ------------------------------- | ------------------------------------------------- |
| Success            | Warm, brief                     | "Settings saved."                                 |
| Error              | Calm, actionable                | "Couldn't save. Check your connection and retry." |
| Warning            | Factual, forward-looking        | "This will affect all channels in your server."   |
| Empty state        | Helpful, inviting               | "No commands yet. Add your first one below."      |
| Loading            | Absent — use skeleton, not text | —                                                 |
| Destructive action | Explicit, one chance to confirm | "Delete this rule? This cannot be undone."        |

## Terminology

Use these terms consistently in all user-facing text (templates, toast messages, page titles, empty states, button labels).

| Use           | Do not use                        |
| ------------- | --------------------------------- |
| **Server**    | Guild, discord server, community  |
| **Sign in**   | Log in, login, connect            |
| **Sign out**  | Log out, logout, disconnect       |
| **WolfStar**  | Wolfstar, wolfStar, Wolf Star     |
| **Staryl**    | staryl, STARYL, Stary             |
| **Dashboard** | Panel, admin panel, control panel |
| **Settings**  | Configuration, config, options    |
| **Invite**    | Add to server, install            |

**Scope:** Terminology applies only to user-facing strings. Routes, TypeScript types, composable names, Prisma models, and API endpoints retain their existing identifiers.

## Copy Patterns

**Buttons:** verb + noun. "Save settings", "Delete rule", "Invite WolfStar". Include the object where space allows; avoid bare verbs alone ("Save", "Delete").

**Toasts:** always `title` + `description`.

- Success: title "Settings saved" / description "Changes will apply to all channels."
- Error: title "Save failed" / description "Check your connection and try again."
- Warning: title "Heads up" / description "This will affect all channels."

**Empty states:** heading + action prompt. "No rules yet. Create your first moderation rule."

**Destructive dialogs:** title + explicit consequence + confirm button label.

- "Delete this rule?" / "Rules cannot be recovered once deleted." / button "Delete rule"

## Similar Brands

- **Linear** — Shares a sophisticated dark header/light body theme, minimalist aesthetic, and subtle elevation patterns.
- **Anthropic (Claude)** — Similar restrained aesthetic, clean functional UI over decorative elements.
- **Stripe** — Uses elegant typography, crisp surfaces, and a well-defined achromatic palette with controlled accent colors.
- **Intercom** — Balanced white space, crisp typography, and strategic color accents against light backgrounds.

## Quick Start

### CSS Custom Properties

```css
:root {
	/* Colors — Brand */
	--branding-wolfstar: oklch(63% 0.2502 28.13);
	--branding-staryl: oklch(0.5873 0.0204 272.13);

	/* Colors — Semantic (light theme defaults) */
	--color-primary: oklch(58% 0.233 277.117);
	--color-secondary: oklch(0.5873 0.0204 272.13);
	--color-accent: oklch(60% 0.152 181.912);
	--color-neutral: oklch(14% 0.005 285.823);
	--color-info: oklch(55% 0.16 232.661);
	--color-success: oklch(76% 0.177 163.223);
	--color-warning: oklch(82% 0.189 84.429);
	--color-error: oklch(71% 0.194 13.428);

	/* Colors — Surfaces (light theme) */
	--color-base-100: oklch(100% 0 0);
	--color-base-200: oklch(90% 0 0);
	--color-base-300: oklch(85% 0 0);
	--color-base-content: oklch(0% 0 0);

	/* Typography — Font Family (Inter only, via @nuxt/fonts) */
	--font-inter:
		"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
		sans-serif;

	/* Typography — Scale */
	--text-caption: 13px;
	--leading-caption: 1.5;
	--tracking-caption: -0.13px;
	--text-button-label: 16px;
	--leading-button-label: 1;
	--tracking-button-label: -0.19px;
	--text-subheading: 18px;
	--leading-subheading: 1.2;
	--tracking-subheading: -0.18px;
	--text-heading: 40px;
	--leading-heading: 1.1;
	--tracking-heading: -0.8px;
	--text-heading-lg: 48px;
	--leading-heading-lg: 1.1;
	--tracking-heading-lg: -0.96px;
	--text-display: 54px;
	--leading-display: 1.1;
	--tracking-display: -1.08px;

	/* Typography — Weights */
	--font-weight-regular: 400;
	--font-weight-medium: 500;
	--font-weight-semibold: 600;
	--font-weight-bold: 700;

	/* Spacing */
	--spacing-unit: 4px;
	--spacing-xs: 4px;
	--spacing-sm: 8px;
	--spacing-md: 16px;
	--spacing-lg: 32px;
	--spacing-xl: 64px;
	--section-gap: 32px;
	--card-padding: 16px;
	--element-gap: 8px;

	/* Border Radius */
	--radius-sm: 6px;
	--radius-md: 8px;
	--radius-lg: 12px;
	--radius-full: 9999px;

	/* Shadows */
	--shadow-sm: rgba(0, 0, 0, 0.15) 0px 2px 6px 0px;
	--shadow-subtle: rgb(222, 226, 222) 0px 0px 0px 1px;
	--shadow-subtle-2: rgba(0, 0, 0, 0.08) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 4px 5px 0px;
	--shadow-subtle-3: rgba(0, 0, 0, 0.06) 0px 2px 2px 0px, rgba(0, 0, 0, 0.04) 0px 0px 0px 5px;
	--shadow-sm-2: rgba(0, 0, 0, 0.05) 0px 1px 8px 0px;
}
```

### Tailwind v4

```css
@theme {
	/* Colors — Brand */
	--color-branding-wolfstar: oklch(63% 0.2502 28.13);
	--color-branding-staryl: oklch(0.5873 0.0204 272.13);

	/* Colors — Semantic */
	--color-primary: oklch(58% 0.233 277.117);
	--color-secondary: oklch(0.5873 0.0204 272.13);
	--color-accent: oklch(60% 0.152 181.912);
	--color-neutral: oklch(14% 0.005 285.823);
	--color-info: oklch(55% 0.16 232.661);
	--color-success: oklch(76% 0.177 163.223);
	--color-warning: oklch(82% 0.189 84.429);
	--color-error: oklch(71% 0.194 13.428);

	/* Colors — Surfaces (light) */
	--color-base-100: oklch(100% 0 0);
	--color-base-200: oklch(90% 0 0);
	--color-base-300: oklch(85% 0 0);
	--color-base-content: oklch(0% 0 0);

	/* Typography — Font Family (Inter only, via @nuxt/fonts) */
	--font-inter:
		"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
		sans-serif;

	/* Typography — Scale */
	--text-caption: 13px;
	--leading-caption: 1.5;
	--tracking-caption: -0.13px;
	--text-button-label: 16px;
	--leading-button-label: 1;
	--tracking-button-label: -0.19px;
	--text-subheading: 18px;
	--leading-subheading: 1.2;
	--tracking-subheading: -0.18px;
	--text-heading: 40px;
	--leading-heading: 1.1;
	--tracking-heading: -0.8px;
	--text-heading-lg: 48px;
	--leading-heading-lg: 1.1;
	--tracking-heading-lg: -0.96px;
	--text-display: 54px;
	--leading-display: 1.1;
	--tracking-display: -1.08px;

	/* Spacing */
	--spacing-xs: 4px;
	--spacing-sm: 8px;
	--spacing-md: 16px;
	--spacing-lg: 32px;
	--spacing-xl: 64px;
	--section-gap: 32px;
	--card-padding: 16px;
	--element-gap: 8px;

	/* Border Radius */
	--radius-sm: 6px;
	--radius-md: 8px;
	--radius-lg: 12px;
	--radius-full: 9999px;

	/* Shadows */
	--shadow-sm: rgba(0, 0, 0, 0.15) 0px 2px 6px 0px;
	--shadow-subtle: rgb(222, 226, 222) 0px 0px 0px 1px;
	--shadow-subtle-2: rgba(0, 0, 0, 0.08) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 4px 5px 0px;
	--shadow-subtle-3: rgba(0, 0, 0, 0.06) 0px 2px 2px 0px, rgba(0, 0, 0, 0.04) 0px 0px 0px 5px;
	--shadow-sm-2: rgba(0, 0, 0, 0.05) 0px 1px 8px 0px;
}
```

## Utilities Catalog

Reusable `@utility` classes defined in `app/assets/css/utilities.css`. Prefer these over writing new `<style>` blocks.

| Utility                   | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| `gradient-text-hero`      | Pink-to-orange-to-WolfStar-Ember gradient as text fill               |
| `gradient-text-cool`      | Blue-to-purple gradient text fill                                    |
| `animate-shimmer`         | Looping shimmer animation (3s, ease-in-out)                          |
| `btn-glow`                | Glow pseudo-element on hover; adapts to btn-primary/secondary/accent |
| `card-glass`              | Frosted glass card with themed backdrop-filter                       |
| `card-glass-soft`         | Lighter frosted glass variant                                        |
| `card-glass-bordered`     | Frosted glass card with border                                       |
| `card-glass-subtle`       | Minimal glass for low-emphasis surfaces                              |
| `nav-panel-glass`         | Mobile/desktop nav panel glass effect (used in Header)               |
| `glass-overlay`           | Full-bleed glass overlay layer                                       |
| `glass-blur`              | Backdrop blur only, no background tint                               |
| `glass-card-bordered`     | Bordered glass card                                                  |
| `bg-grid-pattern`         | Subtle grid line background pattern                                  |
| `bg-dot-pattern`          | Subtle dot background pattern                                        |
| `bg-fade-pattern`         | Mask gradient fade (top visible, bottom transparent)                 |
| `content-visibility-auto` | Performance: skip rendering below-fold content                       |
| `will-change-transform`   | Performance: optimize paint for transformed elements                 |
| `no-scrollbar`            | Hide scrollbar visually (scroll still works)                         |

**Rule:** Before adding a new `@utility` to `utilities.css`, verify it is not already covered by the table above.
