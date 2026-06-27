---
number: 34224
title: Best practice for co-locating page-specific logic and avoiding global pollution without fighting the router
category: Questions
created: 2026-02-01
url: "https://github.com/nuxt/nuxt/discussions/34224"
upvotes: 4
comments: 2
answered: false
---

# Best practice for co-locating page-specific logic and avoiding global pollution without fighting the router

I’ve been working on a large-scale Nuxt application (complex domain logic, distinct portals, etc.), and I’m hitting a recurring architectural friction that I’d love some community insight on.

The Problem is how to best break up large .vue files I have complex pages (for instance an insurance case detail view) where the file size naturally grows large. I want to extract the business logic, types, and helper components to keep the code manageable and readable.

However, the "standard" Nuxt patterns seem to fight against simple code extration for strictly page specific logic:

The global dump that is the ~/composables and ~/components, feels like an antipattern for code that isn't truly generic. It leads to namespace collisions, naming fatigue (useAdminCaseDetailLogic), and orphan code...

---

## Top Comments

**@cernymatej** [maintainer]:

@JonSpeare what exactly do you not like about the current approach? Nuxt is configurable to such extent that it should allow you to do exactly what you're trying to do without any issues. I currently can't think of a case where the proposed configuration would break something.

What would you want the API for this to look like?

**@sunnypatell**:

this is a real pain point in nuxt. the framework doesn't have a first-class "page pod" primitive, but you can build a clean co-location pattern with what exists today.

### the core problem

nuxt's file-based router treats `.ts`, `.tsx`, `.js`, `.jsx`, and `.vue` files in `pages/` as routes. so putting a `controller.ts` next to your page creates a phantom route. and moving everything to `~/composables/` means global namespace pollution, naming fatigue (`useAdminCaseDetailLogic`), and orphaned code.

### the solution: underscore convention + `pages.pattern`

**`nuxt.config.ts`:**

```ts
export default defineNuxtConfig({
  // only .vue files become routes
  pages: {
    pattern: ['**/*.vue'],
  },

...