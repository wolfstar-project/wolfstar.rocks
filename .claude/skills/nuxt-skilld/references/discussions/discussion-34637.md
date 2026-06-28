---
number: 34637
title: "Can I update directly from nuxt@4.0.3 to nuxt@4.4"
category: Questions
created: 2026-03-18
url: "https://github.com/nuxt/nuxt/discussions/34637"
upvotes: 1
comments: 2
answered: false
---

# Can I update directly from nuxt@4.0.3 to nuxt@4.4

I've a project that has 4.0.3 and I want to update to lastest. Can I update directly to version 4.4? (https://nuxt.com/blog/v4-4)

Should I use command `npx nuxt upgrade` or `npx nuxt upgrade --dedupe` keeping in mind that my project is already in production and I need to be care when we update dependencies.

thanks


---

## Top Comments

**@OrbisK** [maintainer]:

`npx nuxt upgrade` prompts you if you want to

1. dedupe your deps (recommended)
2. recreate lockfile (basically `rm -rf node_modules <lockfile>`)
3. just update

It acutally depends on your project. I always dedupe, but there might be situations where dedupe causes bugs, if a given transtitive dependency has a bug with a newer version of its peer dependencies (unlikely)

`npx nuxt upgrade --dedupe` is just a shortcut to skip the prompt and select dedupe by default :)

There is currently no way to update to a specific version (x.y.z). By default it always upgrades to the latest avail...

**@Shubrathshetty**:

Yes, u can upgrade directly, use --dedupe because Nuxt 4.4 updated some of its internal packages (like vue-router v5), and without it your lockfile might keep old versions of those packages instead of pulling the correct ones in. Plain upgrade only bumps Nuxt itself, --dedupe ensures everything underneath it is consistent too.
Since it's production, just snapshot your lockfile with a git commit before running it, so you have a clean rollback point if anything looks off.