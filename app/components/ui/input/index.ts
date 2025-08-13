import type { VariantProps } from "tailwind-variants";
import type { HTMLAttributes, InputHTMLAttributes } from "vue";
import type { UseComponentIconsProps } from "~/composables/useComponentIcons";
import type { PartialString } from "~/types/utils";
import { tv } from "tailwind-variants";
import { buttonGroupVariantWithRoot } from "../button-group";

export { default as Input } from "./Input.vue";

export const inputWithoutTV = {
  slots: {
    root: "relative inline-flex items-center",
    base: [
      "input w-full", // Using daisyUI input class
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    leading: "absolute inset-y-0 start-0 flex items-center",
    leadingIcon: "shrink-0 text-base-content/50",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    trailing: "absolute inset-y-0 end-0 flex items-center",
    trailingIcon: "shrink-0 text-base-content/50",
  },
  variants: {
    ...buttonGroupVariantWithRoot,
    color: {
      primary: "input-primary",
      secondary: "input-secondary",
      success: "input-success",
      info: "input-info",
      warning: "input-warning",
      error: "input-error",
      neutral: "",
    },
    size: {
      xs: {
        base: "input-xs",
        leading: "ps-2",
        trailing: "pe-2",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      sm: {
        base: "input-sm",
        leading: "ps-2.5",
        trailing: "pe-2.5",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      md: {
        base: "input-md",
        leading: "ps-2.5",
        trailing: "pe-2.5",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      lg: {
        base: "input-lg",
        leading: "ps-3",
        trailing: "pe-3",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      xl: {
        base: "input-xl",
        leading: "ps-3",
        trailing: "pe-3",
        leadingIcon: "size-6",
        leadingAvatarSize: "xs",
        trailingIcon: "size-6",
      },
    },
    variant: {
      bordered: "input-bordered",
      ghost: "input-ghost",
    },
    leading: {
      true: "",
    },
    trailing: {
      true: "",
    },
    loading: {
      true: "",
    },
    highlight: {
      true: "",
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: ["bordered"],
      class: "focus:outline-none focus:ring-2 focus:ring-primary",
    },
    {
      color: "primary",
      highlight: true,
      class: "ring-2 ring-primary",
    },
    {
      color: "neutral",
      variant: ["bordered"],
      class: "focus:outline-none focus:ring-2 focus:ring-base-content",
    },
    {
      color: "neutral",
      highlight: true,
      class: "ring-2 ring-base-content",
    },
    // Keep padding compound variants
    {
      leading: true,
      size: "xs",
      class: "ps-7",
    },
    {
      leading: true,
      size: "sm",
      class: "ps-8",
    },
    {
      leading: true,
      size: "md",
      class: "ps-9",
    },
    {
      leading: true,
      size: "lg",
      class: "ps-10",
    },
    {
      leading: true,
      size: "xl",
      class: "ps-11",
    },
    {
      trailing: true,
      size: "xs",
      class: "pe-7",
    },
    {
      trailing: true,
      size: "sm",
      class: "pe-8",
    },
    {
      trailing: true,
      size: "md",
      class: "pe-9",
    },
    {
      trailing: true,
      size: "lg",
      class: "pe-10",
    },
    {
      trailing: true,
      size: "xl",
      class: "pe-11",
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
    size: "md",
    color: "primary",
    variant: "bordered",
  },
};

export const input = tv({
  slots: {
    root: "relative inline-flex items-center",
    base: [
      "input w-full", // Using daisyUI input class
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    leading: "absolute inset-y-0 start-0 flex items-center",
    leadingIcon: "shrink-0 text-base-content/50",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    trailing: "absolute inset-y-0 end-0 flex items-center",
    trailingIcon: "shrink-0 text-base-content/50",
  },
  variants: {
    type: {
      file: "file:mr-1.5 file:font-medium file:text-gray-500 dark:file:text-gray-400 file:outline-none",
    },
    color: {
      primary: "input-primary",
      secondary: "input-secondary",
      success: "input-success",
      info: "input-info",
      warning: "input-warning",
      error: "input-error",
      neutral: "",
    },
    size: {
      xs: {
        base: "input-xs",
        leading: "ps-2",
        trailing: "pe-2",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      sm: {
        base: "input-sm",
        leading: "ps-2.5",
        trailing: "pe-2.5",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      md: {
        base: "input-md",
        leading: "ps-2.5",
        trailing: "pe-2.5",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      lg: {
        base: "input-lg",
        leading: "ps-3",
        trailing: "pe-3",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      xl: {
        base: "input-xl",
        leading: "ps-3",
        trailing: "pe-3",
        leadingIcon: "size-6",
        leadingAvatarSize: "xs",
        trailingIcon: "size-6",
      },
    },
    variant: {
      bordered: "input-bordered",
      ghost: "input-ghost",
      outline: "bg-trasparent",

    },
    leading: {
      true: "",
    },
    trailing: {
      true: "",
    },
    loading: {
      true: "",
    },
    highlight: {
      true: "",
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: ["bordered"],
      class: "focus:ring-2 focus:ring-primary focus:outline-none",
    },
    {
      color: "primary",
      highlight: true,
      class: "ring-2 ring-primary",
    },
    {
      color: "neutral",
      variant: ["bordered"],
      class: "focus:ring-2 focus:ring-base-content focus:outline-none",
    },
    {
      color: "neutral",
      highlight: true,
      class: "ring-2 ring-base-content",
    },
    // Keep padding compound variants
    {
      leading: true,
      size: "xs",
      class: "ps-7",
    },
    {
      leading: true,
      size: "sm",
      class: "ps-8",
    },
    {
      leading: true,
      size: "md",
      class: "ps-9",
    },
    {
      leading: true,
      size: "lg",
      class: "ps-10",
    },
    {
      leading: true,
      size: "xl",
      class: "ps-11",
    },
    {
      trailing: true,
      size: "xs",
      class: "pe-7",
    },
    {
      trailing: true,
      size: "sm",
      class: "pe-8",
    },
    {
      trailing: true,
      size: "md",
      class: "pe-9",
    },
    {
      trailing: true,
      size: "lg",
      class: "pe-10",
    },
    {
      trailing: true,
      size: "xl",
      class: "pe-11",
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
    size: "md",
    color: "primary",
    variant: "bordered",
  },
});

export type InputVariants = VariantProps<typeof input>;

export interface InputProps extends UseComponentIconsProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  id?: string;
  name?: string;
  type?: InputHTMLAttributes["type"];
  /** The placeholder text when the input is empty. */
  placeholder?: string;
  /**
   * @defaultValue 'primary'
   */
  color?: InputVariants["color"];
  /**
   * @defaultValue 'bordered'
   */
  variant?: InputVariants["variant"];
  /**
   * @defaultValue 'md'
   */
  size?: InputVariants["size"];
  required?: boolean;
  autocomplete?: InputHTMLAttributes["autocomplete"];
  autofocus?: boolean;
  autofocusDelay?: number;
  disabled?: boolean;
  /** Highlight the ring color like a focus state. */
  highlight?: boolean;
  class?: HTMLAttributes["class"];
  ui?: PartialString<typeof input.slots>;
}

export interface InputEmits {
  (e: "update:modelValue", payload: string | number): void;
  (e: "blur", event: FocusEvent): void;
  (e: "change", event: Event): void;
}

export interface InputSlots {
  leading: (props?: object) => any;
  default: (props?: object) => any;
  trailing: (props?: object) => any;
}
