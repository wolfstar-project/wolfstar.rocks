---
number: 1154
title:  Biome plugin fails for Biome 2.0
type: bug
state: closed
created: 2025-06-24
url: "https://github.com/webpro-nl/knip/issues/1154"
reactions: 4
comments: 3
labels: "[bug, good first issue]"
---

#  Biome plugin fails for Biome 2.0

### Prerequisites

- [x] I'm using the latest version
- [x] I've read the relevant documentation
- [x] I've searched for existing issues
- [x] I've checked the list of known issues
- [x] I've read the issue reproduction guide

### Reproduction url

https://codesandbox.io/p/devbox/fdc577

### Reproduction access

- [x] I've made sure the reproduction is publicly accessible

### Description of the issue

Knip tries to parse `biome.json` configuration file's `extends` key as array which causes an error due to  monorepo support.

...

---

## Top Comments

**@webpro** [maintainer] (+1):

Thanks for the report! This is very helpful

**@webpro** [maintainer] (+1):

Yes! Thanks, and thank you again @Thomascogez 

**@asomethings** (+1):

closing issue. this issue was fixed in 5.62.0 (#1177)  