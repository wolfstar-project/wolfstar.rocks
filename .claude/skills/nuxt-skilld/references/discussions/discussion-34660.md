---
number: 34660
title: "Feedback on Nuxt 4 Migration DX: The future flag feels premature for production use cases"
category: General
created: 2026-03-21
url: "https://github.com/nuxt/nuxt/discussions/34660"
upvotes: 1
comments: 1
answered: false
---

# Feedback on Nuxt 4 Migration DX: The future flag feels premature for production use cases

While attempting to migrate a Tailwind 4 and PrimeVue project to the Nuxt 4 directory structure using the future: { compatibilityVersion: 4 } flag, the current developer experience feels incredibly broken, frustrating and fragmented, to say the least. 

Specifically:

1. **Path Resolution Chaos:** The way the compatibility flag handles (or fails to handle) aliases for layers like assets/ and content/ creates a 'guessing game' that shouldn't exist in a modern framework.

2. **Plugin Incompatibility:** New standards like Tailwind 4 (Vite-based) seem to collide with the Nuxt 4 virtual file system, leading to IPC connection drops and opaque module resolution errors.
 
3. **The 'In-Between' State:** Shipping a compatibility flag that breaks standard auto-imports and CSS resolution makes...

---

## Top Comments

**@cernymatej** [maintainer] (+2):

Hello, I'm sorry to hear that you've had such a frustrating experience. I know that the goal of many team members, especially Daniel, was to make the migration as smooth as possible. It is important to understand what went wrong in this case so that it can be taken into account during the migration from v4 to v5. Could you please help me understand exactly what you're having trouble with? I'm not sure I fully understand your current setup. Are you using the `compatibilityVersion` flag in a Nuxt 4 project?

There are a large number of production projects running on Nuxt 4 without issues - htt...