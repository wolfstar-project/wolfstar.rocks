---
number: 3652
title: "Calendar: improve month and year select"
type: feature
state: open
created: 2025-03-22
url: "https://github.com/nuxt/ui/issues/3652"
reactions: 28
comments: 7
labels: "[enhancement, v3, p2-medium]"
---

# Calendar: improve month and year select

### Description

The calendar component in V3 doesn't offer a way to quickly jump to a specific month or year.

The datepicker component in V2 allowed the user to click on month name to open up a popover to select a specific month or year: 


Implementing something like this would offer better UX for cases where the user needs to select a year which is far in the past or future (e.g. selecting a birthdate).

I also built a prototype to implement this behaviour:
https://codesandbox.io/p/devbox/hopeful-haze-842lf6?file=%2Fapp%2Fapp.vue




### Additional context

_No response_

---

## Top Comments

**@benjamincanac** [maintainer]:

For reference, there was no DatePicker in Nuxt UI v2 only an example to integrate the external library `v-calendar` inside a Popover: https://ui2.nuxt.com/components/date-picker which you can still do in v3.

We're kind of reliant on Reka UI for such features:
- https://github.com/unovue/reka-ui/issues/2191
- https://github.com/unovue/reka-ui/issues/1730

However, I'll check if it's possible to add a slot to the header that exposes the right data to let users add a Select on the month or year, similar to the shadcn component: https://ui.shadcn.com/docs/components/calendar

**@beingmomen** (+3):

I need this improvment so much

**@beingmomen** (+2):

we need this feature