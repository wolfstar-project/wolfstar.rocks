import { breakpointsTailwind } from "@vueuse/core";

export const breakpoints = useBreakpoints(breakpointsTailwind);

export const isSmallScreen = breakpoints.smallerOrEqual("sm");
/** Width below Tailwind `md` (768px). Matches `@media (max-width: 767.98px)`. */
export const isBelowMediumScreen = breakpoints.smaller("md");
export const isMediumOrLargeScreen = breakpoints.between("sm", "xl");
export const isExtraLargeScreen = breakpoints.smallerOrEqual("xl");
