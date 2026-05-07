# WolfStar.rocks — Style Reference

> Architectural Night Sky

**Theme:** light

WolfStar.rocks employs a sophisticated aesthetic, blending an evocative, illustrative dark hero with a predominantly minimalist, architectural light UI. Typography is restrained and elegant, utilizing a serif for headlines that conveys gravitas and a clean sans-serif for body text. Surfaces are layered with subtle translucency and soft, multi-layered shadows, creating depth without heaviness. The overall impression is one of calm authority and advanced technology, articulated through precise achromatic forms punctuated by a singular, cool indigo accent for interactive elements.

## Tokens — Colors

| Name         | Value                         | Token                             | Role                                                                                                                                                     |
| ------------ | ----------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wolf Ember   | `oklch(63% 0.2502 28.13)`     | `--branding-wolfstar`             | WolfStar bot brand identity; reserved for badges, avatar rings, and bot-specific UI elements that signal the moderation product                          |
| Staryl Slate | `oklch(58.73% 0.0204 272.13)` | `--branding-staryl`               | Staryl bot brand identity; reserved for badges, avatar rings, and bot-specific UI elements that signal the notifications product                         |
| Wolf Indigo  | `oklch(58% 0.233 277.117)`    | `--color-primary`                 | Highlight elements, card backgrounds for featured content, and active interface states. Its vivid hue draws attention while maintaining a high-tech feel |
| Wolf Slate   | `oklch(58.73% 0.0204 272.13)` | `--color-secondary`               | Border color for ghost buttons and interactive elements, providing a clear but understated active state                                                  |
| Wolf Teal    | `oklch(60% 0.152 181.912)`    | `--color-accent`                  | Decorative accent for emphasis and selective highlights; used sparingly to punctuate key interface moments                                               |
| Obsidian     | `oklch(14% 0.005 285.823)`    | `--color-neutral`                 | Dark base for hero sections and occasional accent backgrounds; creates a deep, contemplative atmosphere                                                  |
| Pitch Black  | `oklch(0% 0 0)`               | `--color-base-content` (light)    | Primary text for headings and bold statements against light backgrounds, emphasizing core information                                                    |
| Canvas White | `oklch(100% 0 0)`             | `--color-base-100` (light)        | Main page background, component backgrounds, and primary text on dark elements, maintaining brightness and spaciousness                                  |
| Ash Gray     | `oklch(90% 0 0)`              | `--color-base-200` (light)        | Subtle alternative background for secondary sections and cards, creating a slight visual separation from the main canvas                                 |
| Cool Gray    | `oklch(85% 0 0)`              | `--color-base-300` (light)        | Background for input fields and navigation elements, providing a soft contrast                                                                           |
| Midnight     | `oklch(25% 0.016 252)`        | `--color-base-100` (dark)         | Deep blue-tinged dark base for hero and dashboard surfaces in dark theme                                                                                 |
| Deep Navy    | `oklch(23% 0.014 253)`        | `--color-base-200` (dark)         | Sidebar and card surfaces on dark theme; subtle separation from primary background                                                                       |
| Abyss        | `oklch(20% 0.012 254)`        | `--color-base-300` (dark)         | Deeply recessed elements and input fields on dark theme                                                                                                  |
| Snow         | `oklch(90% 0 0)`              | `--color-base-content` (dark)     | Primary body text and deep contrast accents on dark backgrounds. Used where legibility against dark surfaces is paramount                                |
| Pitch        | `oklch(0% 0 0)`               | `--color-base-100` (midnight)     | AMOLED-true-black main background for the midnight theme                                                                                                 |
| Coal         | `oklch(10% 0 0)`              | `--color-base-200` (midnight)     | Card and panel surfaces on midnight theme; near-black with minimal lift                                                                                  |
| Charcoal     | `oklch(27% 0 0)`              | `--color-base-300` (midnight)     | Elevated and active surfaces on midnight theme                                                                                                           |
| Silver       | `oklch(87.609% 0 0)`          | `--color-base-content` (midnight) | Primary text on pitch-black surfaces in midnight theme                                                                                                   |
| Info Blue    | `oklch(55% 0.16 232.661)`     | `--color-info`                    | Informational state — banners, tooltips, neutral notifications                                                                                           |
| Sage         | `oklch(76% 0.177 163.223)`    | `--color-success`                 | Success state — saved confirmations, positive feedback                                                                                                   |
| Amber        | `oklch(82% 0.189 84.429)`     | `--color-warning`                 | Warning state — cautionary notices, attention without alarm                                                                                              |
| Ember Red    | `oklch(71% 0.194 13.428)`     | `--color-error`                   | Error state — destructive actions, validation failures                                                                                                   |

