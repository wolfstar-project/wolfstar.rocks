---
number: 767
title: Make types more specific and useful for type narrowing
type: feature
state: open
created: 2023-05-12
url: "https://github.com/discordjs/discord-api-types/issues/767"
reactions: 0
comments: 0
labels: "[feature request]"
---

# Make types more specific and useful for type narrowing

### Feature

There's quite a variety of places where the types are less useful than they could be.

Some examples:

--------------------

```ts
const reaction: GatewayMessageReactionAddDispatchData = ...;
if(reaction.member?.user.bot) return; //error!
```
Error: `'reaction.member.user' is possibly 'undefined'.ts(18048)`
Problem: The `user` property is only omitted in message creates & updates according to the docs. This is guaranteed by the docs, so we could make this more accurate.

-----------------

```ts
const channels: RESTGetAPIGuildChannelsResult = await ...;
for(const channel of channels) {
  if(channel.parent_id) { //error!
```
Error: `Property 'parent_id' does not exist on type 'APIGroupDMChannel'.ts(2339)`
Problem: We know the channels returned from GET Gu...