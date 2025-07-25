import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export { default as Badge } from "./Badge.vue";

export const badgeVariants = tv({
  base: "badge",
  variants: {
    variant: {
      primary: "badge badge-primary",
      secondary: "badge badge-secondary",
      eror: "badge badge-error",
      outline: "badge-outline badge",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});
export type BadgeVariants = VariantProps<typeof badgeVariants>;
