---
number: 34720
title: Nitro server hanging...how to debug?
category: Questions
created: 2026-03-27
url: "https://github.com/nuxt/nuxt/discussions/34720"
upvotes: 2
comments: 1
answered: false
---

# Nitro server hanging...how to debug?

My Nitro server build consistently takes ~30 minutes and occasionally hits JavaScript heap out of memory (even with NODE_OPTIONS=--max-old-space-size=4096). 

Any tips on how I can see what is causing the hangup?

When I run `npx nuxi analyze` and when building nitro server with the node-server preset, I get the following error:

...

---

## Top Comments

**@sueun-dev** (+2):

A 30-minute build with heap OOM at 4 GB is almost always Nitro's Rollup bundling phase, not the prerender step. A few things to try, roughly in order of impact:

**1. Enable `legacyExternals` first**

This is the highest-impact fix. Nitro's default node-externals plugin has a caching bug where resolved paths and original module IDs have different structures, causing repeated module resolution on every module that always misses the cache. With Firebase, @nuxt/content, and @nuxt/scripts in your dependency graph, this creates exponential memory growth. There's a tracked issue in nitrojs/nitro #23...