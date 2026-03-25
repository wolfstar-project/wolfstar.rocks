---
tag: "evlog@2.0.0"
version: 2.0.0
published: 2026-02-26
---

# evlog@2.0.0



## What's Changed

###  Breaking Change: PostHog adapter now uses PostHog Logs (OTLP) by default

> This only affects you if you use `evlog/posthog`. For all other adapters, this release is fully backward-compatible.

`createPostHogDrain()` now sends logs to PostHog Logs via OTLP instead of sending custom events via the `/batch/` API. This is significantly cheaper and provides a dedicated log viewer in PostHog.

**If you were using `createPostHogDrain()`:**
- Your logs will now appear in **PostHog Logs** instead of **Events**
- The `eventName` and `distinctId` options are no longer available on `createPostHogDrain()`
- If you need the old custom events behavior, switch to `createPostHogEventsDrain()` from `evlog/posthog`

**If you were using `createPostHogLogsDrain()`:**
- This function has been removed — `createPostHogDrain()` now does the same thing

**Migration:**

```
- import { createPostHogDrain } from 'evlog/posthog'
+ import { createPostHogEventsDrain } from 'evlog/posthog'
```

```
- createPostHogDrain({ eventName: 'server_request', distinctId: 'my-service' })
+ createPostHogEventsDrain({ eventName: 'server_request', distinctId: 'my-service' })
```

### Features 
* feat(evlog): add edgeUrl ingest support by @gabrielelpidio in https://github.com/HugoRCD/evlog/pull/110
### Bug Fixes 
* fix(docs): remove light mode by @HugoRCD in https://github.com/HugoRCD/evlog/pull/113
### Dependency Updates 
* chore(deps): update dependency next to v16 by @renovate[bot] in https://github.com/HugoRCD/evlog/pull/104
* chore(deps): update dependency zod to v4 by @renovate[bot] in https://github.com/HugoRCD/evlog/pull/106
* chore(deps): update dependency react to v19 by @renovate[bot] in https://github.com/HugoRCD/evlog/pull/105
* chore(deps): update all non-major dependencies by @renovate[bot] in https://github.com/HugoRCD/evlog/pull/103
* chore(deps): update all non-major dependencies by @renovate[bot] in https://github.com/HugoRCD/evlog/pull/107

## New Contributors
* @gabrielelpidio made their first contribution in https://github.com/HugoRCD/evlog/pull/110

**Full Changelog**: https://github.com/HugoRCD/evlog/compare/evlog@1.11.0...evlog@2.0.0