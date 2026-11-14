# Design token discipline

Read before writing component styles or theme CSS.

All styling must use semantic tokens or CSS custom properties — no hardcoded color literals.

## Guardrail

`test/unit/design-tokens/no-hardcoded-colors.test.ts` enforces this on every `app/components/**/*.vue`, `app/pages/**/*.vue`, and `app/layouts/**/*.vue` file.

It checks:

1. **Raw Tailwind palette classes** in `<template>` — e.g. `text-red-500`, `bg-blue-700`. Use semantic Nuxt UI classes (`text-primary`, `text-muted`, `bg-success`) instead.
2. **Hex literals** in `<style>` — e.g. `#5865f2`. Move to a scoped CSS custom property declaration.
3. **Color functions with literal arguments** in `<style>` — e.g. `hsla(235, 85.6%, 64.7%, 0.5)`. Move to a scoped CSS custom property. Allowed patterns:
    - `oklch(from var(--token) l c h / alpha)` — relative-color syntax
    - `oklch(var(--token) / alpha)` — CSS variable inside the call
    - `oklch(20% 0 H / alpha)` — zero-chroma neutrals (achromatic grays)

## Allow-list

Files added to `ALLOW_LIST` in the test are permanently exempt. Current exemptions:

- `app/components/OgImage/Page.takumi.vue` — Satori does not support `var()` references
- `app/components/discord/*.vue` (message, embed, mention, role, reaction, scrollbar, the `chat-input-command/` autocomplete family, and the `app-launcher/` family) — Discord brand fidelity requires Discord brand colors; see `ALLOW_LIST` in the test for the exact, growing file list

## Theme Selectors

`@nuxtjs/color-mode` applies `data-theme` (and the matching class) from an inline script, so with JavaScript disabled the html element carries no theme at all. Theme-conditional CSS must therefore go through the `theme-light`/`theme-dark` custom variants declared in `app/assets/css/main.css` — `@variant theme-dark { … }`, never a bare `[data-theme="dark"] & { … }` — because those variants also resolve the attribute-less state from `prefers-color-scheme`. Tailwind's own `dark:` variant is redefined alongside them and must stay identical to `theme-dark`.

Only one DaisyUI theme may declare `default: true` (`light`): two defaults both emit `:where(:root)`, so the last one silently wins wherever no `data-theme` is set. `dark` stays reachable through `prefersdark: true`. `test/unit/design-tokens/theme-fallback.test.ts` enforces all of the above.

## Token Reference

Prefer these semantic classes before reaching for palette colors:

| Purpose              | Class                                                  |
| -------------------- | ------------------------------------------------------ |
| Primary brand        | `text-primary`, `bg-primary`, `border-primary`         |
| Muted / subdued text | `text-muted`                                           |
| Success indicator    | `bg-success`, `text-success`                           |
| Error state          | `text-error`, `border-error`                           |
| Gradient hero text   | `gradient-text-hero`, `gradient-text-cool`             |
| Card surfaces        | `card-glass`, `card-glass-soft`, `card-glass-bordered` |
