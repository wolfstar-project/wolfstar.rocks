---
number: 900
title: Is there an option to silence the ads?
type: other
state: closed
created: 2025-08-01
url: "https://github.com/motdotla/dotenv/issues/900"
reactions: 5
comments: 2
---

# Is there an option to silence the ads?

I started seeing these ads appear:

`[dotenv@17.2.1] injecting env (0) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit`.

Is there a way to disable these?

---

## Top Comments

**@mindplay-dk** (+19):

@beeman `require('node:process').loadEnvFile()` fixed it for me. 


**@motdotla** [maintainer] (+2):

yes two different ways: https://github.com/motdotla/dotenv/blob/master/CHANGELOG.md#1720-2025-07-09