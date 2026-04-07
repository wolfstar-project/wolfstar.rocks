---
number: 9926
title: "What does project-centric config give me that package-centric doesn't? Turborepo related topic"
category: "Q&A"
created: 2026-03-20
url: "https://github.com/vitest-dev/vitest/discussions/9926"
upvotes: 1
comments: 1
answered: true
---

# What does project-centric config give me that package-centric doesn't? Turborepo related topic

The Turborepo docs on structuring vitest recommend a hybrid approach: task-centric configuration on CI and project-centric configuration for local development.

I currently use task-centric config exclusively, all task definitions live in my root `turbo.json`, and package-level `turbo.json` files only carry `extends` and `tags`. Caching works fine locally with this setup, including for tests and I use a merge report task after running it.

**My question:** What concrete advantage does project-centric config provide over task-centric? This is what I understood from the Vitest docs vs what I do to circumvent it:

Projects
- Single process -> turbo cache
- Unified Reporting -> custom merge-report script

I'm worried I might be missin...

---

## Accepted Answer

The main advantages of Vitest's project-centric config (`workspace` / `projects`) over running things purely through Turborepo tasks:

### 1. Shared type-checking and module resolution

With Vitest projects, all projects share the same Vite pipeline. If package A imports from package B, Vitest resolves it through Vite's module graph directly -- no need to build B first. With Turborepo task-centric, you'd need to ensure dependencies are built before tests run (or configure aliases manually).

### 2. Cross-project test dependencies

If you have integration tests that import from multiple workspace packages, Vitest projects handle this natively. With Turborepo you'd need a separate test task that depends on all relevant packages.

### 3. Watch mode across packages

Vitest's `--watch` in project mode watches all projects simultaneously and re-runs only affected tests when any source file changes. Turborepo's watch mode (`turbo watch`) re-triggers entire tasks, which is coarser.

...