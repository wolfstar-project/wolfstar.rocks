export default {
  slots: {
    content: "min-w-32 bg-default shadow-lg rounded-md ring ring-default overflow-hidden data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-dropdown-menu-content-transform-origin) flex flex-col card-glass",
    viewport: "relative divide-y divide-default scroll-py-1 overflow-y-auto flex-1 animate-fade-in",
    arrow: "fill-default",
    group: "p-1 isolate animate-fade-in-up",
    label: "w-full flex items-center font-semibold text-highlighted animate-fade-in",
    separator: "-mx-1 my-1 h-px bg-border",
    item: "group relative w-full flex items-start select-none outline-none before:absolute before:z-[-1] before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75 transition-all duration-300",
    itemLeadingIcon: "shrink-0 transition-all duration-200",
    itemLeadingAvatar: "shrink-0",
    itemLeadingAvatarSize: "",
    itemTrailing: "ms-auto inline-flex gap-1.5 items-center transition-all duration-200",
    itemTrailingIcon: "shrink-0 transition-transform duration-200",
    itemTrailingKbds: "hidden lg:inline-flex items-center shrink-0",
    itemTrailingKbdsSize: "",
    itemWrapper: "flex-1 flex flex-col text-start min-w-0",
    itemLabel: "truncate",
    itemDescription: "truncate text-muted transition-colors duration-200",
    itemLabelExternalIcon: "inline-block size-3 align-top text-dimmed",
  },
  variants: {
    color: {
      primary: "",
      secondary: "",
      success: "",
      info: "",
      warning: "",
      error: "",
      neutral: "",
    },
    active: {
      true: {
        item: "text-highlighted before:bg-base-100 shadow-sm hover-lift",
        itemLeadingIcon: "text-default scale-110",
      },
      false: {
        item: [
          "text-default data-highlighted:text-highlighted data-[state=open]:text-highlighted data-highlighted:before:bg-base-100/50 data-[state=open]:before:bg-base-100/50 hover-scale",
          "transition-all duration-300 before:transition-all",
        ],
        itemLeadingIcon: [
          "text-dimmed group-data-highlighted:text-default group-data-[state=open]:text-default group-data-highlighted:scale-110 group-data-[state=open]:scale-110",
          "transition-all duration-200",
        ],
      },
    },
    loading: {
      true: {
        itemLeadingIcon: "animate-spin",
      },
    },
    size: {
      xs: {
        label: "p-1 text-xs gap-1 animate-fade-in-delay-1",
        item: "p-1 text-xs gap-1 animate-fade-in-up",
        itemLeadingIcon: "size-4",
        itemLeadingAvatarSize: "3xs",
        itemTrailingIcon: "size-4",
        itemTrailingKbds: "gap-0.5",
        itemTrailingKbdsSize: "sm",
      },
      sm: {
        label: "p-1.5 text-xs gap-1.5 animate-fade-in-delay-1",
        item: "p-1.5 text-xs gap-1.5 animate-fade-in-up",
        itemLeadingIcon: "size-4",
        itemLeadingAvatarSize: "3xs",
        itemTrailingIcon: "size-4",
        itemTrailingKbds: "gap-0.5",
        itemTrailingKbdsSize: "sm",
      },
      md: {
        label: "p-1.5 text-sm gap-1.5 animate-fade-in-delay-1",
        item: "p-1.5 text-sm gap-1.5 animate-fade-in-up",
        itemLeadingIcon: "size-5",
        itemLeadingAvatarSize: "2xs",
        itemTrailingIcon: "size-5",
        itemTrailingKbds: "gap-0.5",
        itemTrailingKbdsSize: "md",
      },
      lg: {
        label: "p-2 text-sm gap-2 animate-fade-in-delay-1",
        item: "p-2 text-sm gap-2 animate-fade-in-up",
        itemLeadingIcon: "size-5",
        itemLeadingAvatarSize: "2xs",
        itemTrailingIcon: "size-5",
        itemTrailingKbds: "gap-1",
        itemTrailingKbdsSize: "md",
      },
      xl: {
        label: "p-2 text-base gap-2 animate-fade-in-delay-1",
        item: "p-2 text-base gap-2 animate-fade-in-up",
        itemLeadingIcon: "size-6",
        itemLeadingAvatarSize: "xs",
        itemTrailingIcon: "size-6",
        itemTrailingKbds: "gap-1",
        itemTrailingKbdsSize: "lg",
      },
    },
  },
  compoundVariants: [
    {
      color: "primary",
      active: false,
      class: {
        item: "text-primary data-highlighted:text-primary data-highlighted:before:bg-primary/10 data-[state=open]:before:bg-primary/10 data-highlighted:shadow-sm hover-scale",
        itemLeadingIcon: "text-primary/75 group-data-highlighted:text-primary group-data-[state=open]:text-primary group-data-highlighted:scale-110 group-data-[state=open]:scale-110 transition-all duration-200",
      },
    },
    {
      color: "primary",
      active: true,
      class: {
        item: "text-primary before:bg-primary/10 shadow-md hover-lift relative",
        itemLeadingIcon: "text-primary scale-110",
      },
    },
  ],
  defaultVariants: {
    size: "md",
  },

};
