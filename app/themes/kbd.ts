export default {
  base: "kbd",
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
    variant: {
      solid: "",
      outline: "",
      soft: "",
      subtle: "",
    },
    size: {
      sm: "kbd-sm",
      md: "kbd-md",
      lg: "kbd-lg",
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "solid",
      class: "bg-primary text-primary-content",
    },
    {
      color: "primary",
      variant: "outline",
      class: "ring ring-inset ring-primary text-primary bg-base-100",
    },
    {
      color: "primary",
      variant: "soft",
      class: "bg-primary/20 text-primary",
    },
    {
      color: "primary",
      variant: "subtle",
      class: "bg-primary/10 text-primary ring ring-inset ring-primary/25",
    },
    {
      color: "neutral",
      variant: "solid",
      class: "bg-neutral text-neutral-content",
    },
    {
      color: "neutral",
      variant: "outline",
      class: "ring ring-inset ring-neutral text-neutral bg-base-100",
    },
    {
      color: "neutral",
      variant: "soft",
      class: "bg-neutral/20 text-neutral",
    },
    {
      color: "neutral",
      variant: "subtle",
      class: "bg-neutral/10 text-neutral ring ring-inset ring-neutral/25",
    },
  ],
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
};
