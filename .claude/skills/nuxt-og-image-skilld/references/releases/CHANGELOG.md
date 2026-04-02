# Changelog


## v6.2.4...main

compare changes

###  Fixes

- Hydration-issue warning due to SSR generated DateTime value (#535)
- Sanitize component props (#543)
- Harden security defaults (#540)
- Whitelist component props to prevent cache key DoS (#544)

###  Chore

- Bump deps (a8a65b66)
- Bump deps (bcad7915)
- Artifact (284540a7)
- Sync (e7deb1f7)

###  Contributors

- Harlan Wilton (@harlan-zw)
- Loïs Bégué (@khatastroffik)

## v6.2.2...main

compare changes

###  Performance

- **devtools:** Drop json-editor-vue (14a585b7)

###  Fixes

- **cloudflare:** Detect legacy assets mode (7f60a480)

###  Chore

- Bump deps (362cee2a)

###  Contributors

- Harlan Wilton (@harlan-zw)

## v6.2.1...main

compare changes

###  Chore

- Bump deps (caf70605)

###  Contributors

- Harlan Wilton (@harlan-zw)

## v6.2.0...main

compare changes

###  Fixes

- Missing compatibility config (4541033c)
- **devtools:** Broken resolution (57ac2647)

###  Chore

- Label devtools layout (ed041041)
- Bump deps (41fa2371)

###  Contributors

- Harlan Wilton (@harlan-zw)

## v6.1.2...main

compare changes

###  Enhancements

- **content:** Add `defineOgImageSchema()` composable (#520)

###  Fixes

- Update pnpm-lock.yaml (0784c378)
- Broken slash decoding in some cases (6f8ac765)
- **client:** Resolve layer-devtools path via import.meta.resolve (dd4e0578)
- **cloudflare:** Resolve fonts via localFetch when ASSETS binding unavailable (#527)
- B64 encode props with URL-sensitive characters (#530)
- Resolve CI issues (f3e3045b)
- Use explicit imports mapping for #nuxtseo-shared (08594505)
- Use direct nuxtseo-shared/runtime imports, bump to ^0.3.0 (31b1a991)
- Resolve CI failures in lint, build, typecheck, and tests (47e85d35)
- Use dot-notation for ambiguous CalcTest component in type test (3ba63fef)

###  Refactors

- Migrate to nuxtseo-shared for shared utilities (f909f014)
- **client:** Migrate devtools to nuxtseo-shared layer (48c15483)
- Use published nuxtseo-layer-devtools package (74393aa3)
- Remove dead defensive prerender initialization (3b0dae14)
- Use nuxtseo-shared subpath exports, bump to ^0.5.0 (bd50740f)
- Migrate to nuxtseo-shared (#521)

###  Chore

- Sync (1f7cb2c4)
- Sync (ca0fb5b0)
- Update lockfile (162799b7)
- Bump nuxtseo-shared to ^0.2.0 (ecf3d6b0)
- Bump nuxtseo-shared to ^0.4.0, revert runtime to #alias (b368142f)
- Sync (f173a2a7)
- Sync (eb106f60)
- Sync (0f4b0f27)
- Sync (50f5e65e)
- Sync (787a087e)
- Remove unrelated files from PR (5f8ed2f2)
- Examples (73c36536)
- Sync (837a3e66)
- Sync (2d63ada7)

###  Tests

- Update cloudflare-takumi snapshots after template redesign (66c2a80a)

###  Contributors

- Harlan Wilton (@harlan-zw)

## v6.1.1...main

compare changes

###  Fixes

- Auto-detect NuxtHub KV for cache storage (#517)
- **tw4:** Use safe module resolution to prevent throws for unresolvable plugins (#519)

###  Chore

- Sync (7019fa01)
- Sync (46d07288)

###  Contributors

- Harlan Wilton (@harlan-zw)

## v6.1.0...main

compare changes

###  Fixes

- Add missing option keys to URL encoding and prop separation (#516)
- Defer x-nitro-prerender header to prevent stale hash URLs during prerender (#514)
- Base64-encode non-ASCII values in URL path params (#515)

###  Chore

- Lint (26863d01)

###  Contributors

- Harlan Wilton (@harlan-zw)

## v6.0.7...main

compare changes

###  Enhancements

- **devtools:** Add production preview toggle (#509)
- **cli:** Add `create` and `switch` commands with DX improvements (#508)
- **devtools:** Add component creation from empty state (#510)

###  Fixes

- **encoding:** Avoid pre decoded params to be truncated (#504)
- **fonts:** Detect font families from script setup computed properties (#507)
- **devtools:** Use actual content width for preview scaling (#506)
- Recover from v5 defineOgImage syntax (1e882060)

###  Chore

- Bump (f9725ffd)
- Lint (9bcb8358)

###  Contributors

- Harlan Wilton (@harlan-zw)
- Baptiste Leproux (@larbish)

## v6.0.6...main

compare changes

###  Fixes

- Broken windows path resolutions (dd1ae90b)

###  Chore

- Bump (923c9f83)

###  Contributors

- Harlan Wilton (@harlan-zw)

## v6.0.5...main

compare changes

###  Fixes

- Prevent crash when defineOgImage runs client-side during layout transitions (#502)
- **takumi:** Use real font family names for correct font-weight matching (#503)

###  Chore

- Bump deps (06f54419)

###  Contributors

- Harlan Wilton (@harlan-zw)

## v6.0.4...main

compare changes

###  Chore

- Broken mock still (1f93bf7f)

###  Contributors

- Harlan Wilton (@harlan-zw)

## v6.0.3...main

compare changes

###  Fixes

- Don't mock null bindings (c46560be)

###  Chore

- Bump (47f57f51)

###  Contributors

- Harlan Wilton <harlan@harlanzw.com>

## v6.0.2...main

compare changes

###  Fixes

- Normalize font casing (61f8fb36)
- Svg dimensions not properly resolving in runtime instances (4a5c8324)
- Resolve lint errors for CI (aac48d30)

###  Contributors

- Harlan Wilton (@harlan-zw)

## v6.0.1...main

compare changes

###  Fixes

- **takumi:** Broken font weight matching (3f0c5eaa)
- **migration:** Broken warning (d87d88a1)
- **takumi:** Html -> nodes attr ordering (35ea6145)
- **satori:** Better css var matching (251f1ee4)
- **satori:** Infer SVG dimensions from parent (94ef0abc)

###  Refactors

- Drop `sanitizeTakumiStyles` (#498)
- Runtime font loading unify (4c87a57c)

###  Chore

- Re-do test infastructure (704a6d4d)
- Sync (9d98db9c)
- Test (1d4f49ce)
- Sync (5762d157)
- Sync (8ba3de55)
- Sync (fb35f0f9)
- CI (127df981)
- CI (04b106b6)

###  Contributors

- Harlan Wilton <harlan@harlanzw.com>
- Kane Wang <kane@yeecord.com>

## v6.0.0...main

compare changes

###  Enhancements

- Add `defineOgImageUrl` composable for pre-prepared images (acff3941)

###  Fixes

- Support node cluster (e5c2571c)
- Add defineOgImageUrl to tree-shake plugin, fix mock type and doc anchor (c1a85a56)
- Lint error in defineOgImageUrl docs (da9dc452)
- Use element loc instead of child loc in ultrahtml SFC parser (d5cd4f95)
- **migration:** `defineOgImage({ url })` -> `useSeoMeta` (#496)

###  Refactors

- Drop defineOgImageUrl, use useSeoMeta for pre-prepared images (ccbaa48f)
- Replace HTML template regex with ultrahtml AST in CLI migration (32a49eeb)
- Use ultrahtml for SFC block extraction, remove last regex parsers (15b7b998)

###  Chore

- Remove beta flag (c6d8e981)
- Bump deps (350bc579)
- Bump deps (499500e3)

###  Contributors

- Harlan Wilton (@harlan-zw)

## v6.0.0-beta.48...main

compare changes

###  Fixes

- Support .webp with takumi (5f5700a3)
- Cli v6 migration gaps (70a4987c)
- **takumi:** Warn on missing css vars (a0a2fec2)
- Skip community templates from renderer selection (f9d18ea6)

###  Chore

- Bump deps (6b896dd9)
- Tutorial test (5d9e5e06)
- Sync (a5e465df)

###  Contributors

- Harlan Wilton (@harlan-zw)

