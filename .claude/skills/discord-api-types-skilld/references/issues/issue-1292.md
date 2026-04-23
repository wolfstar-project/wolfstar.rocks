---
number: 1292
title: RESTPatchAPIWebhookWithTokenMessageJSONBody omitting flags property
type: bug
state: closed
created: 2025-07-02
url: "https://github.com/discordjs/discord-api-types/issues/1292"
reactions: 0
comments: 0
labels: "[bug]"
---

# RESTPatchAPIWebhookWithTokenMessageJSONBody omitting flags property

### Issue description

The RESTPatchAPIWebhookWithTokenMessageJSONBody type does not pick "flags", but flags seem to be required to avoid a 400 on component payloads.

This is just using the types for direct REST requests.  I can work around the TS error on an unexpected property, but it's a mild nuisance.

### Code sample

```typescript
// In the REST interaction response exchange involving:

// POST .../interactions/${interaction_id}/${interaction_token}/callback
// PATCH .../webhooks/${application_id}/${interaction_token}/messages/@original

// I believe that `RESTPatchAPIWebhookWithTokenMessageJSONBody` is the body of the patch request, but the type does not allow flags, and flags seem to be required to avoid a 400 error.


...