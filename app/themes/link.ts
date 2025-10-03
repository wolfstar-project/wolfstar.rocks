import { colors } from "@/utils/constants";

export default {
  base: "link",
  variants: {
    color: {
      ...Object.fromEntries(colors.map(color => [color, `link-${color}`])),
    },
    active: {
      true: "link-primary",
      false: "link hover:link-hover",
    },
    disabled: {
      true: "cursor-not-allowed opacity-75",
    },
  },
};
