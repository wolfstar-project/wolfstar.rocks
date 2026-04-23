---
number: 1491
title: Add roles to APIInvite
type: bug
state: open
created: 2026-01-17
url: "https://github.com/discordjs/discord-api-types/issues/1491"
reactions: 0
comments: 0
labels: "[bug]"
---

# Add roles to APIInvite

### Issue description

According to API docs, the invite resource now has roles.  (When creating an invite, the client UI now has the option to pick roles to assign on join, and these are visible in the invites table in the server settings.)

https://discord.com/developers/docs/resources/invite#invite-object

It's not documented yet as part of the gateway event, but in testing a `role_ids?: Snowflake[]` property does appear to be included.

https://discord.com/developers/docs/events/gateway-events#invite-create

And it's part of guild and channel invite request responses.

...