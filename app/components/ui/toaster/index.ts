import type { ToastProviderProps, ToastRootEmits, ToastRootProps  } from 'reka-ui'
import type {VariantProps} from 'tailwind-variants';
import type { AvatarProps } from '@/components/ui/avatar'
import type { ButtonProps } from '@/components/ui/button'
import type { StringOrVNode } from '@/types/utils'
import { tv } from 'tailwind-variants'





export { default as Toast } from './Toast.vue'
export { default as Toaster } from './Toaster.vue'


export const toast = tv({
  slots: {
    root: 'alert shadow-lg rounded-lg p-4 flex gap-2.5 focus:outline-none',
    wrapper: 'w-0 flex-1 flex flex-col',
    title: 'text-sm font-medium',
    description: 'text-sm opacity-75',
    icon: 'shrink-0 size-5',
    avatar: 'shrink-0',
    avatarSize: '2xl',
    actions: 'flex gap-1.5 shrink-0',
    progress: 'absolute inset-x-0 bottom-0 h-1 z-[-1]',
    close: 'p-0'
  },
  variants: {
    color: {
      primary: {
        root: 'alert-primary',
        icon: 'text-current',
        progress: 'bg-current'
      },
      secondary: {
        root: 'alert-secondary',
        icon: 'text-current',
        progress: 'bg-current'
      },
      success: {
        root: 'alert-success',
        icon: 'text-current',
        progress: 'bg-current'
      },
      error: {
        root: 'alert-error',
        icon: 'text-current',
        progress: 'bg-current'
      },
      warning: {
        root: 'alert-warning',
        icon: 'text-current',
        progress: 'bg-current'
      },
      info: {
        root: 'alert-info',
        icon: 'text-current',
        progress: 'bg-current'
      },
      neutral: {
        root: 'alert',
        icon: 'text-current',
        progress: 'bg-current'
      }
    },
    orientation: {
      horizontal: {
        root: 'items-center alert-horizontal',
        actions: 'items-center'
      },
      vertical: {
        root: 'items-start alert-vertical',
        actions: 'items-start mt-2.5'
      }
    },
    title: {
      true: {
        description: 'mt-1'
      }
    }
  },
  defaultVariants: {
    color: 'neutral'
  }
})

type ToastVariants = VariantProps<typeof toast>

export interface ToastProps extends Pick<ToastRootProps, 'defaultOpen' | 'open' | 'type' | 'duration'> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'li'
   */
  as?: any
  title?: StringOrVNode
  description?: StringOrVNode
  /**
   * @IconifyIcon
   */
  icon?: string
  avatar?: AvatarProps
  /**
   * @defaultValue 'primary'
   */
  color?: ToastVariants['color']
  /**
   * The orientation between the content and the actions.
   * @defaultValue 'vertical'
   */
  orientation?: ToastVariants['orientation']
  /**
   * Display a list of actions:
   * - under the title and description when orientation is `vertical`
   * - next to the close button when orientation is `horizontal`
   * `{ size: 'xs' }`{lang="ts-type"}
   */
  actions?: ButtonProps[]
  /**
   * Display a close button to dismiss the toast.
   * `{ size: 'md', color: 'neutral', variant: 'link' }`{lang="ts-type"}
   * @defaultValue true
   */
  close?: boolean | Partial<ButtonProps>
  /**
   * The icon displayed in the close button.
   * @defaultValue appConfig.ui.icons.close
   * @IconifyIcon
   */
  closeIcon?: string
  class?: any
  ui?: Partial<typeof toast.slots>
}

export interface ToastEmits extends ToastRootEmits {}

export interface ToastSlots {
  leading(props?: object): any
  title(props?: object): any
  description(props?: object): any
  actions(props?: object): any
  close(props: { ui: any }): any
}

export const toaster = tv({
  slots: {
    viewport: 'toast z-50',
    base: 'toast-item transition-all duration-200 ease-out'
  },
  variants: {
    position: {
      'top-left': {
        viewport: 'toast-top toast-start'
      },
      'top-center': {
        viewport: 'toast-top toast-center'
      },
      'top-right': {
        viewport: 'toast-top toast-end'
      },
      'bottom-left': {
        viewport: 'toast-start'
      },
      'bottom-center': {
        viewport: 'toast-center'
      },
      'bottom-right': {
        viewport: 'toast-end'
      }
    },
    swipeDirection: {
      up: 'data-[swipe=end]:animate-[slide-out-to-top_200ms_ease-out]',
      right: 'data-[swipe=end]:animate-[slide-out-to-right_200ms_ease-out]',
      down: 'data-[swipe=end]:animate-[slide-out-to-bottom_200ms_ease-out]',
      left: 'data-[swipe=end]:animate-[slide-out-to-left_200ms_ease-out]'
    }
  },
  compoundVariants: [{
    position: ['top-left', 'top-center', 'top-right'],
    class: {
      base: 'data-[state=open]:animate-[slide-in-from-top_200ms_ease-in-out]'
    }
  }, {
    position: ['bottom-left', 'bottom-center', 'bottom-right'],
    class: {
      base: 'data-[state=open]:animate-[slide-in-from-bottom_200ms_ease-in-out]'
    }
  }, {
    swipeDirection: ['left', 'right'],
    class: 'data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=end]:translate-x-[var(--reka-toast-swipe-end-x)] data-[swipe=cancel]:translate-x-0'
  }, {
    swipeDirection: ['up', 'down'],
    class: 'data-[swipe=move]:translate-y-[var(--reka-toast-swipe-move-y)] data-[swipe=end]:translate-y-[var(--reka-toast-swipe-end-y)] data-[swipe=cancel]:translate-y-0'
  }],
  defaultVariants: {
    position: 'bottom-right'
  }
})

type ToasterVariants = VariantProps<typeof toaster>

export interface ToasterProps extends Omit<ToastProviderProps, 'swipeDirection'> {
  /**
   * The position on the screen to display the toasts.
   * @defaultValue 'bottom-right'
   */
  position?: ToasterVariants['position']
  /**
   * Expand the toasts to show multiple toasts at once.
   * @defaultValue true
   */
  expand?: boolean
  /**
   * Render the toaster in a portal.
   * @defaultValue true
   */
  portal?: boolean
  class?: any
  ui?: Partial<typeof toaster.slots>
}

export interface ToasterSlots {
  default(props?: object): any
}
