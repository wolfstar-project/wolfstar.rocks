import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

export function useBreakpoint() {
  const breakpoints = useBreakpoints(breakpointsTailwind);

  const isMobile = breakpoints.smaller("sm");
  const isTablet = breakpoints.smaller("lg");
  const isDesktop = breakpoints.smaller("2xl");

  const smAndLarger = breakpoints.greaterOrEqual("sm"); // sm and larger
  const largerThanSm = breakpoints.greater("sm"); // only larger than sm
  const lgAndSmaller = breakpoints.smallerOrEqual("lg"); // lg and smaller
  const smallerThanLg = breakpoints.smaller("lg"); // only smaller than lg
  const xlAndLarger = breakpoints.greaterOrEqual("xl"); // xl and larger
  const largerThanXl = breakpoints.greater("xl"); // only larger than xl
  const xlAndSmaller = breakpoints.smallerOrEqual("xl"); // xl and smaller
  const smallerThanXl = breakpoints.smaller("xl"); // only smaller than xl
  const xxlAndLarger = breakpoints.greaterOrEqual("2xl"); // 2xl and larger
  const largerThanXxl = breakpoints.greater("2xl"); // only larger than 2xl
  const xxlAndSmaller = breakpoints.smallerOrEqual("2xl"); // 2xl and smaller
  const smallerThanXxl = breakpoints.smaller("2xl"); // only smaller than 2xl

  return { isMobile, isTablet, isDesktop, smAndLarger, largerThanSm, lgAndSmaller, smallerThanLg, xlAndLarger, largerThanXl, xlAndSmaller, smallerThanXl, xxlAndLarger, largerThanXxl, xxlAndSmaller, smallerThanXxl };
}
