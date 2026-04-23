---
number: 1482
title: "Creating a forum with tags doesn't work"
type: bug
state: open
created: 2026-01-02
url: "https://github.com/discordjs/discord-api-types/issues/1482"
reactions: 0
comments: 1
labels: "[bug]"
---

# Creating a forum with tags doesn't work

### Issue description

Try to create a forum with `available_tags` and TypeScript will complain saying that you're missing the 'id' even though you don't require an ID to create a tag as Discord generates the ID for you (it's a Snowflake).

### Code sample

```typescript
# Minimal

available_tags: [
    {
        name: "test",
        moderated: false,
        emoji_name: "🎉",
    }
]

It's using `RESTPostAPIGuildChannelJSONBody` for the body JSON and `ChannelType.GuildForum` as the channel type.
The types should realise that the ID isn't needed in the API.
```

### Package version

discord-api-types@0.38.4

### Runtime

Node.js

### Runtime version

v24.2.0

### Priority this issue should have

High (immediate attention needed)

---

## Top Comments

**@Jiralite** [maintainer]:

~~Can you show what you are doing?~~ Never mind, got the reproduction.