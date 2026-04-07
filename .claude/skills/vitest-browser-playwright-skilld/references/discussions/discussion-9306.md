---
number: 9306
title: Does Vitest browser mode support running the browser remotely (e.g. in Docker)?
category: "Q&A"
created: 2025-12-19
url: "https://github.com/vitest-dev/vitest/discussions/9306"
upvotes: 1
comments: 1
answered: true
---

# Does Vitest browser mode support running the browser remotely (e.g. in Docker)?

Hi Vitest team

I’m experimenting with Vitest browser mode using the Playwright provider and wanted to check whether the following setup is intended to be supported.

Setup

Vitest running locally on the host

Playwright + browser running inside a Docker container

Vitest connects to Playwright via wsEndpoint

What happens

When tests start, the browser is instructed to navigate to a URL like:
```
http://localhost:63315/__vitest_test__/?sessionId=<UUID>
```

I guess this is a internal Vitest browser/orchestrator server on a random port.
Since the browser is running in Docker, localhost resolves to the container rather than the host, so navigation fails.

From what I can tell, this internal server always binds to and advertises localhost, and I haven’t found a way to c...

---

## Accepted Answer

**@AriPerkkio** [maintainer]:

Configuring those should be possible via ~~https://vitest.dev/config/browser.html#browser-api~~ https://vitest.dev/config/browser/api.html#browser-api.


```md
## browser.api

- **Type:** `number | { port?, strictPort?, host? }`
- **Default:** `63315`
- **CLI:** `--browser.api=63315`, `--browser.api.port=1234, --browser.api.host=example.com`

Configure options for Vite server that serves code in the browser. Does not affect [`test.api`](#api) option. By default, Vitest assigns port `63315` to avoid conflicts with the development server, allowing you to run both in parallel.
```
