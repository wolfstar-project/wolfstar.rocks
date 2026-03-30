---
number: 473
title: "improve: do not warn about localhost in dev mode"
type: other
state: closed
created: 2025-09-02
url: "https://github.com/harlan-zw/nuxt-seo/issues/473"
reactions: 4
comments: 2
---

# improve: do not warn about localhost in dev mode

Would be nice if the following check would be omitted in dev mode:

<img width="875" height="37" alt="Image" src="https://github.com/user-attachments/assets/abcc0956-fb43-4258-a160-3e59e38c2169" />

I guess it's quite common to use localhost as the page URL when developing?

---

## Top Comments

**@harlan-zw** [maintainer] (+1):

Thanks, fixed in https://github.com/harlan-zw/nuxt-site-config/commit/fea63c859691401a073f60f33c89a51664b77ff6

**@TheDutchCoder**:

I would like to see this removed from dev mode as well.
We use env vars fort all these settings and locally things are pointing to localhost for obvious reason.

There's no need for a warning here.