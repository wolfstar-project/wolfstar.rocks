---
name: vueuse-nuxt-skilld
description: "ALWAYS use when writing code importing \"@vueuse/nuxt\". Consult for debugging, best practices, or modifying @vueuse/nuxt, vueuse/nuxt, vueuse nuxt, vueuse."
metadata:
  version: 14.3.0
  generated_by: Anthropic · Haiku 4.5
  generated_at: 2026-07-16
---

# vueuse/vueuse `@vueuse/nuxt@14.3.0`
**Tags:** alpha: 14.0.0-alpha.3, beta: 14.0.0-beta.1, latest: 14.3.0

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `pnpm exec skilld search "query" -p @vueuse/nuxt` instead of grepping `.skilld/` directories. Run `pnpm exec skilld search --guide -p @vueuse/nuxt` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

### Breaking Changes in v14.0.0

- BREAKING: **nuxt** module requires Nuxt v4 kit — v14.0.0 upgraded from Nuxt v3 kit. If you're using Nuxt v3, stay on v13.x. Nuxt v4 has significant architectural changes that are incompatible with v3. [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- BREAKING: `computedAsync()` now defaults to `flush: sync` instead of `flush: post`. This changes when computed updates flush and may affect timing of dependent watchers. Review code relying on post-flush behavior. [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- BREAKING: `useThrottleFn()` now aligns with traditional throttle behavior — leading and trailing edges may behave differently from v13. Test throttled functions with your expected call patterns. [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- BREAKING: `createSharedComposable()` now returns only the shared composable on the client side, not a ref wrapper. SSR behavior changed; SSR no longer returns a wrapped value. [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- BREAKING: `useClipboard()` now uses `readonly()` for its return type instead of type assertion. If you were casting the result, remove the cast. [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- BREAKING: `useSwipe()` removed `isPassiveEventSupported` utility. Use native `PointerEvent` feature detection instead. [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- BREAKING: Alias exports deprecated in favor of original function names — e.g., `useAsync` → `useAsyncState`. Update imports to use canonical names. [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- BREAKING: Requires Vue 3.5 or later. Earlier Vue 3.x versions are no longer supported. [source](./.skilld/releases/v14.0.0.md#breaking-changes)

### New APIs

