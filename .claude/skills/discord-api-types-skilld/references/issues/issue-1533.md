---
number: 1533
title: "docs: several broken links across library need updating"
type: bug
state: open
created: 2026-02-20
url: "https://github.com/discordjs/discord-api-types/issues/1533"
reactions: 0
comments: 6
labels: "[good first issue, bug]"
---

# docs: several broken links across library need updating

### Issue description

I believe the recent update to Discord's documentation site may have lead to various links in this package being broken as a result.

Below are some examples _of only the links that I found_ were broken. I suspect there could be more and am not entirely aware of the full scope that this has affected the docs here yet - some links seem to work just fine, and some are broken. 

E.x.:

https://github.com/discordjs/discord-api-types/blob/6b6b256d5fc70d2cedb3613b5f52b3de06510ede/gateway/v10.ts#L1-L3

https://github.com/discordjs/discord-api-types/blob/6b6b256d5fc70d2cedb3613b5f52b3de06510ede/gateway/v10.ts#L121-L125

...and in other versions:
https://github.com/discordjs/discord-api-types/blob/6b6b256d5fc70d2cedb3613b5f52b3de06510ede/gateway/v6.ts#L2

...

---

## Top Comments

**@biast12**:

Found a few more dead links
`https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types` -> https://docs.discord.com/developers/events/gateway-events#activity-object
`https://docs.discord.com/developers/topics/gateway-events#activity-object-activity-party` -> https://docs.discord.com/developers/events/gateway-events#activity-object-activity-party
`https://docs.discord.com/developers/topics/gateway-events#activity-object-activity-secrets` -> https://docs.discord.com/developers/events/gateway-events#activity-object-activity-secrets
`https://docs.discord.com/develope...

**@biast12** (+1):

yee, just gonna update the first message i send when i find more, currently fully updating an unmaintained library so i'll likely hit a good handful

**@advaith1** (+1):

these should be redirecting- looks like some redirects are broken, we will look into it