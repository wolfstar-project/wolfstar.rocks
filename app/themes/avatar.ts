export default {
  base: "avatar",
  slots: {
    root: "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-base-200 align-middle select-none",
    image: "h-full w-full rounded-[inherit] object-cover",
    fallback: "avatar-placeholder truncate leading-none font-medium text-base-content",
    icon: "shrink-0 text-base-content",
  },
  variants: {
    size: {
      xs: "h-8 w-8",
      sm: "h-10 w-10",
      md: "h-16 w-16",
      lg: "h-24 w-24",
      xl: "h-32 w-32",
    },
    status: {
      online: "avatar-online",
      offline: "avatar-offline",
    },
    shape: {
      circle: "mask mask-circle",
      square: "mask mask-squircle",
    },
  },
  defaultVariants: {
    size: "md",
    shape: "circle",
  },
} as const;
