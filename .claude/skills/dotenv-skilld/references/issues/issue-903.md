---
number: 903
title: Advertisements or whatever for dotenvx should go to stderr not stdout
type: other
state: closed
created: 2025-08-04
url: "https://github.com/motdotla/dotenv/issues/903"
reactions: 43
comments: 18
---

# Advertisements or whatever for dotenvx should go to stderr not stdout

Hi, 

While I admit I'm not a huge fan of these advertisements being in the lib, I do get what your going for. However, out putting into stdout breaks piping and things, the proper place really should be stderr.  

Because it's in standard out, I have to go back and add quiet to all the places where it's used that pipes to other scripts and things. Stderr is generally where warnings etc... are, and isn't typically used for structured data piping.

Cheers and good luck with dotenvx

---

## Top Comments

**@douira** (+23):

Printing advertisements in the first place is bad behavior, and printing them to stderr is even worse. I'm migrating to varlock, which seems to do the same thing as dotenv but better and I don't have to be afraid that it's going to just randomly start breaking my software by printing ads in the future. Alternatively, NodeJS also now natively supports loading env files. For simple cases where I just want to load a `.env` file I've written 20 lines of code ...

**@vm-orbit** (+22):

Ad in OSS tool output does not look right. At least it makes me avoid dotenvx.
Please consider removing it. Thanks.

**@w666** (+15):

I understand that @motdotla wants to make some money, but this feels against open-source spirit. One small lib in my dev stack decided it is the most important one and can log not very useful stuff to stdout. Thanks for all these years, but I am migrating out of it, and not to detenvx. 