---
number: 873
title: "Unwanted log: [dotenv@16.6.0] injecting env (20) from .env on require"
type: other
state: closed
created: 2025-06-27
url: "https://github.com/motdotla/dotenv/issues/873"
reactions: 4
comments: 4
---

# Unwanted log: [dotenv@16.6.0] injecting env (20) from .env on require

After upgrading to dotenv@16.6.0, our application started logging the following message on startup:

`[dotenv@16.6.0] injecting env (20) from .env
`

This log is new and was not present in previous versions. It appears even when we do not want any console output from dotenv, which affects clean CLI output and logging in production environments.

This behavior seems to be introduced in version 16.6.0. In previous versions, calling `require('dotenv').config()` did not emit any console logs by default.

Expected behavior:
- No logs should be printed by default.
- Logging should be opt-in via an explicit debug or verbose flag.

...

---

## Top Comments

**@motdotla** [maintainer] (+1):

Released patch `16.6.1` to return to prior behavior - `quiet` defaults to true.

<img width="1875" alt="Image" src="https://github.com/user-attachments/assets/eb0158e4-759a-4dbf-adda-fa641282447a" />

**@sefinek** (+2):

I honestly don't know why `quiet` is now set to `true`. What's the point?

**@alexwiese** (+1):

> I honestly don't know why `quiet` is now set to `true`. What's the point?

You can set it to `false` if you want the logging 