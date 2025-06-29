import type { CheckboxRootProps } from 'reka-ui'
import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export { default as Checkbox } from './Checkbox.vue'
const colors = ['primary', 'secondary', 'success', 'error', 'info', 'warning', 'neutral'] as const

export const checkbox = tv({
  slots: {
    root: 'relative flex items-start',
    base: [
      'checkbox', // daisyUI base checkbox class
      'rounded focus-visible:outline-2 focus-visible:outline-offset-2',
    ],
    container: 'flex items-center',
    wrapper: 'ms-2',
    icon: 'size-full shrink-0',
    label: 'block font-medium text-base-content',
    description: 'text-base-content/60',
  },
  variants: {
    color: {
      primary: 'checkbox-primary',
      secondary: 'checkbox-secondary',
      success: 'checkbox-success',
      warning: 'checkbox-warning',
      error: 'checkbox-error',
      info: 'checkbox-info',
      neutral: '',
    },
    size: {
      xs: {
        base: 'checkbox-xs',
        container: 'h-4',
        wrapper: 'text-xs',
      },
      sm: {
        base: 'checkbox-sm',
        container: 'h-4',
        wrapper: 'text-xs',
      },
      md: {
        base: 'checkbox-md',
        container: 'h-5',
        wrapper: 'text-sm',
      },
      lg: {
        base: 'checkbox-lg',
        container: 'h-5',
        wrapper: 'text-sm',
      },
      xl: {
        base: 'checkbox-xl',
        container: 'h-6',
        wrapper: 'text-base',
      },
    },
    required: {
      true: {
        label: 'after:ms-0.5 after:text-error after:content-[\'*\']',
      },
    },
    disabled: {
      true: {
        base: 'cursor-not-allowed opacity-50',
        label: 'cursor-not-allowed opacity-50',
        description: 'cursor-not-allowed opacity-50',
      },
    },
    checked: {
      true: '',
    },
  },
  compoundVariants: [
    ...(colors.map((color: string) => ({
      color,
      checked: true,
      class: `ring-2 ring-${color} bg-${color}`,
    })) as any),
    {
      color: 'neutral',
      checked: true,
      class: 'bg-base-content ring-2 ring-base-content',
    },
  ],
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
})

type CheckboxVariants = VariantProps<typeof checkbox>

export interface CheckboxProps extends Pick<CheckboxRootProps, 'disabled' | 'required' | 'name' | 'value' | 'id' | 'defaultValue'> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  label?: string
  description?: string
  /**
   * @defaultValue 'primary'
   */
  color?: CheckboxVariants['color']
  /**
   * @defaultValue 'md'
   */
  size?: CheckboxVariants['size']
  /**
   * The icon displayed when checked.
   * @defaultValue appConfig.ui.icons.check
   * @IconifyIcon
   */
  icon?: string
  /**
   * The icon displayed when the checkbox is indeterminate.
   * @defaultValue appConfig.ui.icons.minus
   * @IconifyIcon
   */
  indeterminateIcon?: string
  class?: any
  ui?: Partial<typeof checkbox.slots>
}

export interface CheckboxEmits {
  change: [payload: Event]
}

export interface CheckboxSlots {
  label: (props: { label?: string }) => any
  description: (props: { description?: string }) => any
}
