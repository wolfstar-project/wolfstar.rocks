---
number: 555
title: Eventual versioning changes for discord-api-types
type: other
state: open
created: 2022-08-05
url: "https://github.com/discordjs/discord-api-types/issues/555"
reactions: 0
comments: 0
---

# Eventual versioning changes for discord-api-types

# The versioning system for discord-api-types will change (eventually)!

First off, if you're reading this, hi, didn't expect you to. This is a short PSA that in the (hopefully near) future the versioning system for discord-api-types will change

## What's changing and, most importantly, why?

Currently, discord-api-types uses the 0ver versioning system (find out more here: https://0ver.org/). This has worked mostly fine for a long time (and changing it to full semver made no sense since we'd have effectively the same versioning troubles between them).

However, as time has shown *several times* due to the nature of Discord's API, such a versioning system doesn't fully work. As such we are changing it...ish.

The new versioning system will follow the format: `@discord-api-types/v...