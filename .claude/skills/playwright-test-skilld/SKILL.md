---
name: playwright-test-skilld
description: "ALWAYS use when writing code importing \"@playwright/test\". Consult for debugging, best practices, or modifying @playwright/test, playwright/test, playwright test, playwright."
metadata:
  version: 1.61.1
  generated_by: Anthropic · Haiku 4.5
  generated_at: 2026-07-16
---

# microsoft/playwright `@playwright/test@1.61.1`
**Tags:** rc: 1.18.0-rc1, latest: 1.61.1, beta: 1.61.1-beta-1782889362000

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Issues](./.skilld/issues/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `pnpm exec skilld search "query" -p @playwright/test` instead of grepping `.skilld/` directories. Run `pnpm exec skilld search --guide -p @playwright/test` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes for @playwright/test v1.61.1 — prioritizing recent major/minor releases that break or introduce APIs.

### Breaking Changes & Removed APIs

- BREAKING: `page.locator('_react=...')` and `page.locator('_vue=...')` selectors — removed in v1.58.0, use locator strategies (getByRole, getByTestId) or CSS selectors instead [source](./.skilld/releases/v1.58.0.md#breaking-changes)

- BREAKING: `:light` selector engine suffix — removed in v1.58.0, use standard CSS selectors instead [source](./.skilld/releases/v1.58.0.md#breaking-changes)

- BREAKING: `browserType.launch({ devtools: true })` — `devtools` option removed in v1.58.0, use `args: ['--auto-open-devtools-for-tabs']` instead [source](./.skilld/releases/v1.58.0.md#breaking-changes)

- BREAKING: `page.accessibility` API — removed in v1.57.0 after 3 years deprecation, use external libraries like Axe for accessibility testing [source](./.skilld/releases/v1.57.0.md#breaking-change)

- BREAKING: `browserContext.on('backgroundpage')` event — deprecated and no longer emitted in v1.56.0, `browserContext.backgroundPages()` returns empty list [source](./.skilld/releases/v1.56.0.md#breaking-changes)

- BREAKING: Glob URL patterns in `page.route()` — `?` wildcard no longer supported (matches literal `?` character) and `[]` ranges/sets removed in v1.52.0, use regular expressions instead [source](./.skilld/releases/v1.52.0.md#breaking-changes)

- BREAKING: `route.continue({ headers: { Cookie: '...' } })` — Cookie header override no longer allowed in v1.52.0, use `browserContext.addCookies()` instead [source](./.skilld/releases/v1.52.0.md#breaking-changes)

- BREAKING: `npx playwright test -gv` — removed in v1.54.0, use `--grep-invert` instead [source](./.skilld/releases/v1.54.0.md#command-line)

- BREAKING: `npx playwright open` — no longer opens test recorder in v1.54.0, use `npx playwright codegen` instead [source](./.skilld/releases/v1.54.0.md#command-line)

### New APIs & Methods

- NEW: `page.screencast` API — comprehensive screencast recording and video manipulation in v1.59.0 with methods `start()`, `stop()`, `showActions()`, `hideActions()`, `showChapter()`, `showOverlay()`, `showOverlays()`, `hideOverlays()` for video recording, action annotations, chapter titles, and frame streaming [source](./.skilld/releases/v1.59.0.md#screencast)

- NEW: `browser.bind(sessionName, options)` — bind a browser for remote connections in v1.59.0, returns endpoint for use with `browser.unbind()`, `browserType.connect()`, or `playwright-cli attach` [source](./.skilld/releases/v1.59.0.md#interoperability)

- NEW: `browserContext.debugger` — programmatic control over Playwright debugger in v1.59.0 [source](./.skilld/releases/v1.59.0.md#miscellaneous)

- NEW: `browserContext.setStorageState()` — clears cookies, local storage, and IndexedDB for all origins and sets new storage state in v1.59.0 (no need to create new context) [source](./.skilld/releases/v1.59.0.md#storage-console-and-errors)

- NEW: `page.clearConsoleMessages()` and `page.clearPageErrors()` — clear stored console messages and page errors in v1.59.0 [source](./.skilld/releases/v1.59.0.md#storage-console-and-errors)

- NEW: `page.ariaSnapshot()` — capture aria snapshot of entire page in v1.59.0 [source](./.skilld/releases/v1.59.0.md#snapshots-and-locators)

- NEW: `locator.ariaSnapshot(options)` — aria snapshot methods now accept `depth` and `mode` options in v1.59.0 [source](./.skilld/releases/v1.59.0.md#snapshots-and-locators)

- NEW: `locator.normalize()` — converts a locator to follow best practices like test ids and aria roles in v1.59.0 [source](./.skilld/releases/v1.59.0.md#snapshots-and-locators)

- NEW: `page.pickLocator()` and `page.cancelPickLocator()` — interactive mode to select elements and get their locators in v1.59.0 [source](./.skilld/releases/v1.59.0.md#snapshots-and-locators)

- NEW: `page.consoleMessages()`, `page.pageErrors()`, `page.requests()` — retrieve most recent console messages, page errors, and network requests in v1.56.0 [source](./.skilld/releases/v1.56.0.md#new-apis)

- NEW: `testConfig.tag` — add tag to all tests in a run in v1.57.0, useful with merge-reports [source](./.skilld/releases/v1.57.0.md#new-apis)

- NEW: `worker.on('console')` event — emitted when JavaScript calls console API methods in v1.57.0 [source](./.skilld/releases/v1.57.0.md#new-apis)

- NEW: `locator.describe()` — describe a locator for trace viewer and reports in v1.53.0 [source](./.skilld/releases/v1.53.0.md#miscellaneous)

- NEW: `locator.description()` — retrieve locator description previously set with `describe()` in v1.57.0, `Locator.toString()` now uses description when available [source](./.skilld/releases/v1.57.0.md#new-apis)

### Changed API Signatures & Options

- CHANGED: `locator.click(options)` and `locator.dragTo(options)` — new `steps` option in v1.57.0 controls number of mousemove events emitted while moving mouse pointer [source](./.skilld/releases/v1.57.0.md#new-apis)

- CHANGED: `locator.filter(options)` — new `visible` option in v1.51.0 allows matching only visible elements [source](./.skilld/releases/v1.51.0.md#filter-visible-elements)

- CHANGED: `browserContext.addCookies(cookies)` — accepts new `partitionKey` property in v1.54.0 for partitioned cookies (CHIPS) [source](./.skilld/releases/v1.54.0.md#highlights)

- CHANGED: `browserContext.cookies()` — returns cookies with new `partitionKey` property in v1.54.0 for partitioned cookies [source](./.skilld/releases/v1.54.0.md#highlights)

- CHANGED: `page.emulateMedia(options)` and `browser.newContext(options)` — new `contrast` option in v1.51.0 to emulate `prefers-contrast` media feature [source](./.skilld/releases/v1.51.0.md#miscellaneous)

- CHANGED: `apiRequest.newContext(options)` — new `failOnStatusCode` option in v1.51.0 makes fetch requests throw on non-2xx/3xx status codes [source](./.skilld/releases/v1.51.0.md#miscellaneous)

- CHANGED: `apiRequest.newContext(options)` — new `maxRedirects` option in v1.52.0 controls maximum redirects [source](./.skilld/releases/v1.52.0.md#miscellaneous)

- CHANGED: `page.consoleMessages(options)` and `page.pageErrors(options)` — new `filter` option in v1.59.0 controls which messages are returned [source](./.skilld/releases/v1.59.0.md#storage-console-and-errors)

### Test Configuration Changes

- CHANGED: `testProject` — new `workers` property in v1.52.0 allows specifying concurrent worker processes per project [source](./.skilld/releases/v1.52.0.md#test-runner)

- CHANGED: `testConfig.failOnFlakyTests` — new option in v1.52.0 fails test run if flaky tests detected [source](./.skilld/releases/v1.52.0.md#test-runner)

- CHANGED: `testConfig.captureGitInfo` — new option in v1.51.0 captures git information into `testConfig.metadata` [source](./.skilld/releases/v1.51.0.md#git-information-in-html-report)

- CHANGED: `testInfo.snapshotPath()` — new `kind` option in v1.53.0 controls which snapshot path template is used [source](./.skilld/releases/v1.53.0.md#miscellaneous)

- CHANGED: `testConfig.webServer` — new `wait` option in v1.57.0 allows waiting for server readiness via stdout/stderr regex with named capture groups [source](./.skilld/releases/v1.57.0.md#waiting-for-webserver-output)

### New Assertion & Aria Methods

- NEW: `expect(locator).toContainClass(className)` — assert individual class names ergonomically in v1.52.0 [source](./.skilld/releases/v1.52.0.md#highlights)

- CHANGED: Aria Snapshots — new `/children: equal` property in v1.52.0 for strict matching, and `/url` property for link URLs [source](./.skilld/releases/v1.52.0.md#highlights)

- CHANGED: `expect(page).toHaveURL()` — now supports a predicate in v1.51.0 [source](./.skilld/releases/v1.51.0.md#miscellaneous)

**Also changed:** `testStepInfo.titlePath` new v1.55 · `browserType.connectOverCDP({ isLocal })` new v1.58 · `response.httpVersion()` new v1.59 · `request.existingResponse()` new v1.59 · `tracing.start({ live })` new v1.59 · `browserType.launch({ artifactsDir })` new v1.59 · Node.js 16 removed v1.54 · Chromium extension manifest v2 dropped v1.55 · macOS 13 WebKit deprecated v1.52 · macOS 14 WebKit removed v1.59 · HTML reporter `noSnippets` option v1.54 · testResult.annotations per retry v1.52 · test.step() callback parameter signature v1.51 · CLI `--test-list` and `--test-list-invert` v1.56 · HTML reporter NOT filtering `!@tag` v1.52
<!-- /skilld:api-changes -->
