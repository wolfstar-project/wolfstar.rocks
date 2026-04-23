---
number: 1522
title: HTTP 204 route result types should be void instead of never
type: bug
state: open
created: 2026-02-13
url: "https://github.com/discordjs/discord-api-types/issues/1522"
reactions: 0
comments: 1
labels: "[bug]"
---

# HTTP 204 route result types should be void instead of never

### Issue description

The implications of the never type means you will never be able to observe the type which isn't true in the case of 204 as those are usually represented through undefined. 204 is an OK status code, so throwing an Exception to satisfy the semantics of never doesn't make sense.

In the Typescript handbook, they describe it as appropriate for use in methods which always return an exception as you cannot observe the value even in try catch blocks. The only exception to this case I can think of is process.exit() being typed as returning never, but that also makes sense as you cannot observe that return type.

...

---

## Top Comments

**@vladfrangu** [maintainer]:

PRs welcome