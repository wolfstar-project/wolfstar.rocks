import type { VariantProps } from 'tailwind-variants'
import type { HTMLAttributes } from 'vue'
import { tv } from 'tailwind-variants'

export { default as Avatar } from './Avatar.vue'
export { default as AvatarBase } from './AvatarBase.vue'
export { default as AvatarFallback } from './AvatarFallback.vue'
export { default as AvatarImage } from './AvatarImage.vue'

export const avatarVariant = tv({
  base: 'avatar',
  slots: {
    root: 'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-base-200 align-middle select-none',
    image: 'h-full w-full rounded-[inherit] object-cover',
    fallback: 'avatar-placeholder truncate leading-none font-medium text-base-content',
    icon: 'shrink-0 text-base-content',
  },
  variants: {
    size: {
      xs: 'h-8 w-8',
      sm: 'h-10 w-10',
      md: 'h-16 w-16',
      lg: 'h-24 w-24',
      xl: 'h-32 w-32',
    },
    status: {
      online: 'avatar-online',
      offline: 'avatar-offline',
    },
    shape: {
      circle: 'mask mask-circle',
      square: 'mask mask-squircle',
    },
  },
  defaultVariants: {
    size: 'md',
    shape: 'circle',
  },
})

export type AvatarVariants = VariantProps<typeof avatarVariant>

export interface AvatarProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'span'
   */

  as?: any

  src?: string
  alt?: string

  fallback?: string

  shape?: AvatarVariants['shape']

  class?: HTMLAttributes['class']

  /**
   * @IconifyIcon
   */
  icon?: string
  text?: string
  /**
   * @defaultValue 'md'
   */
  size?: AvatarVariants['size']

  style?: any

  ui?: Partial<typeof avatarVariant.slots>
}
