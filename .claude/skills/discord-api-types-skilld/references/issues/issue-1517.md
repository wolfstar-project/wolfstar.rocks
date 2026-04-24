---
number: 1517
title: "Missing attribute 'invite_cover_image' on type GatewayActivityAssets ts(2353)"
type: bug
state: closed
created: 2026-02-06
url: "https://github.com/discordjs/discord-api-types/issues/1517"
reactions: 0
comments: 0
labels: "[bug]"
---

# Missing attribute 'invite_cover_image' on type GatewayActivityAssets ts(2353)

### Issue description

The property 'invite_cover_image' does not exist on the type GatewayActivityAssets stored in `payloads/v10/gateway.ts`.

https://github.com/discordjs/discord-api-types/blob/6df197ac4774cc386be383e5a33222c605c5f84d/payloads/v10/gateway.ts#L350-L355

We believe that it would be beneficial for the resolution for this bug to also convert these types to an interface for a better solution. See the below linked PR for more info.

This bug is currently blocking the below linked PR as this is a requirement for the structure that depends on this.

Also see: https://github.com/discordjs/discord.js/pull/11411#discussion_r2775326576

### Code sample

```typescript
//lang: ts
import type { GatewayActivityAssets } from 'discord-api-types/v10';

/**
 * Object literal may only specify known properties, and 'invite_cover_image' does not exist in type
 * 'Partial<Record<"large_image" | "large_text" | "large_url" | "small_image" | "small_text" | "small_url",
 * string>>'. ts(2353)
 */

...