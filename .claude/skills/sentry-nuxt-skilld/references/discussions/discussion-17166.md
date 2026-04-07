---
number: 17166
title: Nested Frameworks SDK Support?
category: "Q&A"
created: 2025-07-25
url: "https://github.com/getsentry/sentry-javascript/discussions/17166"
upvotes: 2
comments: 1
answered: false
---

# Nested Frameworks SDK Support?

Hello! It seems like there might have a start to this in #9188 but I figured I would check back in case the answer has changed, and because this situation is a bit different. We have a large application built in SolidStart which within it has some client-side bridge code to allow a React application to run inside of it. Please note these are not just two web applications both running on the same page; the React render function is called inside of the Solid.js render code (which appears in stack traces and such, and for that reason might affect tracing?). We would love to get the full SolidStart SDK support working, as well as the nice React SDK integration for that sub-application.

My best understanding is that I could follow the SolidStart SDK setup process normally (https://docs.sentr...

---

## Top Comments

**@mydea** [maintainer] (+1):

Hey, I think what you lined out should work. `@sentry/react` `init()` does not do much special stuff, as you pointed out, so I believe this should all play together reasonably well!