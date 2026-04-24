---
number: 872
title: 16.6.0 is producing extra log messages.
type: other
state: closed
created: 2025-06-26
url: "https://github.com/motdotla/dotenv/issues/872"
reactions: 10
comments: 10
---

# 16.6.0 is producing extra log messages.

This is a command line using dotenv, it now produces this output since 16.6.0

```
>stepzen whoami --domain
[dotenv@16.6.0] injecting env (2) from .env
[dotenv@16.6.0] injecting env (2) from .env
us-east-a.ibm.stepzen.net
```

previously those lines did not exist.

Looking at the commits I see various log related changes, so it seems likely it's a doting change that is causing this.

No idea if it's the command line tool `stepzen` using dotenv incorrectly, or dotenv is not meant to be producing this output, but it's a change in behavior.

---

## Top Comments

**@motdotla** [maintainer] (+2):

Apologies everyone and thank you for using dotenv.

I've just released `16.6.1` that defaults `quiet` to true - returning to the prior behavior of no default logging. (Projects like gemini-cli should get the patch shortly)

See the changelog:

<img width="1875" alt="Image" src="https://github.com/user-attachments/assets/ceabf360-5011-437a-8f96-728d1676f6d6" />

**@RuBiCK** (+4):

@motdotla the new version broke our production deployments so I agree this should be a major version and roll back if possible  🏻 

**@zbigg** (+1):

Back in the times, there was convention of using `stderr` for diagnostic messages. Maybe output logs there by default?
They wouldn't be captured by standard `>` or '|' shell redirection.

I looked at `dotenvx` and it seems like it also outputs "logs" like this to `stdout` (and it's true for 90% of JS tools unfortunately, including `npm`). 

Just two cents.
