---
number: 6054
title: How to use theme colors in custom components that follow Nuxt UI patterns
type: question
state: open
created: 2026-02-16
url: "https://github.com/nuxt/ui/issues/6054"
reactions: 4
comments: 1
labels: "[question, v4]"
---

# How to use theme colors in custom components that follow Nuxt UI patterns

### Package

v4.x

### Description

I'm building custom components following the Nuxt UI component architecture (using tv(), theme files with slots/variants, TypeScript types, etc.) and want to dynamically generate color variants from the configured theme colors, similar to how built-in Nuxt UI components do.

### Environment
- Nuxt: 4.3
- Nuxt UI: 4.4

### Current Setup
I have a custom FactStrip component structured like Nuxt UI components:
#### Theme file (`app/themes/fact-strip.ts`):
```ts
export default {
  slots: {
    root: 'root styles here',
    item: 'item styles here'
  },
  variants: {
    variant: {
      soft: {},
      ghost: {},
    },
    size: {
      sm: {},
      md: {},
      lg: {},
    }
  },
  defaultVariants: {}
}
```
#### Component (`app/components/FactStrip.vue`):...