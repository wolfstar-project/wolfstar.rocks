---
number: 18
title: "[bug] (possible) Cloudflare Observability - Duplicate Logs"
type: bug
state: closed
created: 2026-01-30
url: "https://github.com/HugoRCD/evlog/issues/18"
reactions: 0
comments: 4
labels: "[bug]"
---

# [bug] (possible) Cloudflare Observability - Duplicate Logs

### Description

Noticed in my Cloudflare Observability we are duplicating logs. Cloudflare logs the request (with a unique requestId) and THEN shows a log for evlog.

<img width="1368" height="428" alt="Image" src="https://github.com/user-attachments/assets/3e67b151-b51b-4477-859a-b350e87950ea" />

These two logs are from the same request but one shows a Cloudflare generated requestId and one shows an evlog generated requestId.

I Noticed the requestId produced by evlog is colliding with the Cloudflare logs, causing what I'm *assuming* to be the duplicate log.

I haven't tested this thoroughly but wanted to get your feedback on this.

...

---

## Top Comments

**@HugoRCD** [maintainer]:

Thanks for the issue. I haven't tested it on Cloudflare yet, but I think I'll try to make the logs smarter on platforms like Cloudflare, Vercel, etc

**@HugoRCD** [maintainer]:

@saltytostitos You can try with the latest version, the package now has support for workers!

**@HugoRCD** [maintainer]:

I'm closing the issue for now, as it's probably been resolved, but feel free to reopen it