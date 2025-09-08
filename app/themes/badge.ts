import { colors } from "@/utils/constants";

export default {
  slots: {
    base: [
      "badge", // daisyUI badge base class
      "font-medium inline-flex items-center",
    ],
    label: "truncate",
    leadingIcon: "shrink-0",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    trailingIcon: "shrink-0",
  },
  variants: {
    fieldGroup: {
      horizontal: "not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none",
      vertical: "not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none",
    },
    color: {
      ...Object.fromEntries(colors.map(color => [color, `badge-${color}`])) as {
        [key in UIColors]: string;
      },
    },
    variant: {
      outline: "badge-outline",
      ghost: "badge-ghost",
    },
    size: {
      xs: {
        base: "badge-xs gap-1",
        leadingIcon: "size-3",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-3",
      },
      sm: {
        base: "badge-sm gap-1",
        leadingIcon: "size-3",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-3",
      },
      md: {
        base: "badge-md gap-1",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      lg: {
        base: "badge-lg gap-1.5",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      xl: {
        base: "badge-xl gap-1.5",
        leadingIcon: "size-6",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-6",
      },
    },
    square: {
      true: "",
    },
  },
  compoundVariants: [
    // Square variants with size adjustments
    {
      size: "xs",
      square: true,
      class: "badge-xs p-0.5",
    },
    {
      size: "sm",
      square: true,
      class: "badge-sm p-1",
    },
    {
      size: "md",
      square: true,
      class: "badge-md p-1",
    },
    {
      size: "lg",
      square: true,
      class: "badge-lg p-1",
    },
    {
      size: "xl",
      square: true,
      class: "badge-xl p-1",
    },
  ],
  defaultVariants: {
    color: "primary",
    size: "md",
  },
} as const;
