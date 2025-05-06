import type { VariantProps } from 'tailwind-variants'
import type { HTMLAttributes } from 'vue'
import { tv } from 'tailwind-variants'

export { default as Card } from './Card.vue'

export const card = tv({
  slots: {
    root: 'card',
    header: 'card-body',
    body: 'p-4 sm:p-6',
    footer: 'card-actions',
  },
  variants: {
    variant: {
      solid: {
        root: 'bg-base-100 shadow-xl',
      },
      outline: {
        root: 'card-bordered',
      },
      soft: {
        root: 'bg-base-200',
      },
      subtle: {
        root: 'card-bordered bg-base-200',
      },
    },
    size: {
      xs: { root: 'card-xs' },
      sm: { root: 'card-sm' },
      md: { root: 'card-md' },
      lg: { root: 'card-lg' },
      xl: { root: 'card-xl' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})

export type CardVariants = VariantProps<typeof card>

export interface CardProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: string
  /**
   * @defaultValue 'outline'
   */
  variant?: CardVariants['variant']
  /**
   * @defaultValue 'md'
   */
  size?: CardVariants['size']
  class?: HTMLAttributes['class']
  ui?: Partial<typeof card.slots>
}

export interface CardSlots {
  header: (props?: object) => any
  default: (props?: object) => any
  footer: (props?: object) => any
}
