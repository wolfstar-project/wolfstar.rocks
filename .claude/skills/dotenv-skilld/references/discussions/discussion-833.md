---
number: 833
title: "why not just use $ instead of (?:$|$) in the line regex?"
category: General
created: 2024-07-06
url: "https://github.com/motdotla/dotenv/discussions/833"
upvotes: 1
comments: 0
answered: false
---

# why not just use $ instead of (?:$|$) in the line regex?

why not just 
```js
const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?$/mg
```
instead of 
```js
const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg
```
I notice the change came  from here:
https://github.com/motdotla/dotenv/commit/3abdddb38bad2a5480efd119fcaa88849d23f47f