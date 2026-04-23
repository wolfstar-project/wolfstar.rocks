---
number: 876
title: "To quiet new runtime message use `.config({quiet: true})` or set `DOTENV_CONFIG_QUIET=true` in your env or .env file"
type: other
state: closed
created: 2025-06-28
url: "https://github.com/motdotla/dotenv/issues/876"
reactions: 18
comments: 13
---

# To quiet new runtime message use `.config({quiet: true})` or set `DOTENV_CONFIG_QUIET=true` in your env or .env file

I don't mind the default log message in v17 and respect the general promotion of dotenvx, but this statement is confusing in a team project where encrypting an `.env.test` file is not applicable:

>  encrypt with dotenvx: https://dotenvx.com

It's overkill for our project's `.env.test` and I'd like to avoid confusing my team.

We'd appreciate the ability to keep the log message but turn off the promo. Thanks for considering!

---

## Top Comments

**@sefinek** (+14):

A totally weird decision by the module author. I get that it's about promoting `@dotenvx/dotenvx`, but shoving something down users' throats that they don't necessarily need is pretty annoying — just like Microsoft does.

This kind of thing belongs in the documentation or changelog, not in a library's runtime logs. Sure, you can set `quiet: true`, but — as I said before — I don't think this is an appropriate way to promote another one of your own modules.

...

**@amacneil** (+11):

> Just to clarify: you’re upset that a free library added one log line — to a major (breaking change) release, with a documented way to turn it off — to let developers know there’s now a secure upgrade path?

Yes. It is tacky. You could promote during `npm install`, but adding this crap to runtime logs is not ok.

The average app has thousands of small dependencies like this, imagine if every single one started spamming ads for commercial services to stdout.

Open source maintenance can be thankless. So thank you for maintaining `dotenv`.

...

**@sefinek** (+10):

@motdotla 

I'm not upset – I just think adding such a log line, in a main release, feels a bit sloppy. It's good that it can be disabled, but I believe the approach could have been more thought-through.

I don't quite understand why you think I'm upset when I'm simply expressing my opinion and offering you alternative advice/suggestions.

In my opinion, you got a bit lost in what you're doing, that's all.

...