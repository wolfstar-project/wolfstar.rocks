---
total: 191
---

# Docs Index

- [Latest From the Vitest Blog](./blog.md)
- [Vitest](./index.md)
- [Meet the Team](./team.md)
- [Remove UnoCSS - Migration Complete](./todo.md): UnoCSS was causing OOM in CI. Removed entirely and replaced with @iconify/vue + plain CSS.

## api/advanced (13)

- [Test Artifacts](./api/advanced/artifacts.md): ::: warning
This is an advanced API. As a user, you most likely want to use test annotations to add notes or context to your tests instead. This is...
- [import-example](./api/advanced/import-example.md)
- [Task Metadata <Badge type="danger">advanced</Badge>](./api/advanced/metadata.md): If you are developing a custom reporter or using Vitest Node.js API, you might find it useful to pass data from tests that are being executed in va...
- [Plugin API](./api/advanced/plugin.md): ::: warning
This is an advanced API. If you just want to run tests, you probably don't need this. It is primarily used by library authors.
- [Reporters](./api/advanced/reporters.md): ::: warning
This is an advanced API. If you just want to configure built-in reporters, read the "Reporters" guide.
:::
- [Runner API <Badge type="danger">advanced</Badge>](./api/advanced/runner.md): ::: warning
This is advanced API. If you just want to run tests, you probably don't need this. It is primarily used by library authors.
:::
- [TestCase](./api/advanced/test-case.md): The TestCase class represents a single test. This class is only available in the main thread. Refer to the "Runner API" if you are working with run...
- [TestCollection](./api/advanced/test-collection.md): TestCollection represents a collection of top-level suites and tests in a suite or a module. It also provides useful methods to iterate over itself.
- [TestModule](./api/advanced/test-module.md): The TestModule class represents a single module in a single project. This class is only available in the main thread. Refer to the "Runner API" if ...
- [TestProject](./api/advanced/test-project.md): ::: warning
This guide describes the advanced Node.js API. If you just want to define projects, follow the "Test Projects" guide.
:::
- [TestSpecification](./api/advanced/test-specification.md): The TestSpecification class describes what module to run as a test and its parameters.
- [TestSuite](./api/advanced/test-suite.md): The TestSuite class represents a single suite. This class is only available in the main thread. Refer to the "Runner API" if you are working with r...
- [Vitest API](./api/advanced/vitest.md): Vitest instance requires the current test mode. It can be either:

## api (9)

- [assertType](./api/assert-type.md): ::: warning
During runtime this function doesn't do anything. To enable typechecking, don't forget to pass down --typecheck flag.
:::
- [assert](./api/assert.md): Vitest reexports the assert method from chai for verifying invariants.
- [describe](./api/describe.md): describe is used to group related tests and benchmarks into a suite. Suites help organize your test files by creating logical blocks, making test o...
- [expectTypeOf](./api/expect-typeof.md): ::: warning
During runtime this function doesn't do anything. To enable typechecking, don't forget to pass down --typecheck flag.
:::
- [expect](./api/expect.md): The following types are used in the type signatures below
- [Hooks](./api/hooks.md): These functions allow you to hook into the life cycle of tests to avoid repeating setup and teardown code. They apply to the current context: the f...
- [Mocks](./api/mock.md): You can create a mock function or a class to track its execution with the vi.fn method. If you want to track a property on an already created objec...
- [Test](./api/test.md): test or it defines a set of related expectations. It receives the test name and a function that holds the expectations to test.
- [Vi](./api/vi.md): Vitest provides utility functions to help you out through its vi helper. You can access it globally (when globals configuration is enabled), or imp...

## api/browser (8)

- [Assertion API | Browser Mode](./api/browser/assertions.md): Vitest provides a wide range of DOM assertions out of the box forked from @testing-library/jest-dom library with the added support for locators and...
- [Commands | Browser Mode](./api/browser/commands.md): Command is a function that invokes another function on the server and passes down the result back to the browser. Vitest exposes several built-in c...
- [Context API | Browser Mode](./api/browser/context.md): Vitest exposes a context module via vitest/browser entry point. As of 2.0, it exposes a small set of utilities that might be useful to you in tests.
- [Interactivity API | Browser Mode](./api/browser/interactivity.md): Vitest implements a subset of @testing-library/user-event APIs using Chrome DevTools Protocol or webdriver instead of faking events which makes the...
- [Locators | Browser Mode](./api/browser/locators.md): A locator is a representation of an element or a number of elements. Every locator is defined by a string called a selector. Vitest abstracts this ...
- [vitest-browser-react](./api/browser/react.md): The community vitest-browser-react package renders React components in Browser Mode.
- [vitest-browser-svelte](./api/browser/svelte.md): The community vitest-browser-svelte package renders Svelte components in Browser Mode.
- [vitest-browser-vue](./api/browser/vue.md): The community vitest-browser-vue package renders Vue components in Browser Mode.

