---
number: 5917
title: "[USelectMenu] Item hover state/color not working with `search-input=\"false\"`"
type: bug
state: open
created: 2026-01-22
url: "https://github.com/nuxt/ui/issues/5917"
reactions: 7
comments: 3
labels: "[bug, upstream/reka-ui, v4]"
---

# [USelectMenu] Item hover state/color not working with `search-input="false"`

### Environment

|                      |                                                                                                                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Operating system** | `macOS 25.2.0`                                                                                                                                                                                |
| **CPU**              | `Apple M4 Pro (14 cores)`                                                                                                                                                                     |
| **Node.js version**  | `v22.13.0`                                                                                                                                                                                    |
| **nuxt/cli version** | `3.32.0`                                                                                                                                                                                      |
| **Package manager**  | `pnpm@10.28.0`                                                                                                                                              ...

---

## Top Comments

**@benjamincanac** [maintainer]:

I don't think there is one but from my investigation the hover handling doesn't work when the Combobox is missing its ComboboxInput, I'm not sure adding this `search-input` prop was a good idea 

**@MickL**:

I am forced to use `SelectMenu` in favor of `Select` because only `SelectMenu` provides the new `clear` prop (which is amazing btw!). If you want to add `clear` to `Select`, possibly SelectMenu can always have a search input? 

Personally I would also suggest to merge both into one component.

**@MickL**:

@benjamincanac You marked this as upstream issue, but can you link the upstream issue?