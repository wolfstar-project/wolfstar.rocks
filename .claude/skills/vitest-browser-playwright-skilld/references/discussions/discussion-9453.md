---
number: 9453
title: How do you use browser mode with React components that have LESS stylesheets?
category: "Q&A"
created: 2026-01-15
url: "https://github.com/vitest-dev/vitest/discussions/9453"
upvotes: 1
comments: 2
answered: true
---

# How do you use browser mode with React components that have LESS stylesheets?

I'm testing out browser mode for the first time and I have it working for a very simple React component (with no styles). However, when I try to run a test for a component with a LESS stylesheet, I get this error:

```
5:42:14 PM [vite] Internal server error: [less] ENOENT: no such file or directory, open 'C:\Users\kgetz\Work\event-viewer\geiger-lib\geiger-devices\npm:\@arista\styles\dist\flexbox'
  Plugin: vite:css
  File: C:/Users/kgetz/Work/event-viewer/geiger-lib/geiger-devices/src/components/DeviceIssues/styles.less:1:0
  1  |  @import 'npm://@arista/styles/dist/flexbox';
     |  ^
  2  |
  3  |  .device-issues {
```

Basically, here's what's happening:

1. The test file imports the React component
2. The React component imports a local `styles.less` LESS stylesheet
3....

---

## Accepted Answer

Ah, I think I actually spoke too soon. I forgot that we use these same kinds of imports in our Vite apps, so I tracked down our shared config and realized that the magic incantation for the config is slightly different. This works in Vitest too:

```
  css: {
    preprocessorOptions: {
      less: {
        plugins: [new NpmImportPlugin()],
      },
    },
  },
```