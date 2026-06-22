---
number: 1614
title:  tests fail on windows due to symlinks
type: bug
state: open
created: 2026-03-14
url: "https://github.com/webpro-nl/knip/issues/1614"
reactions: 0
comments: 0
labels: "[bug]"
---

#  tests fail on windows due to symlinks

### Prerequisites

- [x] I'm using the latest version
- [x] I've read the relevant documentation
- [x] I've searched for existing issues
- [x] I've checked the list of known issues
- [x] I've read the issue reproduction guide

### Reproduction url

n/a

### Reproduction access

- [x] I've made sure the reproduction is publicly accessible

### Description of the issue

On Windows, symlinks are not a thing (by default). So when we clone the knip repository (on a fresh Windows 11), it makes the symlinked files equal to text files:

...