export default {
  slots: {
    root: "tabs flex items-center gap-2",
    list: "relative flex p-1 group",
    indicator: "absolute transition-[translate,width] duration-200",
    trigger: [
      "tab group relative inline-flex items-center min-w-0 data-[state=inactive]:text-muted hover:data-[state=inactive]:not-disabled:text-default font-medium rounded-md disabled:cursor-not-allowed disabled:tab-disabled",
      "transition-colors",
    ],
    leadingIcon: "shrink-0",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    label: "truncate",
    trailingBadge: "shrink-0",
    trailingBadgeSize: "sm",
    content: "focus:outline-none w-full",
  },
  variants: {
    color: {
      ...Object.fromEntries((colors || []).map((color: string) => [color, ""])),
      neutral: "",
    },
    variant: {
      pill: {
        list: "bg-elevated rounded-lg",
        trigger: "grow",
        indicator: "rounded-md shadow-xs",
      },
      link: {
        list: "border-default",
        indicator: "rounded-full",
        trigger: "focus:outline-none",
      },
      transparent: {
        root: "tabs-glass",
        trigger: "tab-glass",
      },
      box: {
        trigger: "tabs-box",
      },
      border: {
        trigger: "tabs-border",
      },
      lift: {
        trigger: "tabs-lift",
      },
    },
    orientation: {
      horizontal: {
        root: "flex-col",
        list: "w-full",
        indicator: "left-0 w-(--reka-tabs-indicator-size) translate-x-(--reka-tabs-indicator-position)",
        trigger: "justify-center",
      },
      vertical: {
        list: "flex-col",
        indicator: "top-0 h-(--reka-tabs-indicator-size) translate-y-(--reka-tabs-indicator-position)",
      },
    },
    size: {
      xs: {
        trigger: "px-2 py-1 text-xs gap-1",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
      },
      sm: {
        trigger: "px-2.5 py-1.5 text-xs gap-1.5",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
      },
      md: {
        trigger: "px-3 py-1.5 text-sm gap-1.5",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
      },
      lg: {
        trigger: "px-3 py-2 text-sm gap-2",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
      },
      xl: {
        trigger: "px-3 py-2 text-base gap-2",
        leadingIcon: "size-6",
        leadingAvatarSize: "xs",
      },
    },
    active: {
      true: {
        root: "tab-active",
      },
      false: {
        root: "",
      },
    },
    responsive: {
      true: {
        label: "hidden sm:inline",
      },
    },
  },
  compoundVariants: [
    ...(options.theme.colors || []).map((color: string) => ([
      {
        color,
        variant: "pill",
        class: {
          indicator: `bg-${color}`,
          trigger: `data-[state=active]:text-neutral data-[state=active]:tab-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-${color} `,
        },
      },
      {
        color,
        variant: "link",
        class: {
          indicator: `bg-${color}`,
          trigger: `data-[state=active]:text-${color} data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color} `,
        },
      },
      {
        color,
        variant: "box",
        class: {
          indicator: `bg-${color}`,
          trigger: `data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color} `,
        },
      },
      {
        color,
        variant: "border",
        class: {
          list: "border-b",
          indicator: `bg-${color}`,
          trigger: `data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color} `,
        },
      },
      {
        color,
        variant: "transparent",
        class: {
          indicator: `bg-${color}`,
          trigger: `data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color} `,
        },
      },
    ])) as any,
    {
      orientation: "horizontal",
      variant: "pill",
      class: {
        indicator: "inset-y-1",
      },
    },
    {
      orientation: "horizontal",
      variant: "link",
      class: {
        list: "border-b -mb-px",
        indicator: "-bottom-px h-px",
      },
    },
    {
      orientation: "vertical",
      variant: "pill",
      class: {
        indicator: "inset-x-1",
        list: "items-center",
      },
    },
    {
      orientation: "vertical",
      variant: "link",
      class: {
        list: "border-s -ms-px",
        indicator: "-start-px w-px",
      },
    },
    {
      color: "primary",
      variant: "pill",
      class: {
        indicator: "bg-primary",
        trigger: "data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
      },
    },
    {
      color: "neutral",
      variant: "pill",
      class: {
        indicator: "bg-inverted",
        trigger: "data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverted",
      },
    },
    {
      color: "primary",
      variant: "link",
      class: {
        indicator: "bg-primary",
        trigger: "data-[state=active]:text-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
      },
    },
    {
      color: "neutral",
      variant: "link",
      class: {
        indicator: "bg-inverted",
        trigger: "data-[state=active]:text-highlighted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted",
      },

    },
    {
      color: "neutral",
      variant: "box",
      class: {
        indicator: "bg-neutral",
        trigger: "data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral ",
      },
    },
    {
      color: "neutral",
      variant: "box",
      class: {
        indicator: "bg-neutral",
        trigger: "data-[state=active]:text-neutral data-[state=active]:tab-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral ",
      },
    },
    {
      color: "neutral",
      variant: "border",
      class: {
        list: "border-b",
        indicator: "bg-neutral",
        trigger: "data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral ",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
    variant: "box",
    size: "md",
  },
};
