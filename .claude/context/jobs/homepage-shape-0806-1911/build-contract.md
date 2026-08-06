# Homepage refinement contract

## What will be built

- Recompose the WolfStar homepage around verified product capabilities.
- Replace generic stats, bento features, fabricated testimonials, and fake member data with:
  - a direct hero proposition,
  - an editorial product-proof section,
  - the existing interactive AutoMod/logging and command demonstrations,
  - an accurate dashboard capability overview,
  - a restrained Staryl cross-link and final invite action.
- Tighten homepage copy, hierarchy, responsive behavior, and accessibility.

## Testable behaviors

- [C1] GIVEN the homepage, WHEN the primary hero action is activated, THEN it opens the WolfStar Discord invite URL.
- [C2] GIVEN the homepage, WHEN “See WolfStar work” is activated, THEN focus/navigation moves to the product demonstration section.
- [C3] GIVEN the product-proof section, WHEN a proof link is activated, THEN it navigates to the matching on-page demonstration or dashboard sign-in route.
- [C4] GIVEN the AutoMod demonstration, WHEN its previous/next controls are activated, THEN the demonstrated filter changes.
- [C5] GIVEN the command demonstration, WHEN a supported slash command is selected and submitted, THEN the displayed response changes.
- [C6] GIVEN the open-source link, WHEN it is activated, THEN the WolfStar repository opens.
- [C7] GIVEN the final CTA, WHEN its primary action is activated, THEN it opens the WolfStar Discord invite URL.
- [C8] GIVEN a 375px viewport, WHEN the homepage loads, THEN hero actions stack and all demos remain within the viewport.
- [C9] GIVEN a 768px viewport, WHEN the homepage loads, THEN editorial sections retain readable hierarchy without horizontal overflow.
- [C10] GIVEN light or dark mode, WHEN the homepage loads, THEN all sections use semantic theme tokens with readable contrast.
- [C11] GIVEN keyboard navigation, WHEN the user tabs through the homepage, THEN interactive elements have logical order, visible focus, and accessible names.
- [C12] GIVEN server rendering, WHEN `/` is requested, THEN the response HTML contains the WolfStar value proposition and primary action.

## Design expectations

- Preserve the existing Architectural Night Sky system and Geist typography.
- Prioritize product evidence over decorative marketing patterns.
- Use ruled editorial grouping, controlled asymmetry, and one clear action per section.
- Avoid invented metrics, testimonials, member data, placeholder roadmap cards, gradient copy, and repeated icon-card grids.
- Keep body copy at least 16px and primary touch targets at least 44px.

## Out of scope

- Changes to dashboard behavior, bot behavior, authentication, or API contracts.
- New product claims not verifiable from the repository.
- Redesigning the Staryl product page.