## Tokens — Typography

### Inter — All text: headings, body, navigation, buttons, labels. Configured via `@nuxt/fonts`, latin subset, preloaded. · `--font-inter`

- **Weights:** 400, 500, 600, 700
- **Sizes:** see Type Scale below
- **Preload:** true (weights 400/500/600/700)
- **Role:** Universal typeface for all text content. No other font families are configured.

### Type Scale

| Role         | Size | Line Height | Letter Spacing | Token                 |
| ------------ | ---- | ----------- | -------------- | --------------------- |
| caption      | 13px | 1.5         | -0.13px        | `--text-caption`      |
| button-label | 16px | 1           | -0.19px        | `--text-button-label` |
| subheading   | 18px | 1.2         | -0.18px        | `--text-subheading`   |
| heading      | 40px | 1.1         | -0.8px         | `--text-heading`      |
| heading-lg   | 48px | 1.1         | -0.96px        | `--text-heading-lg`   |
| display      | 54px | 1.1         | -1.08px        | `--text-display`      |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** comfortable

### Spacing Scale

| Name | Value | Token          |
| ---- | ----- | -------------- |
| 4    | 4px   | `--spacing-4`  |
| 8    | 8px   | `--spacing-8`  |
| 12   | 12px  | `--spacing-12` |
| 16   | 16px  | `--spacing-16` |
| 20   | 20px  | `--spacing-20` |
| 24   | 24px  | `--spacing-24` |
| 32   | 32px  | `--spacing-32` |
| 40   | 40px  | `--spacing-40` |
| 48   | 48px  | `--spacing-48` |
| 64   | 64px  | `--spacing-64` |
| 80   | 80px  | `--spacing-80` |

### Border Radius

DaisyUI is configured with a uniform `0.5rem` (8px) for all radii. Practical Tailwind class convention:

| Context            | Class          | Value |
| ------------------ | -------------- | ----- |
| Cards              | `rounded-xl`   | 12px  |
| Interactive blocks | `rounded-lg`   | 8px   |
| Avatars / pills    | `rounded-full` | 50%   |
| Small UI elements  | `rounded-md`   | 6px   |

### Shadows

| Name     | Value                                                          | Token               |
| -------- | -------------------------------------------------------------- | ------------------- |
| sm       | `rgba(0, 0, 0, 0.15) 0px 2px 6px 0px`                          | `--shadow-sm`       |
| subtle   | `rgb(222, 226, 222) 0px 0px 0px 1px`                           | `--shadow-subtle`   |
| subtle-2 | `rgba(0, 0, 0, 0.08) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) ...` | `--shadow-subtle-2` |
| subtle-3 | `rgba(0, 0, 0, 0.06) 0px 2px 2px 0px, rgba(0, 0, 0, 0.04) ...` | `--shadow-subtle-3` |
| sm-2     | `rgba(0, 0, 0, 0.05) 0px 1px 8px 0px`                          | `--shadow-sm-2`     |

### Layout

- **Section gap:** 32px
- **Card padding:** 16px
- **Element gap:** 8px

## Components

### Ghost Button

**Role:** Subtle interactive element

Transparent background, text color typically `Charcoal` or `Pitch Black`, no explicit border, 0px radius. Used for links within text or secondary actions.

### Subtle Nav Button

**Role:** Navigation item or secondary ghost action

Background `rgba(255, 255, 255, 0.06)`, text color `Pitch Black`, 8px border radius, 5px vertical padding and 12px horizontal padding. Offers a soft, contained interaction.

### Solid Dark Button

**Role:** Primary action within darker contexts

Background `Obsidian`, text color `Canvas White`. Border `Midnight`, 8px border radius, 7px top, 8px bottom, 16px left, 12px right padding. Used for high-emphasis CTAs.

### Outlined Action Button

**Role:** Interactive button with a defined border

Ghost background, text color `Charcoal` or `Pitch Black`, border color `Wolf Slate` or `Midnight`, 4px border radius. Offers a clear but not overly prominent action.

### Blurred Nav Item

**Role:** Navigation element with translucent background

Background `Cool Gray` with blur effect, 50.496px border radius, `Pitch Black` text. Soft shadow `rgba(0, 0, 0, 0.15) 0px 2px 6px 0px`. Used in the header, suggesting elegance and lightness.

