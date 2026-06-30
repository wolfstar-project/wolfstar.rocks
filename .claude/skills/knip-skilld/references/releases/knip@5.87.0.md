---
tag: "knip@5.87.0"
version: 5.87.0
published: 2026-03-16
name: Release 5.87.0
---

# Release 5.87.0

* Add pkg as built-in pnpm command (#1597) (32ee5591e) - thanks @azat-io!
* Add oxlint.config.ts to oxlint plugin (#1598) (2951050e5) - thanks @DaniFoldi!
* Add oxfmt plugin (#1599) (6bd980742) - thanks @DaniFoldi!
* Head banger (7930467e3)
* Add sanity to the list (4ee3d0ddd)
* Fix minor lint issue (9e0dcd974)
* Flatten `test()` (d010c5597)
* Make toPosix a no-op on non-Windows platforms (b37112361)
* Replace isBuiltin with startsWith('node:') in sanitizeSpecifier (e7b100aef)
* Skip picomatch recompilation when gitignore adds no new patterns (c7870dba6)
* Incrementally compile picomatch matchers during gitignore walk (9948284fb)
* Identify binaries called by `find -exec` (#1601) (f7367fd48) - thanks @t3chguy!
* Identify that `@babel/runtime` is needed when `@babel/plugin-transform-runtime` is used (#1602) (ef4da0691) - thanks @t3chguy!
* Rename package-manager → resolvers, move `find` (0bd97f01f)
* Streamline babel plugin impl (3cc192e08)
* Detect local $schema references in changesets plugin (resolve #1335) (3a180820f)
* Resolve Nx run-commands from `cwd` (resolve #1595) (e71c9acc9)
* Fix up issue types table (resolve #1376) (20a3762d5)
* Skip optional peerDep issues for installed deps (resolve #1545) (f554d2f30)
* Add dim highlight opts for enum/class members, duplicates (resolve #1567) (35ce4229f)
* Cache isGitIgnored results (75942dd0a)
* Don't report unused files outside project set (resolve #1606) (fef625da8)
* Fix openapi-ts dependency resolution (#1607) (663825ef4) - thanks @jonahsnider!
* Improve --performance and --memory output, clean up timerify calls (df0ace489)