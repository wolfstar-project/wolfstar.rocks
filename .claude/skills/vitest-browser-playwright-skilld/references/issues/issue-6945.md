---
number: 6945
title: "Coverage page is broken in the html report for @vitest/ui"
type: bug
state: closed
created: 2024-11-21
url: "https://github.com/vitest-dev/vitest/issues/6945"
reactions: 13
comments: 6
labels: "[feat: ui, p3-minor-bug]"
---

# Coverage page is broken in the html report for @vitest/ui

### Describe the bug

When using the 'html' reporter for vitest, with the html coverage reporter also enabled, the UI contains a button to load the coverage report in an iframe, but the iframe fails to load because it is loaded from '/coverage/index.html'.

There are really two problems here.
1. By iframing in the url starting with a `/` the browser will attempt to load `http://my-host.io/coverage/index.html` regardless of the url route your report is served from. Instead, it might be preferrable to use a relative path: `http://my-host.io/report/12345/coverage/index.html` etc.
2. With the default configured options, the two reports are generated in separate directories: `./coverage` and `./html` This makes it harder to bundle all the report artifacts because they are in separate places.

Regarding #2 it would be nice if the html report directory was automatically copied into the vitest html report directory and just referenced via a relative url if the html coverage reporter is enabled. That would solve both issues at once for me without requiring extra configuration. That is my ideal fix, but I can also see the following being useful:

```
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text-summary', ['html', {subdir: '../vitest-report/coverage'}]],
    },
    reporters: [['html', {outputFile: './vitest-report/index.html'}]],
  },
});
```

The above configuration correctly places the html coverage directory inside of the vitest html report directory, but the paths are not resolved correctly still, Additional work would be needed to support this:


Related Issue: #6144 

The above issue appears related in that they are trying to ultimately solve the same problem of the coverage not working depending on how the page is accessed or hosted, but I think the problems are deeper than what is described in...

---

## Top Comments

**@daniseijo** (+1):

Hi, I know this issue was open some time ago but I just encountered this problem and it seems like it's not solved yet.

I managed to solve this problem with a little tweak. Instead of using the `subdir` field from the `html` reporter, I changed the whole `reportsDirectory` to the `vitest-report` dir. Then, if I want another report out of there, I change it with the `file` option. In the following example I'm doing that last part for the cobertura report:

```typescript
import {defineConfig} from 'vitest/config'

...

**@t29gupta**:

> Hi, I know this issue was open some time ago but I just encountered this problem and it seems like it's not solved yet.
> 
> I managed to solve this problem with a little tweak. Instead of using the `subdir` field from the `html` reporter, I changed the whole `reportsDirectory` to the `vitest-report` dir. Then, if I want another report out of there, I change it with the `file` option. In the following example I'm doing that last part for the cobertura report:
> 
> import {defineConfig} from 'vitest/config'
> 
> export default defineConfig({
>   test: {
>     coverage: {
>       enabled: true...

**@Fanna1119**:

I have this same issue

when clicking on coverage in the ui:
`Uncaught ReferenceError: __vite_ssr_exportName__ is not defined` 

```ts
const vitestConfig = defineVitestConfig({
  base: "/",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.ts",
    coverage: {
      reportsDirectory: "./static/coverage",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      provider: "v8",
    },
  },
});

export default ({ mode }: { mode: string }) => {
  if (mode === "test") return mergeConfig(shared, vitestConfig);
  throw new Error("Mode must be 'client', 'server', or 'test'");
};

...