---
number: 9683
title: "Slow tests in GH Actions (>3x slower than Jest)"
category: "Q&A"
created: 2026-02-17
url: "https://github.com/vitest-dev/vitest/discussions/9683"
upvotes: 3
comments: 5
answered: false
---

# Slow tests in GH Actions (>3x slower than Jest)

We have >300 tests in one of our repos, many of them using fake timers. I've migrated them from Jest to Vitest (v4.0.18) and was fine with ~2m running the tests locally - but in GH Actions where the Jest tests took 3m, the Vitest ones took 11m.

```
Duration  651.56s (transform 9.14s, setup 91.23s, import 90.81s, tests 206.13s, environment 184.21s)
```

I've tried disabling coverage and fileParallelism, as well as turning up the maxConcurrency to 10. None of that worked, so we're not able to migrate to Vitest at the moment. 

(This post is similar to: https://github.com/vitest-dev/vitest/discussions/6223 - but we don't have a particularly long setup - just very slow tests in GH A).

---

## Top Comments

**@sheremet-va** [maintainer]:

> So is Vitest really just much slower than Jest? I would propose the name is at best confusing in that case?

It depends on your setup, how your tests are written and what libraries you import. Some libraries export a single CJS entry point and a lot of small ES modules which can cause it to be several times slower, this makes Jest faster because it prefers CJS modules. I recommend using openTelemetry or importBreakdown experimental featu...

**@wesleysmyth**:

The 3x slowdown in CI is a common issue when migrating from Jest to Vitest. It's usually caused by the worker pool strategy and how Vitest handles test isolation.

### Fix 1: Switch to `forks` pool (most impactful)

Vitest defaults to `threads` (worker_threads), which shares memory but has higher overhead per test file in CI where CPU cores are limited. Switch to `forks`:

...

**@IanGraingerGMSL**:

Further to my above reply to @wesleysmyth's excellent reply:

Changes:
1. Use `pool: 'forks'` 
2. Use `maxWorkers: 2`
3. I went through the 11 test files that used fake timers (fewer than I thought there were!) and ensured they all switched back to using real timers

That didn't make much of a difference (~11m -> 8.5m).

The slowness is spread _fairly_ evenly through the files and there doesn't look to be anything obvious in the transform/setup etc times? (16s, 2x13s, 2x8s, 3x7s etc).

```
Duration  493.43s (transform 13.47s, setup 133.42s, import 147.55s, tests 298.96s, environment 313.29s)
```...