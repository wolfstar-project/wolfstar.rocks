---
number: 838
title: .env not used when running test
category: "Q&A"
created: 2024-05-05
url: "https://github.com/nuxt/test-utils/discussions/838"
upvotes: 1
comments: 1
answered: true
---

# .env not used when running test

Hey ! I'm new to vitest and when I run a basic test I have those messages

```
Missing supabase url, set it either in `nuxt.config.js` or via env variable
Missing supabase anon key, set it either in `nuxt.config.js` or via env variable
```

Running test with nuxt context throw me errors due to .env not setup

When i `pnpm dev`, everything is setup correctly (.env is setup & nuxt.config)

I tried 
- to search on this PR, so I found there was a dotenv option on vitest.config like here - (DotenvOptions)
- use .env.test

Please if you have an i...

---

## Accepted Answer

**@TheAlexLichter** [maintainer]:

@max13h Use a file called `.env.test` and put your env vars in there :) Make sure they are used in your "actual application" in the same way.