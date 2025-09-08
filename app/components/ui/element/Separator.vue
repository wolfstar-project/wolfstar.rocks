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
    border: "",
    container: "font-medium text-default flex",
    icon: "shrink-0 size-5",
    avatar: "shrink-0",
    avatarSize: "2xs",
    label: "text-sm",
  },
  variants: {
    color: {
      primary: {
        border: "border-primary",
      },
      secondary: {
        border: "border-secondary",
      },
      success: {
        border: "border-success",
      },
      info: {
        border: "border-info",
      },
      warning: {
        border: "border-warning",
      },
      error: {
        border: "border-error",
      },
      neutral: {
        border: "border-default",
      },
    },
    orientation: {
      horizontal: {
        root: "w-full flex-row",
        border: "w-full",
        container: "mx-3 whitespace-nowrap",
      },
      vertical: {
        root: "h-full flex-col",
        border: "h-full",
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
      solid: {
        border: "border-solid",
      },
      dashed: {
        border: "border-dashed",
      },
      dotted: {
        border: "border-dotted",
      },
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      size: "xs",
      class: {
        border: "border-t",
      },
    },
    {
      orientation: "horizontal",
      size: "sm",
      class: {
        border: "border-t-[2px]",
      },
    },
    {
      orientation: "horizontal",
      size: "md",
      class: {
        border: "border-t-[3px]",
      },
    },
    {
      orientation: "horizontal",
      size: "lg",
      class: {
        border: "border-t-[4px]",
      },
    },
    {
      orientation: "horizontal",
      size: "xl",
      class: {
        border: "border-t-[5px]",
      },
    },
    {
      orientation: "vertical",
      size: "xs",
      class: {
        border: "border-s",
      },
    },
    {
      orientation: "vertical",
      size: "sm",
      class: {
        border: "border-s-[2px]",
      },
    },
    {
      orientation: "vertical",
      size: "md",
      class: {
        border: "border-s-[3px]",
      },
    },
    {
      orientation: "vertical",
      size: "lg",
      class: {
        border: "border-s-[4px]",
      },
    },
    {
      orientation: "vertical",
      size: "xl",
      class: {
        border: "border-s-[5px]",
      },
    },
  ],
  defaultVariants: {
    color: "neutral",
    size: "xs",
    type: "solid",
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
