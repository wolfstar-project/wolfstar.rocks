<template>
  <Primitive :as="as" :class="ui.base({ class: [props.ui?.base, props.class] })">
    <slot name="leading">
      <Icon v-if="isLeading && leadingIconName" :name="leadingIconName" :class="ui.leadingIcon({ class: props.ui?.leadingIcon })" />
      <Avatar v-else-if="!!avatar" :size="((props.ui?.leadingAvatarSize || ui.leadingAvatarSize()) as AvatarProps['size'])" v-bind="avatar" :class="ui.leadingAvatar({ class: props.ui?.leadingAvatar })" />
    </slot>

    <slot>
      <span v-if="label !== undefined && label !== null" :class="ui.label({ class: props.ui?.label })">
        {{ label }}
      </span>
    </slot>

    <slot name="trailing">
      <Icon v-if="isTrailing && trailingIconName" :name="trailingIconName" :class="ui.trailingIcon({ class: props.ui?.trailingIcon })" />
    </slot>
  </Primitive>
</template>

<script lang="ts">
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";
import { buttonGroupVariant } from "../button-group";

const badge = tv({
  slots: {
    base: [
      "badge", // daisyUI badge base class
      "font-medium inline-flex items-center",
    ],
    label: "truncate",
    leadingIcon: "shrink-0",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    trailingIcon: "shrink-0",
  },
  variants: {
    ...buttonGroupVariant,
    color: {
      ...Object.fromEntries(colors.map(color => [color, `badge-${color}`])) as {
        [key in UIColors]: `badge-${key}`;
      },
    },
    variant: {
      solid: "",
      outline: "badge-outline",
      ghost: "badge-ghost",
    },
    size: {
      xs: {
        base: "badge-xs gap-1",
        leadingIcon: "size-3",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-3",
      },
      sm: {
        base: "badge-sm gap-1",
        leadingIcon: "size-3",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-3",
      },
      md: {
        base: "badge-md gap-1",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      lg: {
        base: "badge-lg gap-1.5",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      xl: {
        base: "badge-xl gap-1.5",
        leadingIcon: "size-6",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-6",
      },
    },
    square: {
      true: "",
    },
  },
  compoundVariants: [
    // Square variants with size adjustments
    {
      size: "xs",
      square: true,
      class: "badge-xs p-0.5",
    },
    {
      size: "sm",
      square: true,
      class: "badge-sm p-1",
    },
    {
      size: "md",
      square: true,
      class: "badge-md p-1",
    },
    {
      size: "lg",
      square: true,
      class: "badge-lg p-1",
    },
    {
      size: "xl",
      square: true,
      class: "badge-xl p-1",
    },
  ],
  defaultVariants: {
    color: "primary",
    size: "md",
  },
});

type Badge = VariantProps<typeof badge>;

export interface BadgeProps extends Omit<UseComponentIconsProps, "loading" | "loadingIcon"> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'span'
   */
  as?: any;
  label?: string | number;
  /**
   * @defaultValue 'primary'
   */
  color?: Badge["color"];
  /**
   * @defaultValue 'solid'
   */
  variant?: Badge["variant"];
  /**
   * @defaultValue 'md'
   */
  size?: Badge["size"];
  /** Render the badge with equal padding on all sides. */
  square?: boolean;
  class?: any;
  ui?: Partial<typeof badge.slots>;
}

export interface BadgeSlots {
  leading(props?: object): any;
  default(props?: object): any;
  trailing(props?: object): any;
}
</script>

<script setup lang="ts">
import type { AvatarProps } from "@/components/ui/avatar";
import type { UseComponentIconsProps } from "@/composables/useComponentIcons";
import { Primitive } from "reka-ui";
import { computed } from "vue";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useButtonGroup } from "@/composables/useButtonGroup";
import { useComponentIcons } from "@/composables/useComponentIcons";

const props = withDefaults(defineProps<BadgeProps>(), {
  as: "span",
});
const slots = defineSlots<BadgeSlots>();

const { orientation, size: buttonGroupSize } = useButtonGroup<BadgeProps>(props);
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);

const ui = computed(() => badge({
  color: props.color,
  variant: props.variant,
  size: buttonGroupSize.value || props.size,
  square: props.square || (!slots.default && !props.label),
  buttonGroup: orientation.value,
}));
</script>