- NEW: `refManualReset()` — new composable for creating refs that can be manually reset to their initial value. Complements `ref()` with reset control. [source](./.skilld/releases/v14.0.0.md#features)

- NEW: `useCssSupports()` — detect CSS feature support at runtime with reactive result. Introduced in v14.2.0. [source](./.skilld/releases/v14.2.0.md#features)

- NEW: Nuxt composable variants available via auto-imports — v14.3.0 added composable variants to the Nuxt auto-import configuration. [source](./.skilld/releases/v14.3.0.md#features)

- NEW: `useTextareaAutosize()` accepts optional `maxHeight` parameter to limit autosize growth, introduced v14.3.0. [source](./.skilld/releases/v14.3.0.md#features)

### Deprecated APIs (Still Functional)

- DEPRECATED: `computedEager()` — deprecated in v14.0.0. Use `computed()` with `flush: 'sync'` instead for eager evaluation. [source](./.skilld/releases/v14.0.0.md#features)

- DEPRECATED: `watchPausable()` — deprecated in v14.0.0. Use `watch()` with `pause()` and `resume()` methods from the return value. [source](./.skilld/releases/v14.0.0.md#features)

- DEPRECATED: Embedded `ResizeObserverSize` type — types should be imported from `ResizeObserver` API directly. [source](./.skilld/releases/v14.1.0.md#bug-fixes)

### Enhanced APIs

- ENHANCED: `useElementVisibility()` now accepts `initialValue` (v14.1.0) and `controls` option (v14.3.0) for better initialization and intersection observer control. [source](./.skilld/releases/v14.1.0.md#features)

- ENHANCED: `useWebSocket()` `autoConnect.delay` now accepts a function for dynamic delay computation, introduced v14.1.0. [source](./.skilld/releases/v14.1.0.md#features)

- ENHANCED: `useIntersectionObserver()` now supports reactive `rootMargin`, enabling dynamic observer reconfiguration (v14.2.0). [source](./.skilld/releases/v14.2.0.md#features)

- ENHANCED: Configurable scheduler support added for timed composables in v14.2.0 — allows custom scheduling behavior. [source](./.skilld/releases/v14.2.0.md#features)

**Also changed:** Pointer event `onLongPress` exposure (v14.3.0) · `createInjectionState` non-undefined return with defaults (v14.3.0) · `createReusableTemplate` component name specification (v14.3.0) · `useMouseInElement` inline-element support (v14.1.0) · `useTimeAgoIntl` custom units (v14.1.0) · Vue Router 5 peer dep support (v14.2.0)
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Avoid auto-importing conflicting utils explicitly when needed — `toRef`, `toRefs`, `toValue`, `useFetch`, `useCookie`, `useHead`, `useTitle`, `useStorage`, and `useImage` are disabled from auto-import to prevent conflicts with Nuxt equivalents. Import them explicitly from `@vueuse/core` if required [source](./.skilld/pkg/README.md#caveats)

- Enable `ssrHandlers` in module config for SSR-safe composables (experimental) — wraps timed/DOM-dependent composables with SSR guards to prevent hydration mismatches [source](./.skilld/pkg/dist/index.d.ts:L10-L13)

- Prefer `useCurrentElement()` for the component root element without template changes — automatically accesses the root DOM element via Vue's internal `$el` without needing a `ref` attribute, simplifying composition [source](./.skilld/discussions/discussion-5372.md:L22-L35)

- Use `useElementSize()` over `useResizeObserver()` for simple reactive width/height tracking — higher-level abstraction that handles resize observation and includes initial size setup and SVG element handling automatically [source](./.skilld/discussions/discussion-4268.md:L24-L28)

- Set `initialValue` on `useElementVisibility()` to avoid undefined visibility on mount — provide a default visibility state before intersection observer initializes to prevent reactive template issues [source](./.skilld/releases/v14.1.0.md:L12)

- Make `rootMargin` reactive on `useIntersectionObserver()` to adjust visibility thresholds dynamically — pass reactive values to enable responsive threshold updates without recreating the observer [source](./.skilld/releases/v14.2.0.md:L16)

- Use custom serializers in `useStorageAsync()` for native storage backends — avoid double-serialization when the storage API (like `chrome.storage`) already handles objects by implementing pass-through serializers [source](./.skilld/discussions/discussion-5074.md:L24-L36)

- Apply `toReactive()` only to objects, not arrays — the function creates a proxy with an object target and will produce `{}` instead of `[]` for array refs, breaking array methods [source](./.skilld/discussions/discussion-4825.md:L44-L50)

- Specify a scheduler option in `useTimeAgoIntl()` and similar timed composables for explicit timing control — use configurable schedulers like `requestIdleCallback` or `setTimeout` for fine-grained performance tuning instead of relying on defaults [source](./.skilld/releases/v14.2.0.md:L11)

- Use composable variants from Nuxt auto-imports for better tree-shaking and type inference — v14.3.0 exposes composable variants alongside direct function exports to enable selective importing [source](./.skilld/releases/v14.3.0.md:L14)

- Enable `watchElement` option on `useSortable()` to auto-reinitialize when the target element changes — prevents stale event listeners when the DOM target is dynamically created or replaced [source](./.skilld/releases/v14.2.0.md:L17)

- Configure `useDraggable()` with `containment` and `boundary` options for auto-scroll — use restricted dragging within a container with automatic scroll behavior to keep dragged elements visible [source](./.skilld/releases/v14.2.0.md:L14)

- Test `useWebSocket()` for race conditions between `onopen` and `onclose` events — ensure event handlers do not create stale state when rapid connect/disconnect cycles occur or multiple pending messages stack [source](./.skilld/releases/v14.3.0.md:L34)

- Wrap mutable object defaults with `reactive()` when using `refManualReset()` — `customRef` only tracks property assignment via `set()`, not deep mutations, so nested object changes require explicit wrapping [source](./.skilld/issues/issue-5200.md:L18-L31)
<!-- /skilld:best-practices -->

Related: vueuse-core-skilld
