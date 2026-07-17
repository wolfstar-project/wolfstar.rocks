---
name: vueuse-integrations-skilld
description: "ALWAYS use when writing code importing \"@vueuse/integrations\". Consult for debugging, best practices, or modifying @vueuse/integrations, vueuse/integrations, vueuse integrations, vueuse."
metadata:
  version: 14.3.0
  generated_by: Anthropic · Haiku 4.5
  generated_at: 2026-07-16
---

# vueuse/vueuse `@vueuse/integrations@14.3.0`
**Tags:** next: 5.0.0, alpha: 14.0.0-alpha.3, beta: 14.0.0-beta.1

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p @vueuse/integrations` instead of grepping `.skilld/` directories. Run `skilld search --guide -p @vueuse/integrations` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

### Breaking Changes & Deprecations (v14.x)

- BREAKING: Alias exports deprecated in favor of original function names — v14.0.0 deprecated aliases for all composables; update imports to use direct names [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- BREAKING: `computedAsync` default changed to `flush: sync` — v14.0.0 changed behavior from `flush: post`; verify timing-dependent code [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- BREAKING: `createSharedComposable` now returns only the sharedComposable on client side — v14.0.0 changed return value for SSR patterns [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- BREAKING: `useThrottleFn` now aligns with traditional throttle behavior — v14.0.0 changed behavior to match standard throttle semantics; check if debouncing/leading/trailing callbacks changed [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- BREAKING: Vue 3.5 now required — v14.0.0 requires Vue 3.5+; upgrade Vue if using v13.x [source](./.skilld/releases/v14.0.0.md#breaking-changes)

### New APIs & Exports (v14.x)

- NEW: `refManualReset()` — new in v14.0.0, allows manual control of ref reset behavior [source](./.skilld/releases/v14.0.0.md#features)

- NEW: `useCssSupports()` — new in v14.2.0, checks CSS feature support reactively [source](./.skilld/releases/v14.2.0.md#features)

- NEW: `useElementVisibility` `controls` option — v14.3.0 adds native controls support [source](./.skilld/releases/v14.3.0.md#features)

- NEW: `useElementVisibility` `initialValue` option — v14.1.0 adds explicit initial value control [source](./.skilld/releases/v14.1.0.md#features)

### Enhanced Composable Options (v14.x)

- `useDropZone` `checkValidity` function — v14.1.0 adds validation support [source](./.skilld/releases/v14.1.0.md#features)

- `useIntersectionObserver` `rootMargin` now reactive — v14.2.0 changed from static to reactive; updates to the option trigger observer reinitialization [source](./.skilld/releases/v14.2.0.md#features)

- `useMouseInElement` inline-level element support — v14.1.0 adds tracking for inline elements like `<span>` [source](./.skilld/releases/v14.1.0.md#features)

- `useSortable` `watchElement` option — v14.2.0 adds auto-reinitialize on element change [source](./.skilld/releases/v14.2.0.md#features)

- `useTextareaAutosize` `maxHeight` option — v14.3.0 adds max-height limit to autosize [source](./.skilld/releases/v14.3.0.md#features)

- `useTimeAgoIntl` custom units — v14.1.0 allows custom time unit configuration [source](./.skilld/releases/v14.1.0.md#features)

- `useWebSocket` `autoConnect.delay` supports function — v14.1.0 allows delay as callback function [source](./.skilld/releases/v14.1.0.md#features)

- `onLongPress` pointer event exposed — v14.3.0 exposes pointer event from long press [source](./.skilld/releases/v14.3.0.md#features)

### Type & Behavior Fixes (v14.x)

- `createInjectionState` returns non-undefined when default specified — v14.3.0 guarantees non-undefined return with default value [source](./.skilld/releases/v14.3.0.md#features)

- `createReusableTemplate` component name specification — v14.3.0 adds support for custom component names [source](./.skilld/releases/v14.3.0.md#features)

- `onClickOutside` `detectIframe` option for shadow DOM — v14.3.0 adds iframe detection inside shadow DOM [source](./.skilld/releases/v14.3.0.md#bug-fixes)

- `useDraggable` auto-scroll feature — v14.2.0 adds automatic scrolling for restricted drag within containers [source](./.skilld/releases/v14.2.0.md#features)

- `useAsyncQueue` onFinished trigger — v14.1.0 now triggers onFinished when last task is rejected [source](./.skilld/releases/v14.1.0.md#bug-fixes)

- `useAsyncState` execute return type — v14.2.0 ensures execute returns actual data [source](./.skilld/releases/v14.2.0.md#bug-fixes)

- `useCached` comparator type — v14.3.0 updates comparator type and improves documentation [source](./.skilld/releases/v14.3.0.md#bug-fixes)

- `useClipboard` Safari async fix — v14.3.0 prevents fail in Safari for async operations [source](./.skilld/releases/v14.3.0.md#bug-fixes)

- `useVirtualList` mutable array reactivity — v14.3.0 properly reacts to mutable array changes [source](./.skilld/releases/v14.3.0.md#bug-fixes)

- `useWakeLock` auto-release on unmount — v14.3.0 automatically releases wake lock on component unmount [source](./.skilld/releases/v14.3.0.md#bug-fixes)

### Dependency & Infrastructure Changes

- `firebase` upgraded to v12 — v14.0.0 updates Firebase dependency; review Firebase API changes if used [source](./.skilld/releases/v14.0.0.md#breaking-changes)

- `useFocusTrap` dependency range updated to `^7 || ^8` — v14.2.0 allows focus-trap v8 [source](./.skilld/releases/v14.2.0.md#bug-fixes)

- Nuxt integration uses Nuxt v4 kit — v14.0.0 requires Nuxt v4 for Nuxt integration [source](./.skilld/releases/v14.0.0.md#breaking-changes)

**Also changed:** `computedEager` deprecated · `useArrayReduceReturn` export added · `watchPausable` deprecated · `useAsyncValidator` optional response handling · `useTransition` custom interpolator support · `useFocusWithin` doc typos · `useManualRefHistory` doc typos · `useStorageAsync` doc typos · `useIntersectionObserver` doc typos · `watchAtMost` pause/resume · `watchDebounced` return type · `watchThrottled` return type · `useMagicKeys` undefined key handling · `useScroll` configurable window getComputedStyle · `useSpeechRecognition` error handling · `useTimeout` type typo fix · `useShare` accuracy improvement · `useUrlSearchParams` history behavior · `useUserMedia` deep watch for constraints · `useMagicKeys` alt key clearing · `useFullscreen` return types · `useInfiniteScroll` promise handling
<!-- /skilld:api-changes -->

Related: vueuse-core-skilld
