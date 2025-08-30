<template>
  <Primitive :as="as" :data-orientation="orientation" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <slot name="leading">
      <Avatar v-if="avatar" :size="((props.ui?.avatarSize || ui.avatarSize()) as AvatarProps['size'])" v-bind="avatar" :class="ui.avatar({ class: props.ui?.avatar })" />
      <Icon v-else-if="icon" :name="icon" :class="ui.icon({ class: props.ui?.icon })" />
    </slot>

    <div :class="ui.wrapper({ class: props.ui?.wrapper })">
      <div v-if="title || !!slots.title" :class="ui.title({ class: props.ui?.title })">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <div v-if="description || !!slots.description" :class="ui.description({ class: props.ui?.description })">
        <slot name="description">
          {{ description }}
        </slot>
      </div>

      <div v-if="orientation === 'vertical' && (actions?.length || !!slots.actions)" :class="ui.actions({ class: props.ui?.actions })">
        <slot name="actions">
          <Button v-for="(action, index) in actions" :key="index" size="xs" v-bind="action" />
        </slot>
      </div>
    </div>

    <div v-if="(orientation === 'horizontal' && (actions?.length || !!slots.actions)) || close" :class="ui.actions({ class: props.ui?.actions, orientation: 'horizontal' })">
      <template v-if="orientation === 'horizontal' && (actions?.length || !!slots.actions)">
        <slot name="actions">
          <Button v-for="(action, index) in actions" :key="index" size="xs" v-bind="action" />
        </slot>
      </template>

      <slot name="close" :ui="ui">
        <Button
          v-if="close"
          :icon="closeIcon || 'lucide:x'"
          color="neutral"
          variant="link"
          aria-label="Close..."
          v-bind="(typeof close === 'object' ? close as Partial<ButtonProps> : {})"
          :class="ui.close({ class: props.ui?.close })"
          @click="emits('update:open', false)"
        />
      </slot>
    </div>
  </Primitive>
</template>

<script lang="ts">
import type { VariantProps } from "tailwind-variants";
import type { AvatarProps, ButtonProps } from "@/components/ui/element";

import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "relative overflow-hidden w-full rounded-lg p-4 flex gap-2.5 alert",
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
    orientation: {
      horizontal: {
        root: "items-center",
        actions: "items-center",
      },
      vertical: {
        root: "items-start",
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
      variant: "solid",
      class: {
        root: "alert-primary",
      },
    },
    {
      color: "primary",
      variant: "outline",
      class: {
        root: "alert-primary border-primary/20",
      },
    },
    {
      color: "primary",
      variant: "soft",
      class: {
        root: "alert-primary bg-opacity-10",
      },
    },
    {
      color: "primary",
      variant: "subtle",
      class: {
        root: "alert-primary bg-opacity-10 border border-primary/20",
      },
    },
    {
      color: "success",
      variant: "solid",
      class: {
        root: "alert-success",
      },
    },
    {
      color: "success",
      variant: "outline",
      class: {
        root: "alert-success border-success/20",
      },
    },
    {
      color: "success",
      variant: "soft",
      class: {
        root: "alert-success bg-opacity-10",
      },
    },
    {
      color: "success",
      variant: "subtle",
      class: {
        root: "alert-success bg-opacity-10 border border-success/20",
      },
    },
    {
      color: "warning",
      variant: "solid",
      class: {
        root: "alert-warning",
      },
    },
    {
      color: "warning",
      variant: "outline",
      class: {
        root: "alert-warning border-warning/20",
      },
    },
    {
      color: "warning",
      variant: "soft",
      class: {
        root: "alert-warning bg-opacity-10",
      },
    },
    {
      color: "warning",
      variant: "subtle",
      class: {
        root: "alert-warning bg-opacity-10 border border-warning/20",
      },
    },
    {
      color: "error",
      variant: "solid",
      class: {
        root: "alert-error",
      },
    },
    {
      color: "error",
      variant: "outline",
      class: {
        root: "alert-error border-error/20",
      },
    },
    {
      color: "error",
      variant: "soft",
      class: {
        root: "alert-error bg-opacity-10",
      },
    },
    {
      color: "error",
      variant: "subtle",
      class: {
        root: "alert-error bg-opacity-10 border border-error/20",
      },
    },
    {
      color: "info",
      variant: "solid",
      class: {
        root: "alert-info",
      },
    },
    {
      color: "info",
      variant: "outline",
      class: {
        root: "alert-info border-info/20",
      },
    },
    {
      color: "info",
      variant: "soft",
      class: {
        root: "alert-info bg-opacity-10",
      },
    },
    {
      color: "info",
      variant: "subtle",
      class: {
        root: "alert-info bg-opacity-10 border border-info/20",
      },
    },
    {
      color: "neutral",
      variant: "solid",
      class: {
        root: "alert-neutral",
      },
    },
    {
      color: "neutral",
      variant: "outline",
      class: {
        root: "alert-neutral border-neutral/20",
      },
    },
    {
      color: "neutral",
      variant: "soft",
      class: {
        root: "alert-neutral bg-opacity-10",
      },
    },
    {
      color: "neutral",
      variant: "subtle",
      class: {
        root: "alert-neutral bg-opacity-10 border border-neutral/20",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
    variant: "solid",
  },
});

type AlertVariants = VariantProps<typeof theme>;

export interface AlertProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
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
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface AlertEmits {
  "update:open": [value: boolean];
}

export interface AlertSlots {
  leading(props?: {}): any;
  title(props?: {}): any;
  description(props?: {}): any;
  actions(props?: {}): any;
  close(props: { ui: { [K in keyof Required<typeof theme.slots>]: (props?: Record<string, any>) => string } }): any;
}
</script>

<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed } from "vue";
import { Avatar, Button, Icon } from "@/components/ui/element";

const props = withDefaults(defineProps<AlertProps>(), {
  orientation: "vertical",
});
const emits = defineEmits<AlertEmits>();
const slots = defineSlots<AlertSlots>();

const ui = computed(() => tv({ extend: theme })({
  color: props.color,
  variant: props.variant,
  orientation: props.orientation,
  title: !!props.title || !!slots.title,
}));
</script>
