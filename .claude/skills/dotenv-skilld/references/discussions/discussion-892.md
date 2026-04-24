---
number: 892
title: quiet flag must be true by default
category: General
created: 2025-07-18
url: "https://github.com/motdotla/dotenv/discussions/892"
upvotes: 1
comments: 1
answered: false
---

# quiet flag must be true by default

I’ve been using dotenv for years and was unpleasantly surprised by the unwanted and unsolicited logging after the recent update. I’m fine with logging — as long as I, and only I, control what gets logged and when. I shouldn't have to modify the source code just to suppress logs. Logging should be off by default.
For now, I will certainly downgrade to the previous version. If this behavior remains, I see no choice but to stop using dotenv entirely.

P.S. Closing issue discussions like this one — https://github.com/motdotla/dotenv/issues/876 — is not the best way to engage with developer feedback.

---

## Top Comments

**@motdotla** [maintainer]:

You can set a global `DOTENV_CONFIG_QUIET=true` variable on your machine and/or use `config({quiet})`. 

And yes, staying on the old version is also perfectly fine. It's very mature.