---
name: vueuse-router-skilld
description: "ALWAYS use when writing code importing \"@vueuse/router\". Consult for debugging, best practices, or modifying @vueuse/router, vueuse/router, vueuse router, vueuse."
metadata:
  version: 14.3.0
  generated_by: Anthropic · Haiku 4.5
  generated_at: 2026-07-16
---

# vueuse/vueuse `@vueuse/router@14.3.0`
**Tags:** next: 5.0.0, alpha: 14.0.0-alpha.3, beta: 14.0.0-beta.1

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `pnpm exec skilld search "query" -p @vueuse/router` instead of grepping `.skilld/` directories. Run `pnpm exec skilld search --guide -p @vueuse/router` for full syntax, filters, and operators.

<!-- skilld:best-practices -->
## Best Practices for @vueuse/router v14.3.0

## Reactive Route State Binding

- Use `useRouteParams`, `useRouteQuery`, and `useRouteHash` as two-way bindings to route state — changes to the returned ref automatically update the router, and route changes update the ref [source](./.skilld/pkg/dist/index.d.ts:L42:50)

- Provide explicit generic type parameters for type-safe param/query binding — e.g. `useRouteParams<number>('id')` ensures the param is coerced and typed as a number [source](./.skilld/pkg/dist/index.d.ts:L44:44)

- Use default values via the second parameter to provide fallback values when the param/query/hash is missing from the URL [source](./.skilld/pkg/dist/index.d.ts:L36:44)

- Pass `transform` option with `get` and `set` functions to handle type coercion and custom serialization — use `set` to transform user edits before sending to the router [source](./.skilld/issues/issue-3536.md:L65:73)

## Router Update Modes

- Use `mode: 'replace'` (default) for programmatic or filtered state updates where URL history should not accumulate — use `mode: 'push'` for explicit user actions to preserve browser back/forward [source](./.skilld/pkg/dist/index.d.ts:L10:14)

- Make the update mode reactive via `MaybeRef` to switch between `'push'` and `'replace'` based on context — useful for conditional history handling [source](./.skilld/pkg/dist/index.d.ts:L14:14)

## Type Safety and Generics

- Leverage overloaded signatures for untyped and typed usage — call without generics for `string | null | string[]`, or provide `useRouteParams<T>(name, default?, options)` for precise typing [source](./.skilld/pkg/dist/index.d.ts:L43:44)

- Combine generics with transform to coerce route strings to application types — e.g. `useRouteQuery<string, boolean>('enabled', false, { transform: { get: v => v === 'true', set: v => v ? 'true' : 'false' } })` [source](./.skilld/pkg/dist/index.d.ts:L24:32)

## Optional Parameter Removal

- For optional parameters, use an empty string in the transform's `set` function to remove the param from the URL — returning empty string signals the router to omit the param [source](./.skilld/issues/issue-3536.md:L65:73)

- Set default values equal to the removal sentinel (e.g. `defaultValue = 'defaultValue'`, `set: v => v === defaultValue ? '' : v`) to distinguish user-set values from defaults [source](./.skilld/issues/issue-3536.md:L65:73)

## Composable Integration Patterns

- Provide explicit `route` and `router` instances via options only when testing or in advanced setups; otherwise omit to use the auto-injected `useRoute()` and `useRouter()` [source](./.skilld/pkg/dist/index.d.ts:L17:22)

- Call these composables inside component `<script setup>` or nested composables within component lifecycle — do not create reactive bindings at module scope [source](./.skilld/pkg/dist/index.d.ts:L36:48)

## Query Parameter Arrays

- Query params can be arrays via `string[]` in the type union — VueRouter automatically handles multiple query values as an array (e.g. `?tag=a&tag=b` → `['a', 'b']`) [source](./.skilld/pkg/dist/index.d.ts:L6:6)

- When setting an array query param, assign an array directly to the ref — the router normalizes it to repeated query key-value pairs in the URL [source](./.skilld/pkg/dist/index.d.ts:L47:48)

## Transform Function Best Practices

- Keep transform functions pure and side-effect free — they are called during reactivity updates and should not trigger external state changes [source](./.skilld/pkg/dist/index.d.ts:L29:32)

- Use separate `get` and `set` transformers for asymmetric coercion — `get` converts URL strings to app types, `set` serializes app values back to URL strings [source](./.skilld/pkg/dist/index.d.ts:L24:32)
<!-- /skilld:best-practices -->
