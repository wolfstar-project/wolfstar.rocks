---
number: 493
title: "fix: asSeoCollection schema parameter not working with @nuxt/content 3.7.1"
type: bug
state: closed
created: 2025-10-27
url: "https://github.com/harlan-zw/nuxt-seo/issues/493"
reactions: 1
comments: 1
labels: "[bug]"
---

# fix: asSeoCollection schema parameter not working with @nuxt/content 3.7.1

## Description

When passing a `schema` parameter to `asSeoCollection`, the custom schema fields are not created in the SQLite database, causing runtime errors when querying those fields.

## Environment

- **Nuxt**: 4.2.0
- **@nuxt/content**: 3.7.1
- **@nuxtjs/seo**: 3.2.2
- **Zod**: 4.1.12 (imported from `zod/v4`)
- **Node**: 22.21.0
- **Package Manager**: pnpm
- **Database**: better-sqlite3 12.4.1

 **https://github.com/andy820621/nuxt-content-with-nuxt-seo-bug-test**

### Steps to Reproduce

1. Clone the repository:
   ```bash
   git clone https://github.com/andy820621/nuxt-content-with-nuxt-seo-bug-test.git
   cd nuxt-content-with-nuxt-seo-bug-test
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run development server:
   ```bash
   pnpm dev
   ```

...

---

## Top Comments

**@andy820621**:

## Update: Root Cause Identified - Zod Instance Mismatch

### The Real Problem
The issue was **NOT** caused by `@nuxt/content` v3.7.1 or the way `asSeoCollection` is used. 

The root cause is **Zod instance mismatch** when importing `z` from different sources.

###  Wrong (Causes the bug):
```ts
import { defineCollection, defineContentConfig } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'
import { z } from 'zod/v4'  // ❌ Different Zod instance
```

...