### Elevated Content Card

**Role:** Content container with subtle elevation

Background `Ash Gray`, 12px border radius. Soft shadow `rgba(0, 0, 0, 0.08) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 4px 5px 0px`. Used for featured information blocks.

### Hero Overlay Card

**Role:** Translucent content block over imagery

Background `rgba(222, 226, 222, 0.16)`, 24px border radius, no shadow. 16px padding. Used on the hero section for minimal visual intrusion and atmospheric depth.

### Wolf Indigo Featured Card

**Role:** Prominent, brand-colored feature display

Background `Wolf Indigo`, 24px border radius. Complex shadow `rgba(0, 0, 0, 0.06) 0px 2px 2px 0px, rgba(0, 0, 0, 0) 0px 6px 6px 0px, rgba(0, 0, 0, 0.04) 0px 0px 0px 5px`. Generous padding 128px top, 80px right/bottom/left. Commands attention for key information.

### Ghost Input Field

**Role:** Standard user input field

Background `Cool Gray`, text and border `Wolf Slate`, 0px border radius. Default padding for clarity.

## Do's and Don'ts

### Do

- Use Inter for all text. Vary weight (400 for body, 500/600 for labels, 700 for headings) and size according to the Type Scale.
- Use `Obsidian` (or `Midnight` in dark theme) as a deep, rich background for hero sections or brand-defining modules, contrasting with light body text and elements.
- Layer surfaces with `Ash Gray` and `Canvas White` to provide subtle depth and structure on light-themed pages, emphasizing `Canvas White` for main backgrounds and `Ash Gray` for slightly recessed elements.
- Apply `Wolf Indigo` (`--color-primary`) sparingly as a functional accent color for key cards or active states, reserving its prominence for maximum impact.
- Reserve `Wolf Ember` and `Staryl Slate` strictly for bot identity (badges, avatar rings); never use them as general UI fill.
- Implement soft, layered shadows for card components (e.g., `rgba(0, 0, 0, 0.08) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 4px 5px 0px`) to give elements a subtle lift without feeling heavy.
- Maintain a comfortable density with an element gap of 8px and card padding of 16px, ensuring sufficient breathing room between UI elements.
- Apply the radius convention consistently: `rounded-xl` for cards, `rounded-lg` for interactive blocks, `rounded-full` for avatars and pills.

### Don't

- Avoid excessive use of `Wolf Indigo` outside of clear accent roles; it should highlight, not dominate, the UI.
- Do not introduce strong, bold colors or gradients other than the defined brand accents; the system relies on a sophisticated achromatic foundation.
- Resist using heavy, opaque backgrounds for layered elements on light pages; instead, favor subtle translucency (`rgba(222, 226, 222, 0.16)`) for a delicate, modern effect.
- Do not introduce custom font families; Inter is the only configured typeface (`@nuxt/fonts`, latin subset).
- Do not mix `rounded-*` classes arbitrarily; follow the convention: cards → `rounded-xl`, interactive blocks → `rounded-lg`, avatars/pills → `rounded-full`.
- Do not deviate from the specified shadow values; the subtle, multi-layered shadows are key to the brand's sophisticated depth without visual clutter.
- Avoid cluttering the layout; aim for comfortable spacing both vertically (32px section gap) and horizontally, letting content breathe rather than stacking elements too closely.

## Elevation

- **Nav Items:** `rgba(0, 0, 0, 0.15) 0px 2px 6px 0px`
- **Card:** `rgba(0, 0, 0, 0.08) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 4px 5px 0px`
- **Wolf Indigo Featured Card:** `rgba(0, 0, 0, 0.06) 0px 2px 2px 0px, rgba(0, 0, 0, 0) 0px 6px 6px 0px, rgba(0, 0, 0, 0.04) 0px 0px 0px 5px`
- **Input fields and subtle UI elements:** `rgba(0, 0, 0, 0.05) 0px 1px 8px 0px`

## Imagery

The visual language for imagery combines two distinct styles: a highly detailed, illustrative, dark-themed cityscape for the hero section, serving as an atmospheric backdrop, and minimalist, contained product screenshots or abstract graphics for content areas. Photography is absent. Illustrations are organic and atmospheric in the hero, while content area graphics are abstract and geometric, typically featuring outlined shapes and a subdued, near-achromatic palette. Icons are outlined, with a moderate stroke weight, and mostly monochromatic. Imagery acts as both decorative atmosphere in the hero to draw the user in and as explanatory content in product sections, with a balanced density on content-heavy pages.

