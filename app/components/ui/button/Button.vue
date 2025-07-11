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
        })
      "
      :style="getCustomColorStyles(active)"
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
        <span v-if="label" :class="ui.label({ class: props.ui?.label, active })">
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
import type { Ref } from 'vue'
import type { ButtonProps, ButtonSlots } from '.'
import type { AvatarProps } from '@/components/ui/avatar'
import { useForwardProps } from 'reka-ui'
import { tv } from 'tailwind-variants'
import { computed, inject, ref } from 'vue'
import { Avatar } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Link, LinkBase, pickLinkProps } from '@/components/ui/link'
import { formLoadingInjectionKey } from '@/composables/useFormField'
import { omit } from '@/utils/index'

const props = withDefaults(defineProps<ButtonProps>(), {
  active: undefined,
  activeClass: '',
  inactiveClass: '',
})
const slots = defineSlots<ButtonSlots>()

const linkProps = useForwardProps(pickLinkProps(props))

const { orientation, size: buttonSize } = useButtonGroup<ButtonProps>(props)

const loadingAutoState = ref(false)
const formLoading = inject<Ref<boolean> | undefined>(formLoadingInjectionKey, undefined)

async function onClickWrapper(event: MouseEvent) {
  loadingAutoState.value = true
  const callbacks = Array.isArray(props.onClick) ? props.onClick : [props.onClick]
  try {
    await Promise.all(callbacks.map(fn => fn?.(event)))
  }
  finally {
    loadingAutoState.value = false
  }
}

const isLoading = computed(() => {
  return props.loading || (props.loadingAuto && (loadingAutoState.value || (formLoading?.value && props.type === 'submit')))
})

const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(computed(() => ({ ...props, loading: isLoading.value })))

/**
 * Determines if the color is custom (not one of the predefined DaisyUI colors)
 */
function isCustomColor(color: string | number | undefined): boolean {
  if (!color) return false
  const colorStr = String(color)
  const daisyUIColors = ['primary', 'secondary', 'success', 'error', 'info', 'warning', 'neutral', 'accent']
  return !daisyUIColors.includes(colorStr)
}

/**
 * Determines if the color is a valid CSS value (hex, rgb, hsl, css custom property)
 */
function isCSSColor(color: string | number): boolean {
  const colorStr = String(color)
  return /^(?:#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|var\(--)/i.test(colorStr)
}

/**
 * Generates Tailwind classes for custom colors
 */
function getTailwindColorClass(color: string | number, variant?: string): string {
  const colorStr = String(color)
  if (variant === 'outline') {
    return `border-${colorStr} text-${colorStr} hover:bg-${colorStr} hover:text-white`
  }
  if (variant === 'soft' || variant === 'ghost') {
    return `text-${colorStr} hover:bg-${colorStr}/10`
  }
  if (variant === 'link') {
    return `text-${colorStr} hover:text-${colorStr}/80`
  }
  
  // Solid variant (default)
  return `bg-${colorStr} border-${colorStr} text-white hover:bg-${colorStr}/90`
}

/**
 * Generates CSS styles for custom colors (hex, rgb, hsl, etc.)
 * Supports both normal and active states
 */
function getCustomColorStyles(active: boolean): Record<string, string> {
  // Determine which color to use based on active state
  const currentColor = active && props.activeColor ? props.activeColor : props.color
  
  if (!currentColor || !isCustomColor(currentColor) || !isCSSColor(currentColor)) {
    return {}
  }

  // Determine which variant to use based on active state
  const variant = active && props.activeVariant ? props.activeVariant : props.variant
  const styles: Record<string, string> = {}
  const colorStr = String(currentColor)

  if (variant === 'outline') {
    styles.borderColor = colorStr
    styles.color = colorStr
    styles['--tw-bg-opacity'] = '0'
  } else if (variant === 'soft' || variant === 'ghost') {
    styles.color = colorStr
    styles.backgroundColor = 'transparent'
  } else if (variant === 'link') {
    styles.color = colorStr
    styles.backgroundColor = 'transparent'
    styles.borderColor = 'transparent'
  } else {
    // Solid variant (default)
    styles.backgroundColor = colorStr
    styles.borderColor = colorStr
    styles.color = 'white'
  }

  return styles
}

/**
 * Handles color for Tailwind Variants
 */
function getColorForVariants(color: string | number | undefined): string | undefined {
  if (!color) return undefined
  
  // If it's a predefined DaisyUI color, return it as is
  if (!isCustomColor(color)) {
    return String(color)
  }
  
  // If it's a CSS color (hex, rgb, etc.), don't use Tailwind classes
  if (isCSSColor(color)) {
    return undefined
  }
  
  // If it's a custom Tailwind color, generate classes
  return String(color)
}

/**
 * Generates additional Tailwind classes for active state when using custom colors
 */
function getActiveCustomClasses(): string {
  if (!props.activeColor || !isCustomColor(props.activeColor) || isCSSColor(props.activeColor)) {
    return ''
  }
  
  const variant = props.activeVariant || props.variant
  return getTailwindColorClass(props.activeColor, variant)
}

/**
 * Generates additional Tailwind classes for inactive state when using custom colors
 */
function getInactiveCustomClasses(): string {
  // For inactive state, we use the base color if it's a custom Tailwind color
  if (!props.color || !isCustomColor(props.color) || isCSSColor(props.color)) {
    return ''
  }
  
  return getTailwindColorClass(props.color, props.variant)
}

const ui = computed(() =>
  tv({
    extend: buttonVariants,
    variants: {
      active: {
        true: {
          base: [props.activeClass, getActiveCustomClasses()].filter(Boolean).join(' '),
        },
        false: {
          base: [props.inactiveClass, getInactiveCustomClasses()].filter(Boolean).join(' '),
        },
      },
    },
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
    buttonGroup: orientation.value,
  }),
)
</script>
