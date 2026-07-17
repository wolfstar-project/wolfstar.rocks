---
name: nuxt-ui-skilld
description: "ALWAYS use when writing code importing \"@nuxt/ui\". Consult for debugging, best practices, or modifying @nuxt/ui, nuxt/ui, nuxt ui, ui."
metadata:
  version: 4.9.0
  generated_by: Anthropic · Haiku 4.5
  generated_at: 2026-07-16
---

# nuxt/ui `@nuxt/ui@4.9.0`
**Tags:** alpha: 4.0.0-alpha.2, beta: 4.0.0-beta.0, false: 3.3.7

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `pnpm exec skilld search "query" -p @nuxt/ui` instead of grepping `.skilld/` directories. Run `pnpm exec skilld search --guide -p @nuxt/ui` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes in @nuxt/ui v4 — prioritize recent major/minor releases for breaking changes and renamed/new APIs.

- BREAKING: `Table` @select event — v4.1.0 reversed argument order from `(row, event)` to `(event, row)` [source](./.skilld/releases/v4.1.0.md#rotating_light-breaking-changes)

- BREAKING: `CommandPalette` icon prop — v4.1.0 renamed `trailing-icon` to `children-icon` for child items, and `trailing-icon` is now used for the Input [source](./.skilld/releases/v4.1.0.md#rotating_light-breaking-changes)

- BREAKING: Exposed refs normalization — v4.2.0 changed `InputMenu`, `InputNumber`, `InputTags`, `Select`, and `SelectMenu` to expose HTML elements directly instead of component instances [source](./.skilld/releases/v4.2.0.md#rotating_light-breaking-changes)

- BREAKING: Composables import path — v4.2.0 removed required `.js` extension; import from `'@nuxt/ui/composables/useToast'` or `'@nuxt/ui/composables'` instead of `.js` variant [source](./.skilld/releases/v4.2.0.md#rotating_light-breaking-changes)

- BREAKING: Vite theme templates — v4.2.0 writes real theme files; update `tsconfig.node.json` alias from `./node_modules/@nuxt/ui/.nuxt/ui` to `./node_modules/.nuxt-ui/ui` [source](./.skilld/releases/v4.2.0.md#rotating_light-breaking-changes)

- BREAKING: Module dependencies API — v4.6.0 uses `moduleDependencies` to manage sub-module dependencies; requires Nuxt >= 4.1.0 [source](./.skilld/releases/v4.6.0.md#rotating_light-breaking-changes)

- NEW: `Empty` component — v4.1.0 displays empty states; available at `UEmpty` [source](./.skilld/releases/v4.1.0.md#sparkles-highlights)

- NEW: `virtualize` prop — v4.1.0 enables TanStack Virtual for large datasets on `CommandPalette`, `InputMenu`, `SelectMenu`, `Table`, and `Tree` [source](./.skilld/releases/v4.1.0.md#sparkles-highlights)

- NEW: `experimental.componentDetection` — v4.1.0 auto-detects used components and generates only necessary CSS; enable via `ui.experimental.componentDetection` [source](./.skilld/releases/v4.1.0.md#sparkles-highlights)

- NEW: `InputDate` component — v4.2.0 for date inputs with `CalendarDate` values [source](./.skilld/releases/v4.2.0.md#sparkles-highlights)

- NEW: `InputTime` component — v4.2.0 for time inputs with `Time` values [source](./.skilld/releases/v4.2.0.md#sparkles-highlights)

- NEW: Tailwind CSS prefix — v4.2.0 `ui.theme.prefix` option prefixes all utilities; configure in `nuxt.config.ts` and import with `@import "@nuxt/ui" prefix(tw)` [source](./.skilld/releases/v4.2.0.md#sparkles-highlights)

- NEW: `Editor` component suite — v4.3.0 includes `Editor`, `EditorToolbar`, `EditorSuggestionMenu`, `EditorMentionMenu`, `EditorEmojiMenu`, and `EditorDragHandle` powered by TipTap [source](./.skilld/releases/v4.3.0.md#sparkles-highlights)

- NEW: `ScrollArea` component — v4.3.0 flexible scroll container with TanStack Virtual virtualization [source](./.skilld/releases/v4.3.0.md#sparkles-highlights)

- NEW: `Theme` component — v4.5.0 wraps children to override component themes via `ui` prop; uses `provide`/`inject`, does not render HTML [source](./.skilld/releases/v4.5.0.md#sparkles-highlights)

- NEW: Neutral color options — v4.5.0 adds `taupe`, `mauve`, `mist`, `olive` available via `ui.neutral` config [source](./.skilld/releases/v4.5.0.md#sparkles-highlights)

- NEW: `Sidebar` component — v4.6.0 responsive fixed sidebar transforming to Modal/Slideover/Drawer on mobile with three variants (`sidebar`, `floating`, `inset`) and three collapsible modes (`offcanvas`, `icon`, `none`) [source](./.skilld/releases/v4.6.0.md#sparkles-highlights)

- NEW: `ChatReasoning` component — v4.6.0 collapsible thinking block with streaming duration tracking [source](./.skilld/releases/v4.6.0.md#sparkles-highlights)

- NEW: `ChatTool` component — v4.6.0 collapsible tool invocation row with loading and streaming states [source](./.skilld/releases/v4.6.0.md#sparkles-highlights)

**Also changed:** `ChatShimmer` new v4.6 · `useTemplateRef()` new stable v4 · `data-slot` attributes new v4.2 · `by` prop new v4.4 · `valueKey` prop new v4.4 · Editor `placeholder.mode` new v4.4 · Editor `taskList` handler new v4.4 · EditorMentionMenu `ignoreFilter` async search v4.4 · Table row pinning new v4.6 · Toaster duplicate prevention v4.5 · Calendar `weekNumbers` prop v4.4 · Calendar `variant` prop v4.1 · `formField` orientation prop v4.3 · Checkbox/Switch `trueValue`/`falseValue` props v4.6 · InputTime `range` prop v4.6 · DropdownMenu `filter` prop v4.6
<!-- /skilld:api-changes -->

Related: nuxt-fonts-skilld, vueuse-core-skilld, vueuse-integrations-skilld, consola-skilld, defu-skilld
