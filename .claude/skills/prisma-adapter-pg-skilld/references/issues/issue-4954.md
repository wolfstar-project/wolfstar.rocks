---
number: 4954
title: "Allow arbitrary `enum` values"
type: other
state: open
created: 2021-01-11
url: "https://github.com/prisma/prisma/issues/4954"
reactions: 178
comments: 27
labels: "[topic: prisma-client, topic: enum]"
---

# Allow arbitrary `enum` values

## Problem

Enums currently prevent certain values from being used, requiring use of `@map()` to correctly reflect what actually gets stored in the database.

This causes a couple of issues:

1. There is no Prisma-provided mechanism for accessing the underlying value, as would be needed if/when the mapped value needs to be accessed / returned / shown to users.
2. It seems unnecessary, looking at the code that is generated for the JavaScript/TypeScript client.

eg:  The following are currently not allowed:

```prisma
enum Place {
  1st
  2nd
  3rd
}

enum AddressUnitType {
  "Apt."
  Suite
  Unit
}
```

Note: enum identifiers having embedded spaces are also not allowed.

Instead, they require the use of `@map("{value}")` like this:

```prisma
enum Place {
  first @map("1st")
  second @map("2nd")
  third @map("3rd")
}

enum AddressUnitType {
  Apt @map("Apt.")
  Suite
  Unit
}
```

Additionally, since Prisma does not currently provide a supported mechanism for translating between the mapped enum values and the enum identifiers, this is another layer of translation that has to be provided.



## Suggested solution

Allow Prisma enums to be defined using enclosing double-quotes if needed

eg: 

```prisma
enum Place {
  "1st"
  "2nd"
  "3rd"
}

enum AddressUnitType {
  "Apt."
  Suite
  Unit
}
```

This will avoid the need to use any other translation of the identifier to the value, too.

I do imagine that the Prisma architects are being restrictive here, and wanting to take the 'lowest common denominator', so that, should they want to add generators for other languages, particularly those that natively provide their own enum types, and which there, have restrictions similar to what Prisma is currently imposing.

Perhaps in that case, when the project is known to only ever need JavaScript/TypeScript client generation, there should be a configuration option that can be set to indicate relaxation of the ...

---

## Top Comments

**@SamuelMS** (+52):

@janpio Considering enum types in TypeScript are currently generated as key-value pairs, could we update the generated value to be the `@map` representation instead?

i.e. for the schema

```
enum Role {
  EMPLOYEE       @map(name: "Employee")
  COMPANY_ADMIN  @map(name: "Company Admin")
}
```

This is what gets generated:

```typescript
export const Role: {
  EMPLOYEE: 'EMPLOYEE',
  COMPANY_ADMIN: 'COMPANY_ADMIN'
};
```

So anything that consumes the type needs to translate `COMPANY_ADMIN` to `Company Admin`. However, no translation would be necessary if the generated type...

**@devuxer** (+17):

The use case you mentioned of needing to show these values to users (e.g., via select lists or radio buttons) is really important to me. Would definitely like to avoid the extra translation step.

**@danielweil** (+6):

Any updates on this? I still need a solution for translating backwards so I can show the client.