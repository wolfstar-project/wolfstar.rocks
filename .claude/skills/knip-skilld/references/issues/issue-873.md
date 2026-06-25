---
number: 873
title: " Knip module resolution doesn't take account of TypeScript `rootDirs` from referenced project"
type: bug
state: closed
created: 2024-12-08
url: "https://github.com/webpro-nl/knip/issues/873"
reactions: 8
comments: 12
labels: "[bug]"
---

#  Knip module resolution doesn't take account of TypeScript `rootDirs` from referenced project

### Prerequisites

- [X] I'm using the latest version
- [X] I've read the relevant documentation
- [X] I've searched for existing issues
- [X] I've checked the list of known issues
- [X] I've read the issue reproduction guide

### Reproduction url

https://github.com/pawelblaszczyk5/knip-root-dirs-repro

### Reproduction access

- [X] I've made sure the reproduction is publicly accessible

### Description of the issue

Hello  

In one of my monorepos, where I use Knip I'm migrating from Remix to React Router. They're using `rootDirs` from TypeScript for some funky typesafety codegen stuff. I'm also using project references to split up settings for e.g. tests and app code. While importing from this "magically" mapped stuff I'm getting "unresolved imports" errors.

In my reproduction you can see these behaviours:

1. Running `pnpm knip` fails with `unresolved imports` error
1. Running `pnpm knip --tsConfig tsconfig.source.json` on the other hand works so Knip can correctly resolve `rootDirs`
1. Uncommenting `rootDirs` in main `tsconfig.json` also works, so same as 2.

It seems like Knip isn't correctly using stuff from projects that are referenced from root `tsconfig.json`. I'm not sure but maybe related to these two: https://github.com/webpro-nl/knip/issues/780 https://github.com/webpro-nl/knip/issues/...

---

## Top Comments

**@webpro** [maintainer] (+1):

It's different config but a "Go To Definition" still resolves it properly, so I was also thinking of looking into LSP stuff.

Fwiw, it's quite literally sending `compilerOptions` from ts.parseJsonConfigFileContent to ts.resolveModuleName.

**@webpro** [maintainer]:

Thanks Paweł, useful to have that repro.

Looks related to the issues you mention indeed.

Hopefully easy to resolve in Knip, but need to dig some deeper. For starters, Knip uses the same config loader as `tsc` itself. Having `references.path` point to another TS config file does not result in configs getting merged or something. E.g. `tsc --build` or bundler takes care of that, and Knip will need to do something similar. Just not sure yet if and how to merge those TS configs.

**@webpro** [maintainer]:

Knip has migrated from `enhanced-resolve` to oxc-resolver. This resolver sits in front of the TS internal module resolver. There seems to be no mention of `rootDirs` in docs nor the repo at all, so I don't have high hopes, but wanted to mention it anyways.