---
tag: "knip@5.81.0"
version: 5.81.0
published: 2026-01-14
name: Release 5.81.0
---

# Release 5.81.0

* Update CLI documentation to match current implementation (#1458) (937dd832d9421a295e733d0046266b3154fd78fc) - thanks @sebacardello!
* Replace glob with fs helpers (#1454) (880f7182f3df5df5b1ee497d73c02846ae8f10f4) - thanks @gameroman!
* Expand workspace filter (#1455) (b3edb80a9b56fecd2b9ed67a5dcc927e405bd93d) - thanks @fightZy!
* Sync up cli-arguments  md docs further (47559d21f1f13a2317c4b9d8439d5df4c8084306)
* Minor refactor for lints & consistency (c5e66dbe226612c8ea7c65b5d193292a115c987e)
* Fix manual enabled compilers (#1457) (57df2e1c581b14e85023bd857048bb313d386130) - thanks @digitsum!
* add push notification once module graph is built (#1461) (57825f443509fb2afa0444f7831ea67a798364f8) - thanks @niklas-wortmann!
* fix(prisma): Avoid crash if Prisma schema path is not specified (#1464) (1e0ffc7d64fa513eec47e082b0aba96c817960ee) - thanks @stephenwade!
* Add Nitro plugin (#1415) (ecf5e34b51f3817dabcf50ca6705141aea3f56e5) - thanks @lynnntropy!
* Add a few impl guidelines to AGENTS.md (5923a20b0b8a12fb33ef23ecf600e82cc1afe7c9)
* Optimize workspaces storage & usage inside `ConfigurationChief` (602603fdf428d329925e191dde319388e8726597)
* Exclude optional peer deps from the production deps check in strict mode (resolve #1145) (605fb852a927ef89c0983000cf623f00ab3ebc55)
* Consider all members of `keyof typeof MyEnum` used (7d5b9d6c34f0c25d5608f398defe3ed12f0f49c3)
* Add entry files to sveltekit (resolve #1162, resolve #1465) (c0ed40a21519993d0513bb87b1b2a189b3d0054f)
* Consistent config options (dc11214340839b3e0d11c6b5f0d1bcbd271ccb5f)
* Warn for faux monorepo in init script (b94dcfa6b0e108d3bcb80d35fdde7ff54274d908)
* Document new --workspace behavior (#1455) (9cbbbc203199c002616722ad76704b621c0706d4)
* Auto-format (4c3e45ffe9dc447ab9630022406a89a04ae7acda)
* Add `npm login` to release script (968d339f8583c678bb891a446ac038d79b6716c9)