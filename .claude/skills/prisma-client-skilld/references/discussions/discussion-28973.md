---
number: 28973
title: Prisma + Nextjs multistage dockerfile run migrations without copying whole node_modules
category: "Q&A"
created: 2025-12-29
url: "https://github.com/prisma/prisma/discussions/28973"
upvotes: 1
comments: 2
answered: true
---

# Prisma + Nextjs multistage dockerfile run migrations without copying whole node_modules

### Question

I have created a dockerfile to generate an image with nextjs 'standalone'. I want to publish this image and have it run migrations when started, so the database is up-to-date. I can't run migrations in the CI or manually, because I want to distribute this image, so it should be self healing.

I don't want to copy all node_modules, bloating the image.
I managed to get a working example with this dockerfile, but as you can see I still need to copy a lot of dependencies.

I tried both to include prisma in devDependencies and dependencies.

...

---

## Accepted Answer

**@nurul3101** [maintainer]:

Thanks for the detailed explanation. Unfortunately, there's currently no official lightweight `@prisma/migrate` package designed specifically for this scenario. The approach you're using is essentially the recommended workaround for now (Related Discussion).