---
number: 73
title: "[feature] Support `status` / `statusText` alongside deprecated `statusCode` / `statusMessage` (Nuxt v4.3+ & v5)"
type: bug
state: closed
created: 2026-02-13
url: "https://github.com/HugoRCD/evlog/issues/73"
reactions: 0
comments: 1
labels: "[bug, enhancement]"
---

# [feature] Support `status` / `statusText` alongside deprecated `statusCode` / `statusMessage` (Nuxt v4.3+ & v5)

### Description

Hey @HugoRCD

First of all, thank you so much for this amazing library — and for the super fast PR adding logs to the wide event, really appreciated 

Just a small note: since Nuxt v4.3.0, `statusCode` and `statusMessage` are deprecated in favor of `status` and `statusText` (Web API naming alignment). The old properties still work for now but are marked as deprecated ahead of nuxt v5.

Release note:
https://github.com/nuxt/nuxt/releases/tag/v4.3.0

It might be worth adding support for status and statusText here as well, while keeping backward compatibility:
https://github.com/HugoRCD/evlog/blob/main/packages/evlog/src/logger.ts

Thanks again for your work — really admire what you're building.

---

## Top Comments

**@XStarlink**:

Sorry I selected bug but it's a feature request..