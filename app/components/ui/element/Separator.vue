<template>
  <Separator v-bind="rootProps" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div :class="ui.border({ class: props.ui?.border })"></div>

    <template v-if="label || icon || avatar || !!slots.default">
      <div :class="ui.container({ class: props.ui?.container })">
        <slot>
          <span v-if="label" :class="ui.label({ class: props.ui?.label })">{{ label }}</span>
          <Icon v-else-if="icon" :name="icon" :class="ui.icon({ class: props.ui?.icon })" />
          <Avatar v-else-if="avatar" :size="((props.ui?.avatarSize || ui.avatarSize()) as AvatarProps['size'])" v-bind="avatar" :class="ui.avatar({ class: props.ui?.avatar })" />
        </slot>
      </div>

      <div :class="ui.border({ class: props.ui?.border })"></div>
    </template>
  </Separator>
</template>

<script lang="ts">
import type { SeparatorProps as _SeparatorProps } from "reka-ui";
import type { AvatarProps } from "@/components/ui/element";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "flex items-center align-center text-center",
    border: "divider", // Using daisyUI divider class
    container: "font-medium text-base-content flex",
    icon: "shrink-0 size-5",
    avatar: "shrink-0",
    avatarSize: "2xs",
    label: "text-sm",
  },
  variants: {
    color: {
      primary: {
        border: "divider-primary",
      },
      secondary: {
        border: "divider-secondary",
      },
      success: {
        border: "divider-success",
      },
      info: {
        border: "divider-info",
      },
      warning: {
        border: "divider-warning",
      },
      error: {
        border: "divider-error",
      },
      neutral: {
        border: "divider-neutral",
      },
    },
    orientation: {
      horizontal: {
        root: "w-full flex-row",
        border: "divider-horizontal w-full",
        container: "mx-3 whitespace-nowrap",
      },
      vertical: {
        root: "h-full flex-col",
        border: "divider-vertical h-full",
        container: "my-2",
      },
    },
    size: {
      xs: "",
      sm: "",
      md: "",
      lg: "",
      xl: "",
    },
    type: {
      dash: {
        border: "",
      },
      dot: {
        border: "",
      },
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      size: "xs",
    },
    {
      orientation: "horizontal",
      size: "sm",
    },
    {
      orientation: "horizontal",
      size: "md",
    },
    {
      orientation: "horizontal",
      size: "lg",
    },
    {
      orientation: "horizontal",
      size: "xl",
    },
    {
      orientation: "vertical",
      size: "xs",
    },
    {
      orientation: "vertical",
      size: "sm",
    },
    {
      orientation: "vertical",
      size: "md",
    },
    {
      orientation: "vertical",
      size: "lg",
    },
    {
      orientation: "vertical",
      size: "xl",
    },
  ],
  defaultVariants: {
    color: "neutral",
    size: "xs",
  },
});

type SeparatorVariants = VariantProps<typeof theme>;

export interface SeparatorProps extends Pick<_SeparatorProps, "decorative"> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  /** Display a label in the middle. */
  label?: string;
  /**
   * Display an icon in the middle.
   * @IconifyIcon
   */
  icon?: string;
  /** Display an avatar in the middle. */
  avatar?: AvatarProps;
  /**
   * @defaultValue 'neutral'
   */
  color?: SeparatorVariants["color"];
  /**
   * @defaultValue 'xs'
   */
  size?: SeparatorVariants["size"];
  /**
   * @defaultValue 'undefined'
   */
  type?: SeparatorVariants["type"];
  /**
   * The orientation of the separator.
   * @defaultValue 'horizontal'
   */
  orientation?: _SeparatorProps["orientation"];
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface SeparatorSlots {
  default(props?: {}): any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { Separator, useForwardProps } from "reka-ui";
import { computed } from "vue";
import { Avatar, Icon } from "@/components/ui/element";

const props = withDefaults(defineProps<SeparatorProps>(), {
  orientation: "horizontal",
});
const slots = defineSlots<SeparatorSlots>();

const rootProps = useForwardProps(reactivePick(props, "as", "decorative", "orientation"));

const ui = computed(() => tv({ extend: theme })({
  color: props.color,
  orientation: props.orientation,
  size: props.size,
  type: props.type,
}));
</script>
