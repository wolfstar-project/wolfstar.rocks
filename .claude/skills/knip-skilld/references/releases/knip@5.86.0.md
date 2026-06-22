---
tag: "knip@5.86.0"
version: 5.86.0
published: 2026-03-07
name: Release 5.86.0
---

# Release 5.86.0

* Rewrite import specifiers to use .ts extensions, remove tsx (#1548) (58674ade551d04ca38eea5b8273e8843eed7659d) - thanks @wojtekmaj!
*  Add .spec-d to vitest entry files (#1556) (3123ab76745990b2483f9c8f26c9c9ad4500d4aa) - thanks @yamachi4416!
* Update docs for tsx → node (0418eba6dc6a0d5e1e56cce1c037b0ae6846bc64)
* Auto-format (7142fd701f97f8a4115c4094d1007f2551c33537)
* Add Qwik plugin (#1557) (fc668f4b59e40caddf8e9904fb50dc59de1a86f8) - thanks @azat-io!
* Fix Bun plugin to handle directory arguments in `bun test` (c112b6c68b13976e4b601c5169a09e748e67fd4f)
* Update FAQ (b105a42610346f7b9a07071ab8f5d2d7c60b004f)
* fix(plugin): swc with `externalHelpers` setting ignores `@swc/helpers` dependency (#1560) (4bcb1f5429d003e6e2b28e2bd65a64c849fe0786) - thanks @bobaaaaa!
* chore: git ignore artifacts (#1563) (4878724a6599bc80a9ef9c62d86d2805d7d8a914) - thanks @unional!
* Fix Vite plugin to respect root option for index.html entries (#1561) (67a56470f61cadfe1e771adc87385a98e398da2e) - thanks @azat-io!
* Fix Astro sharpImageService() false positive for unused sharp (#1559) (c36247cc034a14a846e94faafbdd2097f9a5d7d2) - thanks @azat-io!
* Fix up gitignore test (b2c3d086be6c76791d2b60b10944df3b7b52d9fc)
* fix: normalize Windows backslash paths in fs.watch listener to fix --watch on Windows (#1558) (b86b421ec9f6bf1c930600c5109511712af3d224) - thanks @Aiudadadadf!
* Fix wrangler plugin not enabled by jsonc config (#1564) (00bb1be35386300e6ea302c14a9b15e3f6e03b35) - thanks @DaniFoldi!
* Edit AGENTS.md (a2aaf2f9983e24b881191403bd716bd1ee791c70)
* Fix tsconfig presets marked as unlisted in strict mode (resolve #1568) (463d67dad5f105cc2a76ce847192a9a7d1fb8498)
* oxcellent (8a602c7863b63b1a940584e2a0436b70d8650be8)
* Refactor format test and use prettier for consistent results (b6afc01828f884f579747e6d8e425aa1b07a068f)
* Sort package.json (d3a521b62d4ba5de05d3497b456cf9d225a743c8)
* Add .git to GLOBAL_IGNORE_PATTERNS (resolve #1571) (4e95ffb45748fa1ae84548c1992d2947826d2667)
* Detect Yarn plugins that are listed by their path alone (#1574) (de4c7d898f83a52ea80a374d9395bcb109f39c23) - thanks @robintown!
* Start using unbash (a5de2c4e49bda454f0e42b4e5bfae54024d27772)
* Bump unbash & simplify bash parser further (57896d32c86412ad5941c67fbb2fc29882a5bafa)
* Fix refs in workspaces fixture (#1578) (fbee3426ccc05eaf2fcaa069826cd3594f946db9)
* Include a few more entry patterns with `pageExtensions` (resolve #1581) (c6a6d9e72b7674392cb58675befcc4c6bbb64e11)
* Clean exit if --fix fixes all issues (resolve #1577) (c182c29e35748ff044048c578b6bf7dd99dae9a8)
* Document JSDoc tag hints (0e7b6ae8d66650da9e4aad81aa2bb7cfbd985e57)
* Update AGENTS.md (f845462736f9fb6349c7e4bfd0f72d76df473f8c)
* Add openapi-ts plugin (#1579) (42d1b3f5f912b37ed73ab46dc0fe07a93135413b) - thanks @jonahsnider!
* Migrate from `js-yaml` → `yaml` (fb042ae235e57b340d167bb7bb7d7ddb0fa5b1fb)
* pnpm dedupe (2586254448e28bd54025f5726d23bf4f95c2e886)
* Fix plugin list order (#1587) (519ae3aca72333978c674aab0e7376c7007deaaf) - thanks @ikeyan!
* Fix confusing test fixtures for openapi-ts plugin (#1591) (f0083cac6c51337b1b53ee499dadcd5fa5e209ba) - thanks @jonahsnider!
* Off-by-1 (7d7dec6fec59ab8cddca09688d4ad05cdece1aea)
* Don't fix compiled files (pos off) (a9fdc77fa6321e469b718131df556c37289a7dbd)
* Add aliases from any tsconfig file in typescript plugin (resolve #1347) (ced77c707d064c5067b6dc331e76d878dc4add87)
* Support auto-imports in Nuxt plugin (#1517) (4ce27b2f793882bc3fc8f72813b4c0c6152e5168)
* Fix + lint .ts extension in import specifiers (d349de315a37f5ae208522abe830f1c41732779a)
* Safe `ts.isInTopLevelContext` → `isInTopLevelScope` (1819c2050440f82eb30e7be9d271298e6b4c8f14)
* Wrap `session.handleFileChanges` in try/catch (185afb8cc6b914df31ca0c22315190e44c2834da)
* Improve MDX compiler (9205e2a9480182605975687ebc4282f9805da58b)
* fix(playwright): Add missing built-in `null` reporter (#1596) (0f1ce7d1bba7a80ce0697378efd2be0968383a86) - thanks @shrink!
* Add package.json#imports as entry points (1fbe286046bd51653fff4139b4b8a0ef1ea04193)
* Update some dependencies + dedupe (381241e2e1e1875da7e34baee6b5d00f0aef0295)
* Add support for `extends` in nuxt plugin (9fcbdf5244f81820b9a2f53d5b320e6c54fba792)
* Update release script (f446b4f08ca48f7b135eb9da34a6388249598f1e)
