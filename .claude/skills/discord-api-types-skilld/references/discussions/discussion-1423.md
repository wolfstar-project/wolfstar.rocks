---
number: 1423
title: "How to declare Record<GatewayDispatchEvents, Gateway${EventName}DispatchData>?"
category: "Q&A"
created: 2025-11-06
url: "https://github.com/discordjs/discord-api-types/discussions/1423"
upvotes: 1
comments: 1
answered: false
---

# How to declare Record<GatewayDispatchEvents, Gateway${EventName}DispatchData>?

i tried that but failed
```ts
type Events = {
  [E in GatewayDispatchEvents]: Extract<GatewayDispatchPayload, { t: E }>["d"]
}
```

---

## Top Comments

**@kzmiura**:

I solved it myself.
```ts
type GatewayDispatchEventsMap = {
  [P in GatewayDispatchPayload as P["t"]]: P["d"]
}
```