## blog (4)

- [Vitest 3.2 is out!](./blog/vitest-3-2.md): June 2, 2025
- [Vitest 3.0 is out!](./blog/vitest-3.md): January 17, 2025
- [Vitest 4.1 is out!](./blog/vitest-4-1.md): March 12, 2026
- [Vitest 4.0 is out!](./blog/vitest-4.md): October 22, 2025

## config (80)

- [alias | Config](./config/alias.md): Define custom aliases when running inside tests. They will be merged with aliases from resolve.alias.
- [allowOnly | Config](./config/allowonly.md): By default, Vitest does not permit tests marked with the only flag in Continuous Integration (CI) environments. Conversely, in local development en...
- [api | Config](./config/api.md): Listen to port and serve API for the UI or browser server. When set to true, the default port is 51204.
- [attachmentsDir | Config](./config/attachmentsdir.md): Directory path for storing attachments created by context.annotate relative to the project root.
- [bail | Config](./config/bail.md): Stop test execution when given number of tests have failed.
- [benchmark | Config](./config/benchmark.md): Options used when running vitest bench.
- [cache | Config](./config/cache.md): Use this option if you want to disable the cache feature. At the moment Vitest stores cache for test results to run the longer and failed tests first.
- [chaiConfig | Config](./config/chaiconfig.md): Equivalent to Chai config.
- [clearMocks | Config](./config/clearmocks.md): Should Vitest automatically call vi.clearAllMocks() before each test.
- [coverage | Config](./config/coverage.md): You can use v8, istanbul or a custom coverage solution for coverage collection.
- [css | Config](./config/css.md): Configure if CSS should be processed. When excluded, CSS files will be replaced with empty strings to bypass the subsequent processing. CSS Modules...
- [dangerouslyIgnoreUnhandledErrors | Config](./config/dangerouslyignoreunhandlederrors.md): If this option is set to true, Vitest will not fail the test run if there are unhandled errors. Note that built-in reporters will still report them.
- [deps | Config](./config/deps.md): Handling for dependencies resolution.
- [detectAsyncLeaks | Config](./config/detectasyncleaks.md): ::: warning
Enabling this option will make your tests run much slower. Use only when debugging or developing tests.
:::
- [diff | Config](./config/diff.md): DiffOptions object or a path to a module which exports DiffOptions. Useful if you want to customize diff display.
- [dir | Config](./config/dir.md): Base directory to scan for the test files. You can specify this option to speed up test discovery if your root covers the whole project
- [disableConsoleIntercept | Config](./config/disableconsoleintercept.md): By default, Vitest automatically intercepts console logging during tests for extra formatting of test file, test title, etc.
- [env | Config](./config/env.md): Environment variables available on process.env and import.meta.env during tests. These variables will not be available in the main process (in glob...
- [environment | Config](./config/environment.md): The environment that will be used for testing. The default environment in Vitest
is a Node.js environment. If you are building a web application, y...
- [environmentOptions | Config](./config/environmentoptions.md): These options are passed to the setup method of the current environment. By default, you can configure options only for jsdom and happyDOM when you...
- [exclude | Config](./config/exclude.md): A list of glob patterns that should be excluded from your test files. These patterns are resolved relative to the root (process.cwd() by default).
- [execArgv | Config](./config/execargv.md): Pass additional arguments to node in the runner worker. See Command-line API | Node.js for more information.
- [expandSnapshotDiff | Config](./config/expandsnapshotdiff.md): Show full diff when snapshot fails instead of a patch.
- [expect | Config](./config/expect.md): The same as calling expect.hasAssertions() at the start of every test. This makes sure that no test will pass accidentally.
- [experimental | Config](./config/experimental.md): ::: tip FEEDBACK
Please leave feedback regarding this feature in a GitHub Discussion.
:::
- [fakeTimers | Config](./config/faketimers.md): Options that Vitest will pass down to @sinon/fake-timers when using vi.useFakeTimers().
- [fileParallelism | Config](./config/fileparallelism.md): Should all test files run in parallel. Setting this to false will override maxWorkers option to 1.
- [forceRerunTriggers | Config](./config/forcereruntriggers.md): Glob pattern of file paths that will trigger the whole suite rerun. When paired with the --changed argument will run the whole test suite if the tr...
- [globals | Config](./config/globals.md): By default, vitest does not provide global APIs for explicitness. If you prefer to use the APIs globally like Jest, you can pass the --globals opti...
- [globalSetup | Config](./config/globalsetup.md): Path to global setup files relative to project root.
- [hideSkippedTests | Config](./config/hideskippedtests.md): Hide logs for skipped tests
- [hookTimeout | Config](./config/hooktimeout.md): Default timeout of a hook in milliseconds. Use 0 to disable timeout completely.
- [includeSource | Config](./config/include-source.md): A list of glob patterns that match your in-source test files. These patterns are resolved relative to the root (process.cwd() by default).
- [include | Config](./config/include.md): A list of glob patterns that match your test files. These patterns are resolved relative to the root (process.cwd() by default).
- [includeTaskLocation | Config](./config/includetasklocation.md): Should location property be included when Vitest API receives tasks in reporters. If you have a lot of tests, this might cause a small performance ...
- [Configuring Vitest](./config/index.md): If you are using Vite and have a vite.config file, Vitest will read it to match with the plugins and setup as your Vite app. If you want to have a ...
- [isolate | Config](./config/isolate.md): Run tests in an isolated environment. This option has no effect on vmThreads and vmForks pools.
- [logHeapUsage | Config](./config/logheapusage.md): Show heap usage after each test. Useful for debugging memory leaks.
- [maxConcurrency | Config](./config/maxconcurrency.md): The maximum number of tests and hooks that can run at the same time when using test.concurrent or describe.concurrent.
- [maxWorkers | Config](./config/maxworkers.md): Defines the maximum concurrency for test workers. Accepts either a number or a percentage string.
- [mockReset | Config](./config/mockreset.md): Should Vitest automatically call vi.resetAllMocks() before each test.
- [mode | Config](./config/mode.md): Overrides Vite mode
- [name | Config](./config/name.md): Assign a custom name to the test project or Vitest process. The name will be visible in the CLI and UI, and available in the Node.js API via projec...
- [onConsoleLog | Config](./config/onconsolelog.md): Custom handler for console methods in tests. If you return false, Vitest will not print the log to the console. Note that Vitest ignores all other ...
- [onStackTrace | Config](./config/onstacktrace.md): Apply a filtering function to each frame of each stack trace when handling errors. This does not apply to stack traces printed by printConsoleTrace...
- [onUnhandledError | Config](./config/onunhandlederror.md): A custom callback for filtering unhandled errors that should not be reported. When an error is filtered out, it no longer affects the result of the...
- [open | Config](./config/open.md): Open Vitest UI automatically if it's enabled.
- [outputFile | Config](./config/outputfile.md): Write test results to a file when the --reporter=json, --reporter=html or --reporter=junit option is also specified.
By providing an object instead...
- [passWithNoTests | Config](./config/passwithnotests.md): Vitest will not fail, if no tests will be found.
- [pool | Config](./config/pool.md): Pool used to run tests in.
- [printConsoleTrace | Config](./config/printconsoletrace.md): Always print console traces when calling any console method. This is useful for debugging.
- [projects | Config](./config/projects.md): An array of projects.
- [provide | Config](./config/provide.md): Define values that can be accessed inside your tests using inject method.
- [reporters | Config](./config/reporters.md): This option defines a single reporter or a list of reporters available to Vitest during the test run.
- [resolveSnapshotPath | Config](./config/resolvesnapshotpath.md): Overrides default snapshot path. For example, to store snapshots next to test files:
- [restoreMocks | Config](./config/restoremocks.md): Should Vitest automatically call vi.restoreAllMocks() before each test.
- [retry | Config](./config/retry.md): Retry the test specific number of times if it fails.
- [root | Config](./config/root.md): Project root
- [runner | Config](./config/runner.md): Path to a custom test runner. This is an advanced feature and should be used with custom library runners. You can read more about it in the documen...
- [sequence | Config](./config/sequence.md): Options for how tests should be sorted.
- [server | Config](./config/server.md): Before Vitest 4, this option was used to define the configuration for the vite-node server.
- [setupFiles | Config](./config/setupfiles.md): Paths to setup files resolved relative to the root. They will run before each test file in the same process. By default, all test files run in para...
- [silent | Config](./config/silent.md): Silent console output from tests.
- [slowTestThreshold | Config](./config/slowtestthreshold.md): The number of milliseconds after which a test or suite is considered slow and reported as such in the results.
- [snapshotEnvironment | Config](./config/snapshotenvironment.md): Path to a custom snapshot environment implementation. This is useful if you are running your tests in an environment that doesn't support Node.js A...
- [snapshotFormat | Config](./config/snapshotformat.md): Format options for snapshot testing. These options are passed down to our fork of pretty-format. In addition to the pretty-format options we suppor...
- [snapshotSerializers | Config](./config/snapshotserializers.md): A list of paths to snapshot serializer modules for snapshot testing, useful if you want add custom snapshot serializers. See Custom Serializer for ...
- [strictTags | Config](./config/stricttags.md): Should Vitest throw an error if test has a tag that is not defined in the config to avoid silently doing something surprising due to mistyped names...
- [tags | Config](./config/tags.md): Defines all available tags in your test project. By default, if test defines a name not listed here, Vitest will throw an error, but this can be co...
- [teardownTimeout | Config](./config/teardowntimeout.md): Default timeout to wait for close when Vitest shuts down, in milliseconds
- [testNamePattern | Config](./config/testnamepattern.md): Run tests with full names matching the pattern.
If you add OnlyRunThis to this property, tests not containing the word OnlyRunThis in the test name...
- [testTimeout | Config](./config/testtimeout.md): Default timeout of a test in milliseconds. Use 0 to disable timeout completely.
- [typecheck | Config](./config/typecheck.md): Options for configuring typechecking test environment.
- [ui | Config](./config/ui.md): Enable Vitest UI.
- [unstubEnvs | Config](./config/unstubenvs.md): Should Vitest automatically call vi.unstubAllEnvs() before each test.
- [unstubGlobals | Config](./config/unstubglobals.md): Should Vitest automatically call vi.unstubAllGlobals() before each test.
- [update | Config](./config/update.md): Define snapshot update behavior.
- [vmMemoryLimit | Config](./config/vmmemorylimit.md): This option affects only vmForks and vmThreads pools.
- [watch | Config](./config/watch.md): Enable watch mode
- [watchTriggerPatterns | Config](./config/watchtriggerpatterns.md): Vitest reruns tests based on the module graph which is populated by static and dynamic import statements. However, if you are reading from the file...

## config/browser (22)

- [browser.api | Config](./config/browser/api.md): Configure options for Vite server that serves code in the browser. Does not affect test.api option. By default, Vitest assigns port 63315 to avoid ...
- [browser.commands | Config](./config/browser/commands.md): Custom commands that can be imported during browser tests from vitest/browser.
- [browser.connectTimeout | Config](./config/browser/connecttimeout.md): The timeout in milliseconds. If connection to the browser takes longer, the test suite will fail.
- [browser.detailsPanelPosition | Config](./config/browser/detailspanelposition.md): Controls the default position of the details panel in the Vitest UI when running browser tests.
- [browser.enabled | Config](./config/browser/enabled.md): Enabling this flag makes Vitest run all tests in a browser by default. If you are configuring other browser options via the CLI, you can use --brow...
- [browser.expect | Config](./config/browser/expect.md): Default options for the
toMatchScreenshot assertion.
These options will be applied to all screenshot assertions.
- [browser.headless | Config](./config/browser/headless.md): Run the browser in a headless mode. If you are running Vitest in CI, it will be enabled by default.
- [browser.instances | Config](./config/browser/instances.md): Defines multiple browser setups. Every config has to have at least a browser field.
- [browser.isolate | Config](./config/browser/isolate.md): Run every test in a separate iframe.
- [browser.locators | Config](./config/browser/locators.md): Options for built-in browser locators.
- [browser.orchestratorScripts | Config](./config/browser/orchestratorscripts.md): Custom scripts that should be injected into the orchestrator HTML before test iframes are initiated. This HTML document only sets up iframes and do...
- [Configuring Playwright](./config/browser/playwright.md): To run tests using playwright, you need to install the @vitest/browser-playwright npm package and specify its playwright export in the test.browser...
- [Configuring Preview](./config/browser/preview.md): ::: warning
The preview provider's main functionality is to show tests in a real browser environment. However, it does not support advanced browser...
- [browser.provider | Config](./config/browser/provider.md): The return value of the provider factory. You can import the factory from @vitest/browser-<provider-name> or make your own provider:
- [browser.screenshotDirectory | Config](./config/browser/screenshotdirectory.md): Path to the screenshots directory relative to the root.
- [browser.screenshotFailures | Config](./config/browser/screenshotfailures.md): Should Vitest take screenshots if the test fails.
- [browser.testerHtmlPath | Config](./config/browser/testerhtmlpath.md): A path to the HTML entry point. Can be relative to the root of the project. This file will be processed with transformIndexHtml hook.
- [browser.trace | Config](./config/browser/trace.md): Capture a trace of your browser test runs. You can preview traces with Playwright Trace Viewer.
- [browser.trackUnhandledErrors | Config](./config/browser/trackunhandlederrors.md): Enables tracking uncaught errors and exceptions so they can be reported by Vitest.
- [browser.ui | Config](./config/browser/ui.md): Should Vitest UI be injected into the page. By default, injects UI iframe during development.
- [browser.viewport | Config](./config/browser/viewport.md): Default iframe's viewport.
- [Configuring WebdriverIO](./config/browser/webdriverio.md): ::: info Playwright vs WebdriverIO
If you do not already use WebdriverIO in your project, we recommend starting with Playwright as it is easier to ...

## guide/advanced (4)

- [Advanced API](./guide/advanced/index.md): ::: warning
This guide lists advanced APIs to run tests via a Node.js script. If you just want to run tests, you probably don't need this. It is pr...
- [Custom Pool <Badge type="danger">advanced</Badge>](./guide/advanced/pool.md): ::: warning
This is an advanced, experimental and very low-level API. If you just want to run tests, you probably don't need this. It is primarily ...
- [Extending Reporters <Badge type="danger">advanced</Badge>](./guide/advanced/reporters.md): ::: warning
This is an advanced API. If you just want to configure built-in reporters, read the "Reporters" guide.
:::
- [Running Tests <Badge type="danger">advanced</Badge>](./guide/advanced/tests.md): ::: warning
This guide explains how to use the advanced API to run tests via a Node.js script. If you just want to run tests, you probably don't ne...

## guide/browser (6)

- [Component Testing | Guide](./guide/browser/component-testing.md): Component testing is a testing strategy that focuses on testing individual UI components in isolation. Unlike end-to-end tests that test entire use...
- [Browser Mode | Guide](./guide/browser/index.md): This page provides information about the browser mode feature in the Vitest API, which allows you to run your tests in the browser natively, provid...
- [Multiple Setups](./guide/browser/multiple-setups.md): You can specify several different browser setups using the browser.instances option.
- [Trace View](./guide/browser/trace-view.md): Vitest Browser Mode supports generating Playwright's trace files. To enable tracing, you need to set the trace option in the test.browser configura...
- [Visual Regression Testing](./guide/browser/visual-regression-testing.md): Vitest can run visual regression tests out of the box. It captures screenshots
of your UI components and pages, then compares them against referenc...
- [Why Browser Mode | Browser Mode](./guide/browser/why.md): We developed the Vitest browser mode feature to help improve testing workflows and achieve more accurate and reliable test results. This addition t...

## guide (31)

- [cli-generated](./guide/cli-generated.md): Root path
- [Command Line Interface | Guide](./guide/cli.md): Start Vitest in the current directory. Will enter the watch mode in development environment and run mode in CI (or non-interactive terminal) automa...
- [Common Errors | Guide](./guide/common-errors.md): If you receive an error that module cannot be found, it might mean several different things:
- [Comparisons with Other Test Runners | Guide](./guide/comparisons.md): Jest took over the Testing Framework space by providing out-of-the-box support for most JavaScript projects, a comfortable API (it and expect), and...
- [Coverage | Guide](./guide/coverage.md): Vitest supports Native code coverage via v8 and instrumented code coverage via istanbul.
- [Debugging | Guide](./guide/debugging.md): :::tip
When debugging tests you might want to use following options:
- [Test Environment | Guide](./guide/environment.md): Vitest provides environment option to run code inside a specific environment. You can modify how environment behaves with environmentOptions option.
- [Extending Matchers | Guide](./guide/extending-matchers.md): Since Vitest is compatible with both Chai and Jest, you can use either the chai.use API or expect.extend, whichever you prefer.
- [Features | Guide](./guide/features.md): Vite's config, transformers, resolvers, and plugins. Use the same setup from your app to run the tests.
- [Test Filtering | Guide](./guide/filtering.md): Filtering, timeouts, concurrent for suite and tests
- [IDE Integrations | Guide](./guide/ide.md): GitHub | VS Code Marketplace
- [Improving Performance](./guide/improving-performance.md): By default Vitest runs every test file in an isolated environment based on the pool:
- [In-Source Testing | Guide](./guide/in-source.md): Vitest provides a way to run tests within your source code along side the implementation, similar to Rust's module tests.
- [Getting Started | Guide](./guide/index.md): Vitest (pronounced as "veetest") is a next generation testing framework
powered by
Vite.
- [Test Run Lifecycle | Guide](./guide/lifecycle.md): Understanding the test run lifecycle is essential for writing effective tests, debugging issues, and optimizing your test suite. This guide explain...
- [Migration Guide | Guide](./guide/migration.md): Migrating to Vitest 3.0 | Migrating to Vitest 2.0
- [Mocking | Guide](./guide/mocking.md): When writing tests it's only a matter of time before you need to create a "fake" version of an internal — or external — service. This is commonly r...
- [Open Telemetry Support <Experimental />](./guide/open-telemetry.md): ::: tip FEEDBACK
Please, leave feedback regarding this feature in a GitHub Discussion.
:::
- [Parallelism | Guide](./guide/parallelism.md): By default, Vitest runs test files in parallel. Depending on the specified pool, Vitest uses a different mechanism to parallelize test files:
- [Profiling Test Performance](./guide/profiling-test-performance.md): When you run Vitest it reports multiple time metrics of your tests:
- [Test Projects | Guide](./guide/projects.md): ::: tip Sample Project
- [Recipes | Guide](./guide/recipes.md): You can speed up your test run by disabling isolation for specific set of files by specifying isolate per projects entries:
- [Reporters | Guide](./guide/reporters.md): Vitest provides several built-in reporters to display test output in different formats, as well as the ability to use custom reporters. You can sel...
- [Snapshot | Guide](./guide/snapshot.md): <CourseLink href="https://vueschool.io/lessons/snapshots-in-vitest?friend=vueuse">Learn Snapshot by video from Vue School</CourseLink>
- [Test Annotations | Guide](./guide/test-annotations.md): Vitest supports annotating your tests with custom messages and files via the context.annotate API. These annotations will be attached to the test c...
- [Test Context | Guide](./guide/test-context.md): Inspired by Playwright Fixtures, Vitest's test context allows you to define utils, states, and fixtures that can be used in your tests.
- [Test Tags | Guide](./guide/test-tags.md): Tags let you label tests so you can filter what runs and override their options when needed.
- [Testing Types | Guide](./guide/testing-types.md): ::: tip Sample Project
- [Vitest UI | Guide](./guide/ui.md): Powered by Vite, Vitest also has a dev server under the hood when running the tests. This allows Vitest to provide a beautiful UI to view and inter...
- [Using Plugins | Guide](./guide/using-plugins.md): Vitest can be extended using plugins, similar to how Vite plugins work. This allows you to enhance and customize Vitest's functionality by using th...
- [Why Vitest | Guide](./guide/why.md): :::tip NOTE
This guide assumes that you are familiar with Vite. A good way to start learning more is to read the Why Vite Guide, and Next generatio...

## guide/examples (2)

- [projects-workspace](./guide/examples/projects-workspace.md)
- [promise-done](./guide/examples/promise-done.md)

## guide/mocking (8)

- [Mocking Classes](./guide/mocking/classes.md): You can mock an entire class with a single vi.fn call.
- [Mocking Dates](./guide/mocking/dates.md): Sometimes you need to be in control of the date to ensure consistency when testing. Vitest uses @sinonjs/fake-timers package for manipulating timer...
- [Mocking the File System](./guide/mocking/file-system.md): Mocking the file system ensures that the tests do not depend on the actual file system, making the tests more reliable and predictable. This isolat...
- [Mocking Functions](./guide/mocking/functions.md): Mocking functions can be split up into two different categories: spying and mocking.
- [Mocking Globals](./guide/mocking/globals.md): You can mock global variables that are not present with jsdom or node by using vi.stubGlobal helper. It will put the value of the global variable i...
- [Mocking Modules](./guide/mocking/modules.md): Before mocking a "module", we should define what it is. In Vitest context, the "module" is a file that exports something. Using plugins, any file c...
- [Mocking Requests](./guide/mocking/requests.md): Because Vitest runs in Node, mocking network requests is tricky; web APIs are not available, so we need something that will mimic network behavior ...
- [Timers](./guide/mocking/timers.md): When we test code that involves timeouts or intervals, instead of having our tests wait it out or timeout, we can speed up our tests by using "fake...
