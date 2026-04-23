---
number: 696
title: How to stop process.env from removing characters from value
category: "Q&A"
created: 2022-11-15
url: "https://github.com/motdotla/dotenv/discussions/696"
upvotes: 1
comments: 1
answered: true
---

# How to stop process.env from removing characters from value

So If I have a password with a "password#" at the end.

console.log(process.env.MY_PASSWORD) prints out "password" (without the #)  Is there an option to not remove these characters ?

---

## Accepted Answer

nevermind I just seen the part about wrapping it in quotes.