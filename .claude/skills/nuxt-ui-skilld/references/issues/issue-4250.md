---
number: 4250
title: UTheme component
type: feature
state: closed
created: 2025-05-28
url: "https://github.com/nuxt/ui/issues/4250"
reactions: 29
comments: 4
labels: "[enhancement, v3, p2-medium]"
---

# UTheme component

### Description

I propose the addition of a UTheme component which would allow scoped theming of components to reduce repeated styling that's error prone when refactoring.

## Example
The Dashboard template has a bunch of forms that have horizontal form fields (label left, input right).

Before:
```html
<UForm ...>
     <UFormField ... class="flex max-sm:flex-col justify-between items-center gap-4">
            ...
     <UFormField>
     <UFormField ... class="flex max-sm:flex-col justify-between items-center gap-4">
            ...
     <UFormField>
<UForm/>
```

After:
```html
<!-- `ui` prop is the same as `app.config.ts` theming config
<UTheme :ui="{
     formField: {
	 slots: {
	     root: "flex max-sm:flex-col justify-between items-center gap-4",
	},
    },
}">
   <UForm ...>
       <UFormField ...>
              ...
       <UFormField>
       <UFormField ...>
              ...
       <UFormField>
   <UForm/>
</UTheme>
```

## Benefits
- Easily componentized. I could create a `AppForm` component which contains the `UTheme` usage with a slot, so now its 1 line to get the exact theming that I want. This makes consistency across the app really easy.
- Nestable - If implemented with provide/inject, you could have an infinite number of UTheme's nested and it would take the latest one

## Implementation
I'd tentatively be willing to implement this. My approach would be:
- Create `UTheme`, it should have a `ui` and `uiPro` prop, each of which take the same type as the `app.config.ts`
- `provide()` those props
- `inject()` those props into each component and merge with passed in `ui` field.
- Theme priority order should be:
    1. `ui` prop passed to component
    2. `ui` prop coming from UTheme component
    3. `ui` config coming from `app.config.ts`

### Additional context

_No response_

---

## Top Comments

**@theLeroy** (+2):

This is a great idea and I would love to see it. It would also be a great idea to have a <UVariant> component that implements variant passing to children in a similar way as this proposed <UTheme> element. If I’m correct, the best way to change all variants (same with color) in a form, for example, is currently to pass the variant as props to the form field and then to the input fields and further as needed. What do you think @command-tab @Bobakanoosh 


...

**@Bobakanoosh** (+1):

@theLeroy Definitely want to do this as a follow up, though I'd imagine it would be on `UTheme` instead:
```html
<UTheme :variants="{ button: 'subtle' }">
```

**@Bobakanoosh**:

> This is a great idea!
> 
> When you say “latest”, do you mean the UTheme closest to the child displaying the themed components? That is, the themed component‘s (e.g UButton) most immediate parent UTheme “wins”? I would assume so.

Yes, the most recent parent wins.

For example:
```html
<UTheme id="a">
    <!-- gets its theme from "a" -->
    <UButton/>
    <UTheme id="b">
          <!-- gets its theme from "b" -->
          <UButton/>
    <UTheme/>
</UTheme>
```