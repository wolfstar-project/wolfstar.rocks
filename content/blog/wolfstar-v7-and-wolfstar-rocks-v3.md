---
title: WolfStar v7 and wolfstar.rocks v3
description: WolfStar v7 and the v3 dashboard shipped together, and Staryl now follows feeds, Bluesky, Mastodon and X as well as Twitch.
date: 2026-11-19
category: Release
image: /assets/blog/wolfstar-v7-and-wolfstar-rocks-v3.jpg
tags:
    - release
    - dashboard
    - staryl
authors:
    - name: RedStar
      avatar:
          src: https://github.com/RedStar071.png
      to: https://x.com/redstar071
---

On 13 November two releases went out on the same day: [WolfStar v7.0.0](https://github.com/wolfstar-project/wolfstar/releases/tag/v7.0.0)
and [wolfstar.rocks v0.16.0](https://github.com/wolfstar-project/wolfstar.rocks/releases/tag/v0.16.0), which is the v3 of
the dashboard. They were built for each other: the dashboard now reads and writes the same settings, in the same shape,
as the bot. Staryl grew at the same time, and follows far more than Twitch.

## WolfStar v7

v7 is the version [the alpha](/blog/wolfstar-v7-alpha) let you try, now as the stable release. It runs on a new stack,
and everything the alpha brought is in it:

- **Notes.** `/note` adds a note to a member as a moderation case of its own. The member is never told, and it does not
  count as a warning.
- **Auto-moderation rules.** A server can have up to 25 named rules, several of one type if it wants, each with its own
  actions, threshold, and exempt roles and channels. `/automod` manages them.
- **A honeypot channel.** `/honeypot setup` posts a warning in a channel nobody should write in, and whoever writes there
  is kicked, softbanned or banned, with a case in the history.
- **Settings export and import.** `/settings server export` gives a server's settings and rules as a file, and
  `/settings server import` reads one back after showing what it would change.

A few v6 settings are gone in v7: the command prefix, reaction roles, and the old per-filter self-moderation settings,
which the auto-moderation rules replace.

## wolfstar.rocks v3

The dashboard is one page now, at [`/app`](/app). Pick a server in the rail on the left, then a section in the sidebar:

- **Moderation** and **Auto Moderation**, with the rules above, edited one by one.
- **Honeypot**, **Join Guard** and **Appeals**.
- **Auto-Delete**, **Auto-Purge** and **Auto-Message**, one row per channel.
- **Commands**, where each command can be turned off or limited to some channels, roles and members.
- **Dashboard access**, to decide who besides the owner and the admins can open the dashboard.
- **Logs**: moderation history, warnings, command history, and the settings activity, which shows who changed which
  setting and when.

On a phone the sections move to a bar at the bottom of the screen. In every section, the changes you have not saved
wait in one bar until you save or undo them. Links to the old `/guilds/…` pages still work and open the right server and section.

Around the dashboard, the whole site was redrawn: the WolfStar and Staryl pages, the [commands](/commands) list, and the
colour themes, which follow Discord's and include a custom one. The site is also available in Italian, and the
[translation status](/translation-status) shows how far each other language has come.

## More sources for Staryl

Staryl started with one thing: telling a channel when a Twitch stream went live or offline. It now posts:

- Twitch streams going live or offline, new videos and new clips.
- New items of an RSS or Atom feed.
- New posts of a Bluesky, Mastodon or X account.

Each source has its own command, such as `/subscriptions rss add` or `/subscriptions bluesky add`, and `/settings` holds
the rest in one menu. The dashboard has a **Social** section too: it lists a server's subscriptions, adds, edits and
removes them, shows how many each source uses against its limit, and suggests accounts while you type the name.

## What comes next

The [changelog](/changelog) lists each change as it ships, and [Updates](/updates) collects both from now on. If something is
broken or missing, tell us in the [support server](https://join.wolfstar.rocks).
