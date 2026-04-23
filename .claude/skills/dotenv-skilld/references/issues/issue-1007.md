---
number: 1007
title: Enable Trusted publishing
type: other
state: open
created: 2026-04-04
url: "https://github.com/motdotla/dotenv/issues/1007"
reactions: 3
comments: 13
---

# Enable Trusted publishing

Hi! Dotenv has to be one of the most important packages in the npm ecosystem. 
In those last months there has been a lot of supply chain attacks targeting packages of all sizes, many people are moving to publishing packages on NPM through trusted publishing (CI/CD on github workflows etc...) which reduces the risk of potential theft of npm access tokens and makes it more trustworthy to install a package knowing it came from a trustable source.

This Issue is a suggestion to look into trusted publishing for dotenv, thank you!

---

## Top Comments

**@motdotla** [maintainer] (+4):

Yes, thank you and agree. Will move to this soon.

**@motdotla** [maintainer] (+4):

Thankless work open source isn't it.

@lolusiayy --env-file would not exist without dotenv. They literally copy pasted over the full test suite without so much of a thank you. But that's the nature of open source.

The other nature of open source is that maintainers like me can pick a problem and work on it. That problem is plaintext .env files, and I will continue to do everything reasonable in my power to grow knowledge of the technology. It solves a MAJOR problem - on a similar risk-level as supply chain attacks.

The effort is working:

...

**@lolusiayy** (+1):

Hi. The dotenv package is not one of the most important parts of the npm ecosystem and, in current conditions, can be considered obsolete. Its significance mainly came from limitations in older versions of Node.js, which have now been addressed by native runtime features.

In the context of the growing number of supply chain attacks targeting packages of all sizes, reducing dependencies becomes an important aspect of security. Every external library increases the potential attack surface - regardless of its popularity or reputation.

...