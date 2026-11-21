---
title: "Migrated authentication to Better Auth"
description: "Replaced the hand-rolled Discord OAuth flow and its custom CSRF state with a single audited auth library."
date: "2026-07-17"
kind: new
authors:
    - name: RedStar
      username: RedStar071
      to: https://x.com/redstar071
---

Discord sign-in, session refresh, and token handling all run through Better Auth now, replacing the custom
`oauth-state`/`verify-state` flow this project maintained by hand.
