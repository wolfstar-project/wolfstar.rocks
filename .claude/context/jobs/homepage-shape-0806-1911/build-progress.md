## WolfStar homepage

Files modified:

- `app/pages/(marketing)/wolfstar/index.vue`
- `app/pages/(marketing)/wolfstar/@components/HeroSection.vue`
- `app/pages/(marketing)/wolfstar/@components/ProductProofSection.vue`
- `app/pages/(marketing)/wolfstar/@components/ModerationShowcase.vue`
- `app/pages/(marketing)/wolfstar/@components/CommandsSection.vue`
- `app/pages/(marketing)/wolfstar/@components/DashboardSection.vue`
- `app/pages/(marketing)/wolfstar/@components/CtaSection.vue`
- `app/components/OtherApps.vue`
- `app/components/SurfaceCard.vue`
- `app/composables/useApp.ts`
- `app/types/constants.ts`
- `app/utils/constants.ts`
- `test/nuxt/a11y.spec.ts`
- `test/nuxt/ssr.spec.ts`

Removed:

- Generic homepage stat strip
- Generic bento feature grid
- Fabricated testimonial section
- Fabricated dashboard member preview and associated fixtures/types

Criteria satisfied:

- C1–C7: links and interactive demonstrations verified in component tests and desktop walkthrough.
- C8–C9: 375px mobile and 1440px desktop layouts manually verified without page overflow.
- C10: light/dark semantic tokens covered by the design-token and full test suites.
- C11: consolidated axe coverage passes for all changed homepage components.
- C12: SSR component coverage and production prerender pass.

Verification completed:

- `NUXT_PUBLIC_SITE_URL=http://localhost:3000 pnpm build`
- `pnpm lint:fix`
- `pnpm typecheck`
- `pnpm test` — 125 files, 1,572 tests passed
- `pnpm design:lint`
- Desktop and mobile browser walkthrough, including AutoMod and `/kick` interactions
