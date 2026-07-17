---
name: vueuse-core-skilld
description: "ALWAYS use when writing code importing \"@vueuse/core\". Consult for debugging, best practices, or modifying @vueuse/core, vueuse/core, vueuse core, vueuse."
metadata:
  version: 14.3.0
  generated_by: Anthropic · Haiku 4.5
  generated_at: 2026-07-16
---

# vueuse/vueuse `@vueuse/core@14.3.0`
**Tags:** vue2: 2.0.35, vue3: 3.0.35, demi: 4.0.0-alpha.0

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p @vueuse/core` instead of grepping `.skilld/` directories. Run `skilld search --guide -p @vueuse/core` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes for @vueuse/core v14.3.0 — prioritizing recent major/minor releases.

### Breaking Changes and Deprecations

- BREAKING: Alias exports deprecated in favor of original function names — `asyncComputed` is now an alias for `computedAsync`, migrate all code to use `computedAsync` instead [source](./.skilld/releases/v14.0.0.md:L11:12)

- BREAKING: `computedAsync()` — default changed to `flush: sync` in v14.0.0, previously defaulted to `flush: post` [source](./.skilld/releases/v14.0.0.md:L15)

- BREAKING: `useThrottleFn()` — behavior aligned with traditional throttle semantics in v14.0.0, may cause silent behavioral changes in existing code [source](./.skilld/releases/v14.0.0.md:L22)

- BREAKING: `createSharedComposable()` — now returns only the sharedComposable on client side in v14.0.0, breaking usage patterns expecting server-side behavior [source](./.skilld/releases/v14.0.0.md:L16)

- BREAKING: Vue 3.5 or later required — v14.0.0 requires minimum Vue 3.5, cannot be used with older Vue versions [source](./.skilld/releases/v14.0.0.md:L13)

- DEPRECATED: `computedEager()` — deprecated in favor of Vue 3.5+ native `computed()` in v14.0.0 [source](./.skilld/releases/v14.0.0.md:L26)

- DEPRECATED: `watchPausable()` — deprecated in favor of `watchAtMost()` in v14.0.0, use `watchAtMost()` with pause/resume capabilities instead [source](./.skilld/releases/v14.0.0.md:L36)

- DEPRECATED: Embedded `ResizeObserverSize` type — type deprecation in v14.1.0, use native ResizeObserver types [source](./.skilld/releases/v14.1.0.md:L22)

### New APIs and Features

- NEW: `useCssSupports()` — detect CSS feature support at runtime in v14.2.0 [source](./.skilld/releases/v14.2.0.md:L13)

- NEW: `refManualReset()` — new in v14.0.0, provides manual control over ref reset operations [source](./.skilld/releases/v14.0.0.md:L29)

### Enhanced Existing APIs

- `useElementVisibility()` — v14.3.0 adds `controls` option to influence visibility detection [source](./.skilld/releases/v14.3.0.md:L15)

- `useElementVisibility()` — v14.2.0 inherits `rootMargin` from `useIntersectionObserver` for consistent observer configuration [source](./.skilld/releases/v14.2.0.md:L15)

- `useElementVisibility()` — v14.1.0 adds `initialValue` option to set starting visibility state [source](./.skilld/releases/v14.1.0.md:L12)

- `useIntersectionObserver()` — `rootMargin` is now reactive in v14.2.0, responds to dynamic changes [source](./.skilld/releases/v14.2.0.md:L16)

- `useDraggable()` — v14.2.0 adds auto-scroll with restricted dragging within container support [source](./.skilld/releases/v14.2.0.md:L14)

- `useSortable()` — v14.2.0 adds `watchElement` option for auto-reinitialize on element change [source](./.skilld/releases/v14.2.0.md:L17)

- `useTextareaAutosize()` — v14.3.0 adds optional `maxHeight` option to limit autosize growth [source](./.skilld/releases/v14.3.0.md:L16)

- `useMouseInElement()` — v14.1.0 adds support for tracking inline-level elements [source](./.skilld/releases/v14.1.0.md:L13)

- `useTimeAgoIntl()` — v14.1.0 supports custom units for time formatting [source](./.skilld/releases/v14.1.0.md:L14)

- `useDropZone()` — v14.1.0 adds `checkValidity()` function for validation [source](./.skilld/releases/v14.1.0.md:L11)

- `useWebSocket()` — v14.1.0 `autoConnect.delay` now supports function callback [source](./.skilld/releases/v14.1.0.md:L15)

- `onClickOutside()` — v14.0.0 allows target value to be a getter function [source](./.skilld/releases/v14.0.0.md:L27)

- `onLongPress()` — v14.0.0 allows delay to be a function for dynamic configuration [source](./.skilld/releases/v14.0.0.md:L28)

- `useTransition()` — v14.0.0 adds support for custom interpolator functions [source](./.skilld/releases/v14.0.0.md:L33)

- `useClipboard()` — v14.0.0 uses `readonly()` instead of type assertion for Computed return [source](./.skilld/releases/v14.0.0.md:L20)

### Behavior Changes with Silent Breakage Risk

- `useAsyncState()` — v14.2.0 `execute()` now returns the actual data (previously inconsistent) — verify calling code expects resolved value [source](./.skilld/releases/v14.2.0.md:L23)

- `useCssSupports()` — v14.3.0 always returns `ssrValue` before mounted, ensuring consistent SSR behavior [source](./.skilld/releases/v14.3.0.md:L21)

- `useWakeLock()` — v14.3.0 auto-releases on component unmount, previously required manual cleanup [source](./.skilld/releases/v14.3.0.md:L33)

- `useWebSocket()` — v14.3.0 fixes race condition in onopen/onclose event handling [source](./.skilld/releases/v14.3.0.md:L34)

- `useVirtualList()` — v14.3.0 now reacts to changes in mutable arrays properly [source](./.skilld/releases/v14.3.0.md:L32)

### Minor Enhancements

- Timed composables (e.g., `useInterval`, `useTimeout`) support configurable scheduler in v14.2.0 [source](./.skilld/releases/v14.2.0.md:L11)

- `onClickOutside()` — v14.3.0 detects iframe inside shadow DOM with `detectIframe` option [source](./.skilld/releases/v14.3.0.md:L26)

- `createReusableTemplate()` — v14.3.0 supports specifying component names for devtools [source](./.skilld/releases/v14.3.0.md:L13)

- `createInjectionState()` — v14.3.0 returns non-undefined value when default is specified [source](./.skilld/releases/v14.3.0.md:L12)

**Also changed:** Nuxt auto-imports composable variants v14.3.0 · `onLongPress` pointer event exposure v14.3.0 · Vue Router 5 peer dependency support v14.2.0 · `useMagicKeys` empty key event handling v14.1.0 · `useInfiniteScroll` `canLoadMore` reactivity v14.1.0 · Type improvements for watch functions v14.0.0 · `watchAtMost` pause/resume capabilities v14.0.0 · `useSwipe` removed `isPassiveEventSupported` check v14.0.0
<!-- /skilld:api-changes -->
