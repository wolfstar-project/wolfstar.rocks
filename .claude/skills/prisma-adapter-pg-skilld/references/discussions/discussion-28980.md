---
number: 28980
title: Question about Google Analytics usage on Prisma website
category: "Q&A"
created: 2025-12-29
url: "https://github.com/prisma/prisma/discussions/28980"
upvotes: 1
comments: 1
answered: true
---

# Question about Google Analytics usage on Prisma website

### Question

Hi 

First of all, thank you for the incredible work on Prisma, this is probably the best ORM I've worked with so far :)

I noticed that the Prisma website and docs currently use Google Analytics and wanted to ask whether privacy-friendly, OSS analytics alternatives have ever been considered for usage insights.

I'm the creator of Swetrix, an open-source, privacy-first analytics platform used by several OSS projects and documentation sites. It provides traffic insights without cookies, and is privacy-friendly by default.

This is not a request to switch - I'm mainly curious whether this is something the project has discussed before, and whether privacy concerns around analytics are relevant for you guys.

If useful, I’d be hap...

---

## Accepted Answer

**@nurul3101** [maintainer]:

Hi @Blaumaus!

Thank you for your kind words about Prisma ORM.

We are using PostHog for Analytics and it is working very well for us: https://github.com/PostHog/posthog 