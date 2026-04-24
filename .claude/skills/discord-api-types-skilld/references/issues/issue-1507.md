---
number: 1507
title: Add Generic Interaction types
type: feature
state: open
created: 2026-01-30
url: "https://github.com/discordjs/discord-api-types/issues/1507"
reactions: 0
comments: 3
labels: "[feature request]"
---

# Add Generic Interaction types

### Feature

Generic Interaction types that would allow the casting of interaction types based on known data of the command that produced the interaction
This would significantly improve type safety and remove pointless checks in the handling of incoming discord interactions

### Ideal solution or implementation

An ideal solution would be the addition of generic types like
`GenericAPIInteraction<T>`
`GenericAPIChatInputApplicationCommandInteraction<T>`,
or somehting of this sorts

Specific implementation doesn't matter as long as there is a way to create Interaction types from known command data

### Alternative solutions or implementations

_No response_

### Other context

...