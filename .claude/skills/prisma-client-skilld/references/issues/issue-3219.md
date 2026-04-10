---
number: 3219
title: "Define type of content of `Json` field"
type: feature
state: open
created: 2020-08-06
url: "https://github.com/prisma/prisma/issues/3219"
reactions: 798
comments: 131
labels: "[kind/feature, topic: schema, topic: Json, topic: composite-types]"
---

# Define type of content of `Json` field

## Problem
Right now if you have the following schema with Json field:
```prisma
model User {
  id               Int  @default(autoincrement()) @id
  name             String?
  extendedProfile  Json
}
```
You'll end up with a problem that you don't have strict type for `extendedProfile` field in `.ts`.
```typescript
const user = prismaService.user.findOne(...);
user.extendedProfile // we don't know the type of extendedProfile
```
The one way to fix it, is specify some interface in your code and use it like this:
```typescript
interface UserProfile {
    field1: string;
    field2: number;
}

const user = prismaService.user.findOne(...);
(user.extendedProfile as UserProfile).field1; // now we have autocompletion
```
But it's not really comfortable to use it like that each time.

Also we can create some class and create instance of it like that:
```typescript
interface UserProfile {
    field1: string;
    field2: number;
}

class User {
    id: string;
    name?: string;
    extendedProfile: UserProfile;

    constructor(user: PrismaUser /* user object returned by prisma */) {
        // ... initialize
    }
}

const user = new User(prismaService.user.findOne(...));
```
But this solution creates some overhead due to the creation of an additional object.

## Suggested solution
Maybe we can specify type in `schema.prisma` file like that?

```prisma
json ExtendedUserProfileJson {
    field1  String
    field2  Int
}

model User {
  id               Int  @default(autoincrement()) @id
  name             String?
  extendedProfile  ExtendedUserProfileJson
}
```

## Alternatives
Alternatively, we can somehow manage this in the typescript.

---

## Top Comments

**@janpio** (+252):

Being able to type your Json fields is a simple and understandable feature requests. Although there might be workarounds, this might very well be something that Prisma could offer in the future on its own - so having this feature request is valid.

**@husayt** (+7):

I have tried the following workaround. It works fine, until I need a field other than number or string, e.g. `Date`. Without date field the approach below works. I tried to use transformers for string to date conversion, but that contradicts `Prisma.InputJsonObject` definition.

```
import { Type } from "class-transformer/decorators";
import { IsOptional, Length } from "class-validator";

export class Qualification implements Prisma.InputJsonObject {
  @Length(1, 30)
  name?: string;

  @IsOptional()
  age?:number;

  @IsOptional()
  @Type(() => Date)
  birthday?: Date;

  [index: string]: Prisma.JsonValue ;
}
```...

**@MaximNd** (+1):

> > Probably, if the database you are using does not have JSON support, then you simply cannot use the Json field type and this feature.
> 
> I think @Sytten is talking about the fact in Json type say in postgres doesn't enforce any schema. It will not guarantee that all data there follows the shape you define. The proposal you have defined here is will all be enforced on application level.
> 
> Also, @MaximNd why not define a 1-1 relation here if you want a schema to be maintained, just interested to know. The main selling point of Json type personally for me is it allows me to throw data...