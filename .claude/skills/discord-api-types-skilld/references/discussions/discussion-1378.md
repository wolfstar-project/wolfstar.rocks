---
number: 1378
title: What type do I use for when the API returns an error?
category: "Q&A"
created: 2025-09-25
url: "https://github.com/discordjs/discord-api-types/discussions/1378"
upvotes: 1
comments: 1
answered: false
---

# What type do I use for when the API returns an error?

I am writing an application using this lovely library and am attempting to improve my error handling. When I am attempting to retrieve a user, a successful response can be interpreted as APIUser.

However, I am having trouble identifying what error to use when interpreting an error like this. Any tips?

...

---

## Top Comments

**@vladfrangu** [maintainer]:

You're probably looking for the `RESTError` type