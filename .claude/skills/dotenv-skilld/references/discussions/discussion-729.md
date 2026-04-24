---
number: 729
title: breaking a long line
category: "Q&A"
created: 2023-04-01
url: "https://github.com/motdotla/dotenv/discussions/729"
upvotes: 1
comments: 1
answered: true
---

# breaking a long line

Hi.
Is there a way to declare a variable over multiple lines, then have dotenv concatenate it back to a single line?
sth like:
```
VAR="""this is a v
ery looooooong value, whi
ch should be evaluated to a single, non-
broken line"""
```
and when evaluated in code:
```
let v=process.env.VAR;
//v="this is a very looooooong value and which should be evaluated to a single, non-broken line"
```

---

## Accepted Answer

**@motdotla** [maintainer]:

No, there is no way to do this. No plans for it either at this time, unfortunately.