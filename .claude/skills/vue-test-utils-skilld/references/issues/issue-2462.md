---
number: 2462
title: "Bug: ReferenceError: Vue is not defined - Missing exports declaration ?"
type: bug
state: closed
created: 2024-06-27
url: "https://github.com/vuejs/test-utils/issues/2462"
reactions: 2
comments: 8
labels: "[bug]"
---

# Bug: ReferenceError: Vue is not defined - Missing exports declaration ?




**Describe the bug**

Hello, I'm kind of reopening #234 here as I'm having some trouble upgrading a software to Vue3 which was running completely fine in Vue 2 with Karma test runner and Vue Test Utils V1.x latest version.

Once everything is updated, unit tests can't run anymore and a `ReferenceError: Vue is not defined` is thrown.
I tried to follow what was written in this post and investigate the different possibilities and found that the easiest way around was to simply add a "module" exports inside the `package.json` of VTU like this:

![image](https://github.com/vuejs/test-utils/assets/57899415/67735ebf-856d-4ff2-8da2-13...

---

## Top Comments

**@lmiller1990** [maintainer]:

We already have the module export, it's on the very first line in your screenshot. I thought the bundler would look there - it certainly should.

**What version of webpack are you using**? I wonder if an old webpack version does not respect the top level `module`.

https://github.com/vuejs/test-utils/blob/844f5088ff5cde60c578b2aa5956d38901132d43/package.json#L8

**@lmiller1990** [maintainer]:

What does your project have for `type` in `package.json`?

I'm hesitant to merge this until we understand the core issue. This package has millions of downloads for week - it's not really ideal to merge a quick fix for one person's project, until we actually understand what's going on.

**@lmiller1990** [maintainer]:

No problem, will leave this open. We can merge webpack specific code as long as we are confident it won't break other bundlers, webpack is still the most widely used bundler. I know webpack often overreaches and does some weird things, mainly because it was doing that before any of these standards really existed.

Let me know if you need any more info or if you are ready for a review - if we could just try the patch against some other popular tool chains / boilerplates, that'd be fine.