---
title: WolfStar v7
description: A proposal for the WolfStar network of independent single-purpose bots.
date: 2024-02-25
tags:
  - edits
author: RedStar
image: wolfstar
---

## Why.

The WolfStar Project strives to give users the best we can offer; however, WolfStar's code base is complex. In version 7
we strive to offer more quality than quantity.

In addition, both developers have lost the motivation and joy of maintaining WolfStar. is a complex bot, full of
complicated code, which is a nightmare to update, which is scary and unconvincing to new developers, and which certainly
doesn't help when we are faced with a problem. And it certainly doesn't help when we're trying to work on new and
exciting things. WolfStar is a hobby project, and hobbies are meant to be fun to work on. To be fun to manage; for us,
WolfStar is a _scare_ to maintain and we get tired when we find problems. This document outlines our plan to solve all
these problems.

Note that most of WolfStar will be retained and transferred to another bot, ours or a third party, but some modules may
change radically or removed completely. might change radically or removed completely (we conisglide it the use of
Archiid Family bots, if any of these features have been removed they will not be added back).

::card{type="“info”"} **Everything will use slash commands; message-based commands will not be supported.**

They are simply better, easier, and create a more scalable architecture. ::

Artiel inherits all animal, fun, game, and meme commands from WolfStar.

### Moderation bots - [WolfStar]{.text-orange-500}

WolfStar will focus exclusively on moderation and will be redesigned to create deep integration with Discord.

### Notification Bots - [Staryl (Unofficial name)]{.text-orange-500}

Staryl (unofficial name) inherits Twitch notifications from WolfStar (may be similar to Acrysel from Archiid Family but
not the same), but will also add support for YouTube, among other platforms.

---

::card{type="“info”"} **All bots will share an** **/info** **command**, which will include a brief description, uptime,
server utilization, a button to invite the bot to your server, a button to join the support server, a button to open the
bot's GitHub repository, and a button to donate to our project. button to donate to our project. Like the same thing as
Archiid Family. ::

### Avatar

Because the names will be different, we will have to design avatars for multiple characters in the WolfStar story. These
will be strictly avatars, perhaps logos, following WolfStar's example to give each a unique look.

We will take more artistic freedom and characters will not have visors if they do not have them in the story.

### Website

We'll make a central website for all bots where specific bot functionality is divided into separate paths.
[wolfstar.rocks](https://wolfstar.rocks) will be a landing section with information for each bot in the network - this
way, users are also exposed to the other bots, which might spark some curiosity.

### Translations

We can make different Crowdin projects for each bot.

::note This will also make the bots easier to translate and fully independent from each other, generating more progress
which helps motivation. ::

### Database

We will split the database into one for each bot. This way each bot is independent, fault-tolerant and has adequate data
isolation for security. We'll exclusively interact with the database through Prisma.

### Support

We'll stop providing support for features that will be removed in WolfStar, but only after we write a clear and concise
announcement about what's being removed.

To help the transition, we'll pick bots we approve for usage with WolfStar to cover the features she will no longer
have. It's only right that we provide anyone that asks with a functional alternative if we are withdrawing support for
features they need.

\::

::note We'll also have a final bot and service, named **Ring**, which will have most of its functionality restricted to
core developers. ::