## Layout

The page structure features an initial full-bleed hero section defined by a dark, illustrative cityscape background with a centered headline. Following this, the layout transitions to a contained, max-width (implied 1200px from content grouping) centered model for content sections. Sections alternate between `Canvas White` and `Ash Gray` backgrounds, establishing a clear visual rhythm. Content is arranged predominantly in a two-column text-left/image-right pattern or centered text stacks for emphasis. Feature grids may appear in three-column structures. Navigation is a compact top bar, with sticky behavior, containing minimalist text links and an `Add WolfStar` button.

## Agent Prompt Guide

Quick Color Reference:
text: `oklch(0% 0 0)` — Pitch Black
background: `oklch(100% 0 0)` — Canvas White
border: `oklch(85% 0 0)` — Cool Gray
accent: `oklch(58% 0.233 277.117)` — Wolf Indigo
primary action: `oklch(58.73% 0.0204 272.13)` — Wolf Slate (outlined action border)

Example Component Prompts:

1. Create a hero section with an `Obsidian` background (`oklch(14% 0.005 285.823)`). Headline (Inter, 54px, weight 700, `Canvas White`). Subtext (Inter, 18px, weight 400, `Canvas White`, line-height 1.2).
2. Create an `Elevated Content Card`: background `Ash Gray` (`oklch(90% 0 0)`), `rounded-xl`, box-shadow `rgba(0, 0, 0, 0.08) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 4px 5px 0px`, 16px padding. Title (Inter, 18px, weight 600, `Charcoal`), body text (Inter, 16px, weight 400, `Pitch Black`).
3. Create an `Outlined Action Button`: background transparent, border 1px solid `Wolf Slate` (`oklch(58.73% 0.0204 272.13)`), text `Pitch Black`, `rounded-lg`. Text (Inter, 16px, weight 500), 5px vertical / 12px horizontal padding.
4. Create a `Blurred Nav Item`: apply utility `nav-panel-glass`. Text (Inter, 15px, weight 400, `Pitch Black`), 8px padding.

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
- **Anthropic (Claude)** — Similar restrained aesthetic, heavy use of high-quality custom typography, and a bias towards clean, functional UI over decorative elements.
- **Stripe** — Uses a similar approach to elegant typography, crisp surfaces, and a well-defined achromatic palette with controlled accent colors for interactive elements.
- **Intercom** — Features a balanced use of white space, crisp typography, and strategic color accents to highlight key information or actions, against a generally light background.

## Quick Start

### CSS Custom Properties

```css
:root {
	/* Colors — Brand */
	--branding-wolfstar: oklch(63% 0.2502 28.13);
	--branding-staryl: oklch(58.73% 0.0204 272.13);

	/* Colors — Semantic (light theme defaults) */
	--color-primary: oklch(58% 0.233 277.117);
	--color-secondary: oklch(58.73% 0.0204 272.13);
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
	--spacing-4: 4px;
	--spacing-8: 8px;
	--spacing-12: 12px;
	--spacing-16: 16px;
	--spacing-20: 20px;
	--spacing-24: 24px;
	--spacing-32: 32px;
	--spacing-40: 40px;
	--spacing-48: 48px;
	--spacing-64: 64px;
	--spacing-80: 80px;

	/* Layout */
	--section-gap: 32px;
	--card-padding: 16px;
	--element-gap: 8px;

	/* Border Radius — DaisyUI configured (0.5rem uniform) */
	--radius-selector: 0.5rem; /* 8px — selectors */
	--radius-field: 0.5rem; /* 8px — fields    */
	--radius-box: 0.5rem; /* 8px — boxes     */

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
	--color-branding-staryl: oklch(58.73% 0.0204 272.13);

	/* Colors — Semantic */
	--color-primary: oklch(58% 0.233 277.117);
	--color-secondary: oklch(58.73% 0.0204 272.13);
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
	--spacing-4: 4px;
	--spacing-8: 8px;
	--spacing-12: 12px;
	--spacing-16: 16px;
	--spacing-20: 20px;
	--spacing-24: 24px;
	--spacing-32: 32px;
	--spacing-40: 40px;
	--spacing-48: 48px;
	--spacing-64: 64px;
	--spacing-80: 80px;

	/* Border Radius — DaisyUI configured (0.5rem uniform) */
	--radius-selector: 0.5rem;
	--radius-field: 0.5rem;
	--radius-box: 0.5rem;

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
