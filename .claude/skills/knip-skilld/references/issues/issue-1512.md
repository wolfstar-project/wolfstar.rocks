---
number: 1512
title: " `@vitest/coverage-v8` is marked as unused in Storybook with vitest"
type: bug
state: open
created: 2026-02-05
url: "https://github.com/webpro-nl/knip/issues/1512"
reactions: 0
comments: 4
labels: "[bug]"
---

#  `@vitest/coverage-v8` is marked as unused in Storybook with vitest

### Prerequisites

- [x] I'm using the latest version
- [x] I've read the relevant documentation
- [x] I've searched for existing issues
- [x] I've checked the list of known issues
- [x] I've read the issue reproduction guide

### Reproduction url

https://codesandbox.io/p/devbox/xm2rtv

### Reproduction access

- [x] I've made sure the reproduction is publicly accessible

### Description of the issue

Created a default `pnpm create vite` with react, and `pnpm create storybook` with tests and coverage

```
pnpm run knip

> workspace@0.0.0 knip /project/workspace
> knip

...

---

## Top Comments

**@webpro** [maintainer]:

A PR is always welcome, but let's first make sure we're on the same page here.

Is it actually a false positive? How is coverage using v8 referenced/used in this setup?

**@webpro** [maintainer]:

Maybe if some specific storybook/vitest dependency is installed, we could make the coverage dependency optional?

**@StyleShit**:

Ah sorry, I was too distracted creating the reproduction environment and forgot to explain  

So, Storybook allows using coverage in the UI when you have their vitest addon installed (screenshot taken from docs):

<img width="490" height="252" alt="Image" src="https://github.com/user-attachments/assets/dd07a24c-688e-41f0-a89d-92a15ded44dd" />


...