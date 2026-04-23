---
number: 583
title: GuildFeature is not a two-way enum
type: feature
state: open
created: 2022-09-05
url: "https://github.com/discordjs/discord-api-types/issues/583"
reactions: 0
comments: 5
labels: "[feature request]"
---

# GuildFeature is not a two-way enum

**Please describe the problem you are having in as much detail as possible:**

Many of the enums exported from discord-api-types are two-way enums, meaning that you can pass a key into the enum, and than that result back into the enum again to get the original key. This is true of the `ChannelType` enum for example, which has both the integer and string values as keys.

However, the `GuildFeature` enum only has the PascalCase values as keys, with the SCREAMING_SNAKE_CASE values missing from the keys. This means that you cannot convert the snake case values back to the pascal case values using the enum.

**Include a reproducible code sample here, if possible:**

```js
import { ChannelType, GuildFeature } from 'discord-api-types';

console.log(ChannelType[ChannelType[0]]); // 0
console.log(GuildFeature[GuildFeature['Banner']]); // undefined
```...