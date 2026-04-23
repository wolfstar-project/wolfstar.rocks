---
number: 95
title:  Bring back nullish values support via option
type: other
state: open
created: 2023-05-26
url: "https://github.com/unjs/defu/issues/95"
reactions: 21
comments: 3
---

#  Bring back nullish values support via option

### Describe the feature

Hi 🏻 

I'm author of Anu UI lib. I'm using defu and it's doing an amazing job until I found that it skips nullish values `undefined `& `null`  

## Why?

If we want to allow explicitly set `null` or `undefined` for property it's not possible ATM.

I'm trying to implement global prop defaults via vue plugin options for my lib. If user wants to disable some prop, the user can pass `undefined` in the plugin option but unfortunately defu skips that and uses default from component props definition 

## Proposed Solution

We can keep the defu's default behavior and introduce option to consider nullish value while merging like below:
```ts
defu(obj, defaults, { skipNullish: false })
```

## Additional context

I guess this was already implemented before and we removed this in this PR.

I can use mentioned alternatives but those aren't from unjs family and are outdated (might be vulnerable) which makes defu one and only choice.



### Additional information

- [ ] Would you be willing to help implement this feature?

---

## Top Comments

**@beyer-johannes** (+4):

It should be really nice! Can't use defu because of this. 

**@Yizack** (+2):

Hi, sometimes while using defu I wish it could be able to not skip null values as well, hope this is reconsidered 

**@jd-solanki**:

Hi,

I'm rewriting Anu for v1 and trying to remove external libs as much as possible. If `defu` bring back this feature via custom merger then this will allow me to remove `deepmerge-ts` lib.

There are few upvotes as well that might change your mind to reintroduce this feature.

---

I tried creating `customDefu` but I defu isn't passing `undefined`/`null` values 🏻 