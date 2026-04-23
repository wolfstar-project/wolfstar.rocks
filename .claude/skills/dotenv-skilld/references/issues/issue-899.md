---
number: 899
title: Why am I getting ads in my terminal?
type: other
state: closed
created: 2025-07-31
url: "https://github.com/motdotla/dotenv/issues/899"
reactions: 13
comments: 2
---

# Why am I getting ads in my terminal?

After a recent maintenance, we started seeing the following in our terminal output:

```bash
[dotenv@17.2.1] injecting env (0) from .env -- tip: 📡 auto-backup env with Radar: https://dotenvx.com/radar
```

We don’t depend on dotenv directly, so we can’t easily use the quiet option without injecting additional config or environment variables throughout our codebase or tooling.

A few concerns:

- This kind of promotional message (especially for a paid product) should not be shown by default.
- Tying debug output (e.g. which .env file was loaded) and ads to the same quiet flag is not a great design. Developers often want to see diagnostic messages without being served marketing content.
- There should be a separate, explicit way to disable these tips entirely.

Please consider separating promotional messages from runtime logs and turning them off by default, or at least providing a dedicated opt-out mechanism.

---

## Top Comments

**@motdotla** [maintainer] (+14):

You can use `DOTENV_CONFIG_QUIET=true` to opt-out. https://github.com/motdotla/dotenv/blob/master/CHANGELOG.md#1720-2025-07-09

You can also just stay on the old version 16. It's ten years mature and stable.