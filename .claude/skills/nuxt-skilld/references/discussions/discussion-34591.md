---
number: 34591
title: Modern ecosystem sucks
category: General
created: 2026-03-15
url: "https://github.com/nuxt/nuxt/discussions/34591"
upvotes: 1
comments: 1
answered: false
---

# Modern ecosystem sucks

## Just wanted to code a small fun project…

I sat down thinking:  
> “Nice, I’ll code a small project for fun.”

So I:

- took **Nuxt**
- ran it on **Bun** (also tried node)
- clicked around a bit
- decided to add **Tailwind v4** (which has been out for like **half a year already**)

And then the adventure began.

The **official Nuxt Tailwind module** only supports **Tailwind v3**.

Tailwind **v4**?  
Oh no, for that you must travel through the **ancient forbidden setup rituals**. 

So I started installing it manually. Postcss plugin etc

Somewhere during that process, something clearly **summoned an eldritch dependency demon**, because now the project:

- does **not start**
- **hangs forever**
- and prints this masterpiece of debugging clarity:

...

---

## Top Comments

**@OrbisK** [maintainer] (+3):

There are at least two reasons why this report is not helpful:

1. If encounter an issue with `@nuxtjs/tailwindcss` please raise it here: https://github.com/nuxt-modules/tailwindcss
2. It there is an issue with debug information not beeing helpful you can raise an issue/feature request an I am pretty sure we can improve it once you have provided an actual reproduction.

I am closing and locking this discussion for the reasons above. If you wish, open an issue for the tailwind part and one for the debug information. Thank you!

Personal note:

Setting aside the frustration, there is no...