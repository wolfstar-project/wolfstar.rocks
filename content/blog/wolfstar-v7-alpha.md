---
title: WolfStar v7 alpha
description: The v7 alpha is live with notes, multiple auto-moderation rules, a honeypot channel, and settings export and import.
date: 2026-10-12
tags:
    - alpha
    - release
category: Release
image: /assets/blog/wolfstar-v7-alpha.png
authors:
    - name: RedStar
      avatar:
          src: https://github.com/RedStar071.png
      to: https://x.com/redstar071
---

The WolfStar v7 alpha is live. We described the plan for v7 in [the original proposal](/blog/wolfstar-v7); this is the
first version you can try, running on a new stack and carrying the features below.

## What's new

### Moderation

`/note` adds a note to a member as a new type of moderation case. It gets a case number, goes to the moderation log and
shows up in `/case list`. A note is not a punishment: the member is never told about it, it does not count as a warning,
and there is no duration to undo. It needs the same permission as `/warn`.

Moderators can also write one straight from a report. The report menu has an **Add note** entry that opens a form;
confirming it adds the note and closes the report as actioned.

Bans, softbans and kicks now record the roles the member had at that moment. The leave log lists them (highest role
first, without `@everyone` or roles an integration manages), and `/case view` shows them later. A long list is cut with
a count of the roles left out. A member the bot had not cached shows no roles.

### Auto-moderation

A server used to get one rule per type. Now it can have up to 25 named rules, as many of one type as it wants. A word
filter that only deletes can sit next to a second one with other words that bans, each with its own actions, threshold,
and exempt roles and channels.

`/automod create|edit|delete|list|show|add|remove|ignore` manages them and replaces the old `/automod-<type>`
commands. When a message breaks several rules of the same type, only the first enabled one applies. Rules of different
types all still run.

There is also a new rule for zalgo text, the stacked-accent kind that makes a channel unreadable.

### Honeypot

A honeypot is a channel nobody should write in. `/honeypot setup` takes a channel or creates one at the top of the
list, refuses one where the bot cannot delete messages, and posts a warning telling members not to write there.
Anyone who does gets the message deleted and is kicked, softbanned or banned through the same moderation actions the
commands use, so the catch is a case in the history. A softban or ban also deletes what the member sent everywhere in
the last hour, which is where the rest of the spam usually is. Moderators, bots and webhooks are never caught.

Two extras are off by default. `honeypot.random-name` gives the channel a different ordinary name each day, and
`honeypot.keep-active` sends its warning again. `/honeypot edit`, `disable` and `show` do what they say.

### Logs and settings

The log of an edited message has a second style, `Separate`, that shows the content before and after in two blocks of
their own. It reads better when a message was mostly rewritten or is full of Markdown. The style is a select menu in
`/settings server menu`, so nobody has to type its name, and the log now links back to the message.

`/settings server export` answers with a JSON file of the server's settings and auto-moderation rules.
`/settings server import` reads one, shows what it would change, and asks before it writes anything. Roles, channels,
users and permission nodes stay out of the file. A file with a problem is refused whole, with all its problems listed.
Importing rules replaces the server's rules with the ones in the file.

::card{type="warning"}
**This is an alpha.** It may be very unstable, commands and settings can change in breaking ways, and changes are
announced beforehand in the notices channel on Discord. Do not rely on it for critical moderation.
::

## Tell us what breaks

Join [the Discord server](https://join.wolfstar.rocks) and report bugs or ideas in the feedback channel.
