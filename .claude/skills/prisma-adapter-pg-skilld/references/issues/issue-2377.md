---
number: 2377
title: Support for splitting Prisma schema into multiple files
type: feature
state: closed
created: 2020-05-05
url: "https://github.com/prisma/prisma/issues/2377"
reactions: 1310
comments: 352
labels: "[kind/feature, topic: schema, topic: modular-schema, status/is-preview-feature, topic: prismaSchemaFolder]"
---

# Support for splitting Prisma schema into multiple files

## Problem

Prisma currently only supports one single Prisma Schema file. Developers want more flexibility for managing their Prisma Schema files.
 
Motivations:

* breaking up large schema files to make them more manageable
* flexible integration with certain architectures, i.e. each module has its own self-contained logic including its schema

## Solution

Support importing additional schema files, i.e. `import "user.schema"`, `import models/*.prisma` or `import modules/**/*.prisma`.

## Alternatives

Not researched at this time. 

## Additional context

https://github.com/prisma/prisma/issues/92



---

## Top Comments

**@beeplin** (+126):

badly need this feature. currently I have to `cat a.prisma b.prisma > schema.prisma`. it works but is so clumsy.

**@paniavula** (+169):

Appreciate prioritisation of this. It is really painful to write all the schema in one file.

**@yhaiovyi** (+113):

It's a dealbreaker for me...