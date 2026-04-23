---
number: 1219
title: UserFlags should include 0 as a member
type: bug
state: closed
created: 2025-04-12
url: "https://github.com/discordjs/discord-api-types/issues/1219"
reactions: 0
comments: 1
labels: "[bug]"
---

# UserFlags should include 0 as a member

### Issue description

UserFlags can be 0 when the user has no flags, but there is no such member in the current definition.

### Code sample

```typescript

```

### Package version

0.37.120

### Runtime

Other / Browser

### Runtime version

workerd@1.20250408.0

### Priority this issue should have

Low (slightly annoying)

---

## Top Comments

**@Qjuh** [maintainer]:

The enum shouldn’t include that though. It‘s a valid value for all properties that have `UserFlags` as type though. Unless you provide an actual case where this is an issue