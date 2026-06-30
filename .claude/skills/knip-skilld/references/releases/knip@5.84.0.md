---
tag: "knip@5.84.0"
version: 5.84.0
published: 2026-02-18
name: Release 5.84.0
---

# Release 5.84.0

* Post-release shenanigans (e7965cba23b0c63f0165a12c96aed75257aa6919)
* Move most compilers to plugins & register from there (61beafe3e002408e91169397f7c384e14c613d92)
* Minor refactor (e20a6828be8dd1e49b819d5b5b896a26db2a91ac)
* Fix lint issues (d2bbc139e63235c415a243e76ad8685693b8edf2)
* Add missing catalog property to rules in JSON schema (#1518) (5d49dea2696db454e630014efd25172d6edde9fa) - thanks @Mohmdev!
* feat(plugins): add @typescript/native-preview (tsgo) support (#1513) (babfb10a0426059bc2d79d14a2ba9c33767b6571) - thanks @jgoux!
* Fix up quoting for spaced args (resolve #1515) (2b735cb8d87a827bf9ea53ea2bcfcedf117e6d4d)
* Switch to tsconfig-aware module resolver in input handler (634d0f68f681df1bf1e8896846f4d4c29b03e689)
* Use `bun test` positionals as entry points (resolve #1521) (da9472555b28b04eddba703b1dfee69b2cb8b6f9)
* Edit docs (327726ff2c5f2b135581088dea62bd3ed4bc99d4)
* Minor refactor while at it (dc87e8ea7157745a449955e9a275877d19cf4d87)
* Add config hints for unused `ignore` and `ignoreFiles` items (a4989eef8c870aa038d9c9d9e09597590ca444e7)
* Accept known bins only behind double-dash (resolve #1524) (b9214e35659f1f87eabc6695d9b9643c0e6c8022)
* feat(plugins): add support for bun test preloaded files (#1525) (14ee32a8f818e1cbf48398ba57bf0f19812ed8be) - thanks @jgoux!
* Add `date` to `IGNORED_GLOBAL_BINARIES` (#1476) (f08f92bd9eac95ec4eafd01ddb01279cb047544e) - thanks @duci9y!
* Fix edge case for binaries in scripts (82331ee2d336349d24a23437527991b73c764039)
* Report ignore/files config hints only if sure & relevant (4c3bd085477139f50dce468c4231ba2753459c54)
* Add consistent `repository` fields (781a0fd44a2cece4fd9c1413e50caa88df528607)
* Add language-server bin (13d78454c4100f5d6a4f0cadcf1d77eadec523b2)
* Use --stdio if no transport provided (bedb21adff873c13095350842c85bb1bfeac643b)
* Refactor from "enabled" to "deferSession" (resolve #1499) (15e3360f11c81a866b8e6de76e894986bdfddedd)
* Use `initializationOptions.config` or default fallback config obj (resolve #1503) (0abe5684083428340254dc1b0136760aacb9acff)
* Also publish ls + mcp with pkg-pr-new (78065260f55fc491d59912e2db41d789e49a1bb7)
* Auto-format (51b7dc1de9e2ec5b738df5389906df84dc1f3dd7)
* Remove `chdir` shenanigans (close #1516) (0cbee8f38f4a91504b3adc4faee466b9624120fc)
* Bind `console.*` to distinguish internal external logs (3eac278273856994483a9164539bf57a51ed440b)
* Add early bail-outs for changed files we can ignore (36c2dd5c4345d743c3de58ebd677b6f48a270213)
* Avoid unnecessary module graph updates for unmodified files (f94c41f24fb7f5c4682a620bafd03700cf14ba68)
* Fix typo in pkg-pr-new-pkg-dir (7e7a8b05a06f1f972a1d5e236dc53facbbb99729)
* Add .DS_Store to .gitignore (#1530) (40fe5cc608f2ecf71d148e061071e249c8940edb) - thanks @wojtekmaj!
* Ignore RNC CLI and metro internals in react-native projects (#1528) (0f892aeed2556a018ddaa769c24be68fba8b91aa) - thanks @wojtekmaj!
* Support nested _generated dirs in Convex plugin (#1531) (bd75e9fce6a25997d3ecd90e58b087f05a89c96f) - thanks @kvnwolf!
* Housekeep cli help output (c24e746b31b5dd994d004286229bd9d913bf8f14)
* Fix up gitignore test (6bc640c166daed354ec9514277b9f719155eb8ab)
* Introduce `isFilterTransitiveDependencies` flag (close #1507, close #1101) (8678df2d6f6cbedfe9483dae75e84a5605d730df)
* Housekeep webpack plugin (2cc13066cdfd82e03459cb724907ff998231145b)
* Move up `plugin.setup` & tear down `plugin.teardown` (4dbf23dd54ec7712f33eb8c714c8dd9942eb5538)
* Skip config file loading if only external re-exports (ab775b1038a25e3e844e23c84ae4fc30b87eb7be)
* Improve & optimize ignore pattern handling (c3d391210d3cf9230622b32416c1b8093062b232)
* Housekeep compiler registration (2aaf9fc6b68fcd36d6a8781690d5882f7bb7cc3e)
* Edit docs re. config file location (79bfb352246c900035c6deac7c3742c7780e726f)
* Register visitors from plugins (9b059f823a3aaa707a5e4bd3c14d7d879d397cf2)
* importMetaGlobCall visitor for Vite plugin (1874b19b0509c50e50446c58d4237a8c411d7259)
* Extend registerVisitors with script visitor support (728c8142a88df12bc4465201400cef4a057df0af)
* Move execa script visitor to execa plugin (71c739a63df39b17cf0b20e8e268a1e78aaacea8)
* Move zx script visitor to zx plugin (5ac24c7b86005fd2ed5ae5a559e346d3c6831ec0)
* Add require.context visitor to webpack plugin (100f1748e1bcc2c157ce482418295ccab7efb110)
* Add module.register() visitor for Node.js loader API (resolve #1535) (742407c61dba9c71de685e052cf531fddc8e1736)
* Add .DS_Store _in fixtures_ to .gitignore (#1534) (90fa6774ee1cb4d6a093bdf224730cd4b2d68358) - thanks @wojtekmaj!
* Mention that depcheck recommends knip (#1536) (75d00ff3276b4a1adac88de51de2895d68ff8220) - thanks @ArtskydJ!
* Remove `@source` matcher from tailwind plugin (resolve #1537) (b7149b6185407be18aaa1613f3cb275a1a92a4b7)
* Fix `-w` → `-W` flag for Yarn (f305250f06c84653162c15f9500cad2d65dea8c7)
* Update AGENTS.md (ec83887947c4a92625ec8974e25cb051640baa89)
* Extract and extend react-native plugin (#1538) (9fd04a89f2e45c95831e56ba813d918a2fbdfcd7)
* Add pm2 plugin (#1540) (3bb4203e549f163e27caab3b4ff7f8d8d3076784) - thanks @wojtekmaj!
* Fix Yarn (Berry) plugins and binaries reported as unused (#1523) (4f0a3076f84fff6212f2a9c9a99d1cc4254e98ee) - thanks @wojtekmaj!
* Update docs (ed23dd23790a0787dd747a1f183586470220be57)
* Minor refactor while at it (4115b9733bff321e138d026bcad2a29c35f74dc2)
* Add @knip/create-config to release script (1135b82d7bd9096f4c3752482c58e72e10d0ef1a)
