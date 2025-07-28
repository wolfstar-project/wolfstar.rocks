import type { VariantProps } from "tailwind-variants";
import type { HTMLAttributes } from "vue";
import type { LinkProps } from "../link";
import type { UseComponentIconsProps } from "~/composables/useComponentIcons";
import { tv } from "tailwind-variants";
import { buttonGroupVariant } from "../button-group";

export { default as AnimatedButton } from "./AnimatedButton.vue";
export { default as Button } from "./Button.vue";
export { default as RippleButton } from "./RippleButton.vue";

// Type-safe color definitions with readonly array
const colors = ["primary", "secondary", "success", "error", "info", "warning", "neutral"] as const;

export const buttonVariants = tv({
  slots: {
    base: [
      "btn", // daisyUI button base class
      //	'inline-flex items-center',
      //	'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed',
      //	'disabled:opacity-75 aria-disabled:opacity-75'
    ],
    label: "truncate",
    leadingIcon: "shrink-0",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    trailingIcon: "shrink-0",
  },
  variants: {
    ...buttonGroupVariant,
    color: { ...Object.fromEntries(colors.map(color => [color, `btn-${color}`])) },
    variant: {
      outline: "btn-outline",
      soft: "btn-ghost",
      dash: "btn-dash",
      ghost: "btn-ghost",
      link: "btn-link",
    },
    size: {
      xs: {
        base: "gap-1 btn-xs",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      sm: {
        base: "gap-1.5 btn-sm",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      md: {
        base: "gap-1.5 btn-md",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      lg: {
        base: "gap-2 btn-lg",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      xl: {
        base: "gap-2 btn-xl",
        leadingIcon: "size-6",
        leadingAvatarSize: "xs",
        trailingIcon: "size-6",
      },
    },
    block: {
      true: "btn-block",
    },
    square: {
      true: "btn-square",
    },
    circle: {
      true: "btn-circle",
    },
    leading: {
      true: "",
    },
    trailing: {
      true: "",
    },
    loading: {
      true: "loading loading-spinner",
    },
    active: {
      true: {
        base: "btn-active",
      },
      false: {
        base: "",
      },
    },
    responsive: {
      true: {
        label: "hidden sm:inline",
      },
    },
  },
  compoundVariants: [
    // Neutral variants
    {
      color: "neutral",
      class: `disabled:btn-disabled aria-disabled:btn-disabled`,
    },
    {
      color: "neutral",
      variant: "outline",
      class: `disabled:btn-disabled aria-disabled:btn-disabled`,
    },
    {
      color: "neutral",
      variant: "soft",
      class: `disabled:btn-disabled aria-disabled:btn-disabled opacity-80`,
    },
    {
      color: "neutral",
      variant: "dash",
      class: `disabled:btn-disabled aria-disabled:btn-disabled`,
    },
    {
      color: "neutral",
      variant: "ghost",
      class: `disabled:btn-disabled aria-disabled:btn-disabled`,
    },
    {
      color: "neutral",
      variant: "link",
      class: `disabled:btn-disabled aria-disabled:btn-disabled`,
    },
    {
      size: "xs",
      square: true,
      class: "btn-xs",
    },
    {
      size: "sm",
      square: true,
      class: "btn-sm",
    },
    {
      size: "md",
      square: true,
      class: "btn-md",
    },
    {
      size: "lg",
      square: true,
      class: "btn-lg",
    },
    {
      size: "xl",
      square: true,
      class: "btn-xl",
    },
    {
      loading: true,
      leading: true,
      class: {
        leadingIcon: "animate-spin",
      },
    },
    {
      loading: true,
      leading: false,
      trailing: true,
      class: {
        trailingIcon: "animate-spin",
      },
    },
  ],

  defaultVariants: {
    color: "primary",
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps extends UseComponentIconsProps, Omit<LinkProps, "raw" | "custom"> {
  label?: string;
  color?: ButtonVariants["color"] | string;
  activeColor?: ButtonVariants["color"] | string;
  variant?: ButtonVariants["variant"];
  activeVariant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  square?: boolean;
  block?: boolean;
  circle?: boolean;
  loadingAuto?: boolean;
  responsive?: boolean;
  onClick?: ((event: MouseEvent) => void | Promise<void>) | Array<(event: MouseEvent) => void | Promise<void>>;
  class?: HTMLAttributes["class"];
  ui?: Partial<typeof buttonVariants.slots>;
}

export interface ButtonSlots {
  leading: (props?: object) => unknown;
  default: (props?: object) => unknown;
  trailing: (props?: object) => unknown;
}
