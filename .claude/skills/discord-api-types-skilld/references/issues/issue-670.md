---
number: 670
title: "APIChannel types could be more \"strict\""
type: bug
state: closed
created: 2022-12-12
url: "https://github.com/discordjs/discord-api-types/issues/670"
reactions: 1
comments: 3
labels: "[bug]"
---

# APIChannel types could be more "strict"

### Issue description

A lot of the fields of `APIChannel`-related types are marked as optional, where in practice they are not for the given channel type.

Here's an example: for `APIThreadChannel`, the `thread_metadata` property is marked optional (which is according to Discord's documentation of the channel data object is correct) - however, I haven't seen any instance where for a thread channel this data was missing. For Group DMs, the `owner_id` field should always be present (including when the GDM is from an app), but is marked as optional.

This makes it harder to know to know which fields are consistently there, as the types tend to be overly conservative over marking these fields as optional. This also means additional unnecessary guards (or worse, some `thread_metadata` in the specification does not seem to be required:

- https://github.com/discord/discord-api-spec/blob/18275bc9b9d4c354136b43c531a97057c8789ff4/specs/openapi.json#L17167-L17176
- https://github.com/discord/discord-api-spec/blob/18275bc9b9d4c354136b43c531a97057c8789ff4/specs/openapi.json#L30999-L31008

I feel like leaving `thread_metadata` as-is.

There's not much information for owner ids for group direct message channels.

Other than that, I do believe channel typings have become stricter.

**@vladfrangu** [maintainer]:

I think this beast was tackled? cc @Jiralite 