<template>
  <Link
    v-slot="{ active, ...slotProps }"
    :type="type"
    :disabled="disabled || isLoading"
    :class="ui.base({ class: [props.class, props.ui?.base] })"
    v-bind="omit(linkProps, ['type', 'disabled'])"
    custom
  >
    <LinkBase
      v-bind="slotProps"
      :class="
        ui.base({
          class: [props.class, props.ui?.base],
          active,
          ...(active && activeVariant ? { variant: activeVariant } : {}),
          ...(active && activeColor ? { color: getColorForVariants(activeColor) } : {}),
        })"
      @click="onClickWrapper"
    >
      <slot name="leading">
        <Icon v-if="isLeading && leadingIconName" :name="leadingIconName" :class="ui.leadingIcon({ class: props.ui?.leadingIcon, active })" />
        <Avatar
          v-else-if="!!avatar"
          :size="(props.ui?.leadingAvatarSize || ui.leadingAvatarSize()) as AvatarProps['size']"
          v-bind="avatar"
          :class="ui.leadingAvatar({ class: props.ui?.leadingAvatar, active })"
        />
      </slot>

      <slot>
        <span v-if="label !== undefined && label !== null" :class="ui.label({ class: props.ui?.label, active })">
          {{ label }}
        </span>
      </slot>

      <slot name="trailing">
        <Icon
          v-if="isTrailing && trailingIconName"
          :name="trailingIconName"
          :class="ui.trailingIcon({ class: props.ui?.trailingIcon, active })"
        />
      </slot>
    </LinkBase>
  </Link>
</template>

<script lang="ts">
import type { VariantProps } from "tailwind-variants";
import type { HTMLAttributes, Ref } from "vue";
import type { LinkProps } from "@/components/ui/link";
import type { UseComponentIconsProps } from "@/composables/useComponentIcons";
import { tv } from "tailwind-variants";

const theme = tv({
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
    fieldGroup: {
      horizontal: "not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none",
      vertical: "not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none",
    },
    color: {
      ...Object.fromEntries(colors.map(color => [color, `btn-${color}`])),
    },
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
      true: "",
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
});

type ButtonVariants = VariantProps<typeof theme>;

export interface ButtonProps extends UseComponentIconsProps, Omit<LinkProps, "raw" | "custom"> {
  label?: string;
  /**
   * The color of the button.
   *
   * @default 'undefined'
   */

  color?: ButtonVariants["color"] | string;

  /**
   * The active color of the button.
   *
   * @default 'undefined'
   */

  activeColor?: ButtonVariants["color"] | string;

  variant?: ButtonVariants["variant"];

  activeVariant?: ButtonVariants["variant"];

  size?: ButtonVariants["size"];

  square?: boolean;

  block?: boolean;

  circle?: boolean;
  /**
   * Is responsive of display.
   *
   * @default 'true'
   */

  responsive?: boolean;
  /** Set loading state automatically based on the `@click` promise state */
  loadingAuto?: boolean;

  onClick?: ((event: MouseEvent) => void | Promise<void>) | Array<((event: MouseEvent) => void | Promise<void>)>;
  class?: HTMLAttributes["class"];
  ui?: Partial<typeof theme.slots>;
}

export interface ButtonSlots {
  leading: (props?: object) => unknown;
  default: (props?: object) => unknown;
  trailing: (props?: object) => unknown;
}
</script>

<script setup lang="ts">
/**
 * Button Component with custom color support
 *
 * Supports different color types:
 * 1. Predefined DaisyUI colors: 'primary', 'secondary', 'success', 'error', 'info', 'warning', 'neutral', 'accent'
 * 2. Custom Tailwind colors: 'blue-500', 'red-600', 'emerald-400', etc.
 * 3. CSS colors: '#ff0000', 'rgb(255, 0, 0)', 'hsl(0, 100%, 50%)', 'var(--custom-color)'
 *
 * Usage examples:
 * <Button color="primary">DaisyUI Color</Button>
 * <Button color="blue-500">Tailwind Color</Button>
 * <Button color="blue-500" activeColor="#ff0000">Custom Active Color</Button>
 * <Button color="primary" activeColor="var(--hover-color)">Active CSS Color</Button>
 */
import type { AvatarProps } from "~/components/ui/element";
import { defu } from "defu";
import { useForwardProps } from "reka-ui";
import { computed, inject, ref } from "vue";
import { Link, LinkBase, pickLinkProps } from "@/components/ui/link";
import { useComponentIcons } from "@/composables/useComponentIcons";
import { formLoadingInjectionKey } from "@/composables/useFormField";
import { omit } from "@/utils/index";
import { Avatar, Icon } from "~/components/ui/element";
import { useFieldGroup } from "~/composables/useFieldGroup";

const props = withDefaults(defineProps<ButtonProps>(), {
  active: undefined,
  activeClass: "",
  inactiveClass: "",
});
const slots = defineSlots<ButtonSlots>();

const { orientation, size: buttonSize } = useFieldGroup<ButtonProps>(props);

const linkProps = useForwardProps(pickLinkProps(props));

const loadingAutoState = ref(false);
const formLoading = inject<Ref<boolean> | undefined>(formLoadingInjectionKey, undefined);

async function onClickWrapper(event: MouseEvent) {
  loadingAutoState.value = true;
  const callbacks = Array.isArray(props.onClick) ? props.onClick : [props.onClick];
  try {
    await Promise.all(callbacks.map(fn => fn?.(event)));
  }
  finally {
    loadingAutoState.value = false;
  }
}

const isLoading = computed(() => {
  return props.loading || (props.loadingAuto && (loadingAutoState.value || (formLoading?.value && props.type === "submit")));
});

const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(
  computed(() => ({ ...props, loading: isLoading.value })),
);
/**
 * Determines if the color is custom (not one of the predefined DaisyUI colors)
 */
function isCustomColor(color: string | number | undefined): boolean {
  if (!color)
    return false;
  const colorStr = String(color);
  const daisyUIColors = colors;
  return !daisyUIColors.includes(colorStr as UIColors);
}

/**
 * Determines if the color is a valid CSS value (hex, rgb, hsl, css custom property)
 */
function isCSSColor(color: string | number): boolean {
  const colorStr = String(color);
  return /^(?:#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|var\(--)/i.test(colorStr);
}

/**
 * Handles color for Tailwind Variants
 */
function getColorForVariants(color: string | number | undefined): string | undefined {
  if (!color)
    return undefined;

  // If it's a predefined DaisyUI color, return it as is
  if (!isCustomColor(color)) {
    return String(color);
  }

  // If it's a CSS color (hex, rgb, etc.), don't use Tailwind classes
  if (isCSSColor(color)) {
    return undefined;
  }

  // If it's a custom Tailwind color, generate classes
  return String(color);
}

const ui = computed(() =>
  tv({
    extend: theme,
    ...defu({
      variants: {
        active: {
          true: {
            base: props.activeClass,
          },
          false: {
            base: props.inactiveClass,
          },
        },
      },
    }),
  })({
    color: getColorForVariants(props.color),
    variant: props.variant,
    size: buttonSize.value,
    loading: isLoading.value,
    block: props.block,
    circle: props.circle,
    square: props.square || (!slots.default && !props.label),
    leading: isLeading.value,
    trailing: isTrailing.value,
    fieldGroup: orientation.value,
    responsive: props.responsive,
  }),
);
</script>
