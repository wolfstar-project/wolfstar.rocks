---
number: 990
title:  Knip fails in a git worktree + lefthook
type: bug
state: closed
created: 2025-03-18
url: "https://github.com/webpro-nl/knip/issues/990"
reactions: 11
comments: 4
resolvedIn: 5.78.0
labels: "[bug]"
---

#  Knip fails in a git worktree + lefthook

### Prerequisites

- [x] I'm using the latest version
- [x] I've read the relevant documentation
- [x] I've searched for existing issues
- [x] I've checked the list of known issues
- [x] I've read the issue reproduction guide

### Reproduction url

https://github.com/VanTanev/knip-lefthook-bug-reproduction

### Reproduction access

- [x] I've made sure the reproduction is publicly accessible

### Description of the issue

Reproduction is kind of tedious, because it requires cloning the repo and then creating a git worktree branch checkout.

The issue is that Knip assumes the hooks directory is always `.git/hooks`, but that is not the case. In a worktree checkout, `.git` is not a folder but instead a pointer to the real folder.

---

## Top Comments

**@webpro** [maintainer]:

:rocket: _This issue has been resolved in v5.78.0. See Release 5.78.0 for release notes._

_Using Knip in a commercial project? Please consider becoming a sponsor._

**@webpro** [maintainer]:

Please don't spam other issues with snippets but not an actual repro. Unactionable noise.

**@altendky**:

i ran into this in a related way.  my local setup is odd, but it comes down to at least approximately the same failure.  i have a git repo in my home directory with `**/**` in `.gitignore`.  in subdirectories i then have a git worktree setup.  when i run knip from the main repo (with a `.git` directory) it runs without errors as it does for other people.  when i run from a worktree (with a `.git` file) it seems that knip continues outside of the worktree root and finds my home directory `.gitignore` and ignores the knip configs.  deleting my home directory `.gitignore` results in knip seeing t...