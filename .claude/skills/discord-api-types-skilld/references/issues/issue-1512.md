---
number: 1512
title: "Property 'topic' does not exist on type 'APIGuildChannel<GuildChannelType>'."
type: bug
state: closed
created: 2026-02-04
url: "https://github.com/discordjs/discord-api-types/issues/1512"
reactions: 0
comments: 2
labels: "[bug]"
---

# Property 'topic' does not exist on type 'APIGuildChannel<GuildChannelType>'.

### Issue description

TypeScript just complaining about how 'topic' doesn't exist

### Code sample

```typescript
const channel = channels.find(c => c.topic === "test");
// Tried this and still doesn't work
const channel = channels.find(c => {
    if (c.type !== ChannelType.GuildText) return false;
    return c.topic === "test";
});
```

### Package version

discord-api-types@0.38.38

### Runtime

Node.js

### Runtime version

v24.2.0

### Priority this issue should have

Medium (should be fixed soon)

---

## Top Comments

**@Qjuh** [maintainer]:

What is `channels` typed as here? I assume it's `APIGuildChannel` judging by the error in your issue title, which is the base interface and can never be inferred to have additional properties. You'd probably want to type it as `RESTAPIGuildChannelResolvable` which is a union of all GuildChannel types instead.

**@Jforjo**:

> What is `channels` typed as here? I assume it's `APIGuildChannel` judging by the error in your issue title, which is the base interface and can never be inferred to have additional properties. You'd probably want to type it as `RESTAPIGuildChannelResolvable` which is a union of all GuildChannel types instead.

This worked, thanks