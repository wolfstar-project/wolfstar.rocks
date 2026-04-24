---
number: 1170
title: Export each webhook event type
type: bug
state: open
created: 2024-12-18
url: "https://github.com/discordjs/discord-api-types/issues/1170"
reactions: 0
comments: 0
labels: "[bug]"
---

# Export each webhook event type

### Issue description

`APIWebhookEventBase` is intentionally not exported, but it is not possible to get each webhook event type individually. It is only possible to get a union of them all via `APIWebhookEvent`, which makes it difficult to, for example, type a parameter of a function as a specific webhook event type.

### Code sample

_No response_

### Package version

main

### Runtime

Node.js

### Runtime version

N/A

### Priority this issue should have

Low (slightly annoying)