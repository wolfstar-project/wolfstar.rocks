---
number: 770
title: Escaping rules change based on import file?
category: "Q&A"
created: 2023-08-18
url: "https://github.com/motdotla/dotenv/discussions/770"
upvotes: 1
comments: 0
answered: false
---

# Escaping rules change based on import file?

I have a string in my .env file with a $ character: `FOO="123$"`

I'm using this with vitest and playwright. In vitest, I get an error about escaping a character in my env file that has a $ in it:

`dotenv-expand failed to expand env vars. Maybe you need to escape `$`?`

Escaping said character solves the problem.

Yet when I run playwright, the escaping is not needed and actually is seen as part of the string.

`console.log(FOO) // prints 123\$`

EDIT: For now we have fixed this by specifically calling dotenv-expand in the playwright file: `dotenvExpand.expand(dotenv.config({ override: true }))`
