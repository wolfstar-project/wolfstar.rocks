import type { DialogContentEmits, DialogContentProps, DialogRootEmits, DialogRootProps } from 'reka-ui'
import type { EmitsToProps } from 'vue'
import type { ButtonProps } from '../button'
import { tv } from 'tailwind-variants'

export { default as Modal } from './Modal.vue'

export const modal = tv({
  slots: {
    overlay: 'modal-backdrop',
    content: 'modal-box flex flex-col',
    header: 'modal-header flex min-h-16 items-center gap-1.5 p-4 sm:px-6',
    wrapper: '',
    body: 'flex-1 overflow-y-auto p-4 sm:p-6',
    footer: 'modal-actions flex items-center gap-1.5 p-4 sm:px-6',
    title: 'modal-title font-bold',
    description: 'mt-1 text-sm text-base-content/60',
    close: 'btn absolute top-2 right-2 btn-circle btn-sm',
  },
  variants: {
    transition: {
      true: {
        overlay: 'modal-open',
        content: 'modal-open',
      },
    },
    fullscreen: {
      true: {
        content: 'modal-full',
      },
      false: {
        content: 'max-w-lg',
      },
    },
  },
})

export interface ModalProps extends DialogRootProps {
  title?: string
  description?: string
  /** The content of the modal. */
  content?: Omit<DialogContentProps, 'as' | 'asChild' | 'forceMount'> & Partial<EmitsToProps<DialogContentEmits>>
  /**
   * Render an overlay behind the modal.
   * @defaultValue true
   */
  overlay?: boolean
  /**
   * Animate the modal when opening or closing.
   * @defaultValue true
   */
  transition?: boolean
  /**
   * When `true`, the modal will take up the full screen.
   * @defaultValue false
   */
  fullscreen?: boolean
  /**
   * Render the modal in a portal.
   * @defaultValue true
   */
  portal?: boolean
  /**
   * Display a close button to dismiss the modal.
   * `{ size: 'md', color: 'neutral', variant: 'ghost' }`{lang="ts-type"}
   * @defaultValue true
   */
  close?: boolean | Partial<ButtonProps>
  /**
   * The icon displayed in the close button.
   * @defaultValue appConfig.ui.icons.close
   * @IconifyIcon
   */
  closeIcon?: string
  /**
   * When `false`, the modal will not close when clicking outside or pressing escape.
   * @defaultValue true
   */
  dismissible?: boolean
  class?: any
  ui?: Partial<typeof modal.slots>
}

export interface ModalEmits extends DialogRootEmits {
  'after:leave': []
}

export interface ModalSlots {
  default: (props: { open: boolean }) => any
  content: (props?: object) => any
  header: (props?: object) => any
  title: (props?: object) => any
  description: (props?: object) => any
  close: (props: { ui: ReturnType<typeof modal> }) => any
  body: (props?: object) => any
  footer: (props?: object) => any
}
