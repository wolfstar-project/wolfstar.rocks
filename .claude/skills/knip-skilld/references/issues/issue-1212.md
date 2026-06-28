---
number: 1212
title: " Lint \"tsconfig.json\" Project References"
type: feature
state: closed
created: 2025-08-08
url: "https://github.com/webpro-nl/knip/issues/1212"
reactions: 5
comments: 4
labels: "[feature request]"
---

#  Lint "tsconfig.json" Project References

### Suggest an idea for Knip

Hello again and thanks for the wonderful tool, which I use every day!

A feature request:

- In monorepos, it is common to use the TypeScript's project references feature. In short, you add `references: [ { "path": "../someOtherLib" } ]` to your "tsconfig.json" file. And you need one `path` entry for each other monorepo package that is imported in the package.
- To my knowledge, project references is the only way to have the VSCode "Find All References" feature work across a package boundary.
- However, `tsc` will not tell you if a project reference is unused. Or if a project reference is missing! (Because it seems to only really care about the "paths" property.)

Since using the project references feature involves a ton of constant editing config files by hand, references are prone to getting out of date. So, linting for unused/missing project references is really needed! I think this would be a great feature for Knip, because linting for this kind of thing requires knowledge of a TypeScript package's dependency tree, and Knip already has that.

(I did search for issues regarding this but I was not able to find any. Sorry in advance if this is a duplicate.)

### Prior Art

- `update-ts-references`

...

---

## Top Comments

**@webpro** [maintainer]:

Knip is focused more on workspaces than TS projects, also see https://knip.dev/reference/faq#typescript.

> This is a great tool, but unfortunately it only covers "tsconfig.json" files that have a corresponding "package.json" file. That's a big limitation IMO, because it is common for "tests" directory and "scripts" directory to have a "tsconfig.json" file but no corresponding "package.json" file.

...

**@webpro** [maintainer]:

Thanks for the explanation. Closing this as "out of scope", and it would likely mean quite a bit of additional complexity.

**@fregante**:

> * `update-ts-references`

Thanks for linking to this one! I only knew of Nx doing this, which is kind of an overkill