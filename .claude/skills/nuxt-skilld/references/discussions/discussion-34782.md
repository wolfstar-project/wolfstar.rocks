---
number: 34782
title: "Nuxt dependencies: caret range IS NOT safe"
category: General
created: 2026-04-06
url: "https://github.com/nuxt/nuxt/discussions/34782"
upvotes: 2
comments: 1
answered: false
---

# Nuxt dependencies: caret range IS NOT safe

Hi!
Today my ci-cd was broken during regular `npm i` command.
NPM log file didn't give anything clear.
I started to dig into the problem by installing npm packages one at a time.
And found, that:
`nuxt` package has a dependency `@nuxt/devtools`.
And `@nuxt/devtools` has a dependency:
```
"simple-git": "^3.33.0",
```
This simple-git package was republishing packages to npm, so somehow npm/yarn can't install all dependencies of nuxt.

After 15 minutes, everything fixed itself without my actions.

And now Nuxt installs this package:
https://www.npmjs.com/package/@simple-git/args-pathspec
Last publish: 6 minutes ago, Downloads (Last 7 Days): 0

This does not mean that this particular package is dangerous.
But this means that "thanks to" caret range, a dangerous version of an...

---

## Top Comments

**@OrbisK** [maintainer]:

> This simple-git package was republishing packages to npm, so somehow npm/yarn can't install all dependencies of nuxt.

Looks like the latest `simple-git` was broken at the time: https://github.com/steveukx/git-js/releases

> And now Nuxt installs this package:
https://www.npmjs.com/package/@simple-git/args-pathspec
Last publish: 6 minutes ago, Downloads (Last 7 Days): 0

Nuxt does not pin packages so the user can decide there update strategy (which is quite normal with transitive dependencies). 

> But this means that "thanks to" caret range, a dangerous version of any package with...