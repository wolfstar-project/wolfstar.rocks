---
number: 853
title:  Knip does not resolve package.json exports quite correctly
type: bug
state: closed
created: 2024-11-25
url: "https://github.com/webpro-nl/knip/issues/853"
reactions: 6
comments: 18
labels: "[bug]"
---

#  Knip does not resolve package.json exports quite correctly

### Prerequisites

- [X] I'm using the latest version
- [X] I've read the relevant documentation
- [X] I've searched for existing issues
- [X] I've checked the list of known issues
- [X] I've read the issue reproduction guide

### Reproduction url

https://github.com/maastrich/repro/pull/2

### Reproduction access

- [X] I've made sure the reproduction is publicly accessible

### Description of the issue

First, thanks for the amazing tool, it's really impressive how quick and effective knip is  

When setting up exports using glob syntax in the package.json, typescript can resolve `*` to be either a path part or multiple path part:
```
"./*": "./src/public/*/index.ts" // can resolve to
   -> "./src/public/foo/bar/index.ts"
   -> "./src/public/baz/index.ts"
```

but knip doesn't

For the moment I've found a workaround where I add this in my package.json so knip can resolve le path
(leaving both as typescript resolve the first one and knip the second)
```diff
"./*": "./src/public/*/index.ts",
+ "./**": "./src/public/**/index.ts",
```

---

## Top Comments

**@webpro** [maintainer] (+2):

Understood, but this is a good example of static analysis versus runtime behavior and there are tradeoffs to be considered.

**@webpro** [maintainer]:

Thanks for report. That's correct according to the Node.js docs and honestly I'm a bit baffled by it:

> \* maps expose nested subpaths as it is a string replacement syntax only.
>
> All instances of * on the right hand side will then be replaced with this value, including if it contains any / separators.

From a Knip perspective, the issues I have with this:

- a lot more files might become entry files and this isn't great in terms of finding unused exports (which aren't reported by default in entry files)
- unsure about the pe...

**@webpro** [maintainer]:

Just saying, the generic (and intended) solution to this is to add `entry` patterns to your knip config manually:

```json
{
  "entry": ["./src/public/{a,b}/index.ts"]
}
```

At this point this feels better than rewriting `*` to globstar `**` and marking "everything" as an entry file (the `node` option), even though it goes 100% against the "zero-config aim".