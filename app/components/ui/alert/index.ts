import type { VariantProps } from "tailwind-variants";
import type { HTMLAttributes } from "vue";
import type { AvatarProps } from "@/components/ui/avatar";
import type { ButtonProps } from "@/components/ui/button";
import { tv } from "tailwind-variants";

export { default as Alert } from "./Alert.vue";

export const alert = tv({
  slots: {
    root: "alert relative overflow-hidden w-full rounded-lg p-4 flex gap-2.5",
    wrapper: "min-w-0 flex-1 flex flex-col",
    title: "text-sm font-medium",
    description: "text-sm opacity-90",
    icon: "shrink-0 size-5",
    avatar: "shrink-0",
    avatarSize: "2xl",
    actions: "flex flex-wrap gap-1.5 shrink-0",
    close: "p-0",
  },
  variants: {
    color: {
      primary: "alert-primary",
      secondary: "alert-secondary",
      accent: "alert-accent",
      success: "alert-success",
      info: "alert-info",
      warning: "alert-warning",
      error: "alert-error",
      neutral: "",
    },
    variant: {
      solid: "",
      outline: "alert-outline",
      soft: "alert-soft",
      dash: "alert-dash",
      subtle: "",
    },
    orientation: {
      horizontal: {
        root: "alert-horizontal items-center",
      },
      vertical: {
        root: "alert-vertical items-start",
        actions: "items-start mt-2.5",
      },
    },
    title: {
      true: {
        description: "mt-1",
      },
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "subtle",
      class: {
        root: "bg-primary/10 text-primary ring ring-inset ring-primary/25",
      },
    },
    {
      color: "secondary",
      variant: "subtle",
      class: {
        root: "bg-secondary/10 text-secondary ring ring-inset ring-secondary/25",
      },
    },
    {
      color: "accent",
      variant: "subtle",
      class: {
        root: "bg-accent/10 text-accent ring ring-inset ring-accent/25",
      },
    },
    {
      color: "success",
      variant: "subtle",
      class: {
        root: "bg-success/10 text-success ring ring-inset ring-success/25",
      },
    },
    {
      color: "info",
      variant: "subtle",
      class: {
        root: "bg-info/10 text-info ring ring-inset ring-info/25",
      },
    },
    {
      color: "warning",
      variant: "subtle",
      class: {
        root: "bg-warning/10 text-warning ring ring-inset ring-warning/25",
      },
    },
    {
      color: "error",
      variant: "subtle",
      class: {
        root: "bg-error/10 text-error ring ring-inset ring-error/25",
      },
    },
    {
      color: "neutral",
      variant: "solid",
      class: {
        root: "text-inverted bg-inverted",
      },
    },
    {
      color: "neutral",
      variant: "outline",
      class: {
        root: "text-highlighted bg-default ring ring-inset ring-default",
      },
    },
    {
      color: "neutral",
      variant: "soft",
      class: {
        root: "text-highlighted bg-elevated/50",
      },
    },
    {
      color: "neutral",
      variant: "subtle",
      class: {
        root: "text-highlighted bg-elevated/50 ring ring-inset ring-accented",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
    variant: "solid",
  },
});

type AlertVariants = VariantProps<typeof alert>;

export interface AlertProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: string;
  title?: string;
  description?: string;
  /**
   * @IconifyIcon
   */
  icon?: string;
  avatar?: AvatarProps;
  /**
   * @defaultValue 'primary'
   */
  color?: AlertVariants["color"];
  /**
   * @defaultValue 'solid'
   */
  variant?: AlertVariants["variant"];
  /**
   * The orientation between the content and the actions.
   * @defaultValue 'vertical'
   */
  orientation?: AlertVariants["orientation"];
  /**
   * Display a list of actions:
   * - under the title and description when orientation is `vertical`
   * - next to the close button when orientation is `horizontal`
   * `{ size: 'xs' }`{lang="ts-type"}
   */
  actions?: ButtonProps[];
  /**
   * Display a close button to dismiss the alert.
   * `{ size: 'md', color: 'neutral', variant: 'link' }`{lang="ts-type"}
   * @emits 'update:open'
   * @defaultValue false
   */
  close?: boolean | Partial<ButtonProps>;
  /**
   * The icon displayed in the close button.
   * @defaultValue appConfig.ui.icons.close
   * @IconifyIcon
   */
  closeIcon?: string;
  class?: HTMLAttributes["class"];
  ui?: Partial<typeof alert.slots>;
}

export interface AlertEmits {
  (e: "update:open", value: boolean): void;
}

export interface AlertSlots {
  leading: (props?: object) => any;

  title: (props?: object) => any;

  description: (props?: object) => any;

  actions: (props?: object) => any;

  close: (props: { ui: any }) => any;
}
