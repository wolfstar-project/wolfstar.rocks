---
tag: "evlog@2.8.0"
version: 2.8.0
published: 2026-03-15
---

# evlog@2.8.0



## What's Changed
### Features 
* feat: add `ai-sdk` support by @HugoRCD in https://github.com/HugoRCD/evlog/pull/196
* feat: add vite plugin by @HugoRCD in https://github.com/HugoRCD/evlog/pull/189
* feat: add bundle size comparison on PRs by @HugoRCD in https://github.com/HugoRCD/evlog/pull/183
### Bug Fixes 
* fix(core): support nitro v3 runtime config resolution by @HugoRCD in https://github.com/HugoRCD/evlog/pull/193
* fix(core): add retry with backoff and clear timeout errors by @HugoRCD in https://github.com/HugoRCD/evlog/pull/197
### Performance Improvements 
* perf(evlog): eliminate object allocations on hot paths by @HugoRCD in https://github.com/HugoRCD/evlog/pull/181
* perf(core): eliminate allocations in emit hot path by @HugoRCD in https://github.com/HugoRCD/evlog/pull/185


**Full Changelog**: https://github.com/HugoRCD/evlog/compare/evlog@2.7.0...evlog@2.8.0