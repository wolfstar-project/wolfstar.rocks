<!-- eslint-disable vue/no-template-shadow -->
<template>
  <DialogRoot v-slot="{ open, close }" v-bind="rootProps">
    <DialogTrigger v-if="!!slots.default" as-child :class="props.class">
      <slot :open="open"></slot>
    </DialogTrigger>

    <DialogPortal v-bind="portalProps">
      <DialogOverlay v-if="overlay" :class="ui.overlay({ class: props.ui?.overlay })" />

      <DialogContent :class="ui.content({ class: [!slots.default && props.class, props.ui?.content] })" v-bind="contentProps" @after-enter="emits('after:enter')" @after-leave="emits('after:leave')" v-on="contentEvents">
        <VisuallyHidden v-if="!!slots.content && ((title || !!slots.title) || (description || !!slots.description))">
          <DialogTitle v-if="title || !!slots.title">
            <slot name="title">
              {{ title }}
            </slot>
          </DialogTitle>

          <DialogDescription v-if="description || !!slots.description">
            <slot name="description">
              {{ description }}
            </slot>
          </DialogDescription>
        </VisuallyHidden>

        <slot name="content" :close="close">
          <div v-if="!!slots.header || (title || !!slots.title) || (description || !!slots.description) || (props.close || !!slots.close)" :class="ui.header({ class: props.ui?.header })">
            <slot name="header" :close="close">
              <div :class="ui.wrapper({ class: props.ui?.wrapper })">
                <DialogTitle v-if="title || !!slots.title" :class="ui.title({ class: props.ui?.title })">
                  <slot name="title">
                    {{ title }}
                  </slot>
                </DialogTitle>

                <DialogDescription v-if="description || !!slots.description" :class="ui.description({ class: props.ui?.description })">
                  <slot name="description">
                    {{ description }}
                  </slot>
                </DialogDescription>
              </div>

              <slot name="actions"></slot>

              <DialogClose v-if="props.close || !!slots.close" as-child>
                <slot name="close" :close="close" :ui="ui">
                  <Button
                    v-if="props.close"
                    :icon="closeIcon || 'lucide:x'"
                    color="neutral"
                    variant="ghost"
                    aria-label="Close Modal"
                    v-bind="(typeof props.close === 'object' ? props.close as Partial<ButtonProps> : {})"
                    :class="ui.close({ class: props.ui?.close })"
                  />
                </slot>
              </DialogClose>
            </slot>
          </div>

          <div v-if="!!slots.body" :class="ui.body({ class: props.ui?.body })">
            <slot name="body" :close="close"></slot>
          </div>

          <div v-if="!!slots.footer" :class="ui.footer({ class: props.ui?.footer })">
            <slot name="footer" :close="close"></slot>
          </div>
        </slot>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script lang="ts">
import type { DialogContentEmits, DialogContentProps, DialogRootEmits, DialogRootProps } from "reka-ui";
import type { EmitsToProps } from "vue";
import type { ButtonProps } from "@/components/ui/element";
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    overlay: "modal-backdrop",
    content: "modal-box flex flex-col",
    header: "modal-header flex min-h-16 items-center gap-1.5 p-4 sm:px-6",
    wrapper: "",
    body: "flex-1 overflow-y-auto p-4 sm:p-6",
    footer: "modal-actions flex items-center gap-1.5 p-4 sm:px-6",
    title: "modal-title font-bold",
    description: "mt-1 text-sm text-base-content/60",
    close: "btn absolute top-2 right-2 btn-circle btn-sm",
  },
  variants: {
    transition: {
      true: {
        overlay: "modal-open",
        content: "modal-open",
      },
    },
    fullscreen: {
      true: {
        content: "modal-full",
      },
      false: {
        content: "max-w-lg",
      },
    },
  },
});

export interface ModalProps extends DialogRootProps {
  title?: string;
  description?: string;
  /** The content of the modal. */
  content?: Omit<DialogContentProps, "as" | "asChild" | "forceMount"> & Partial<EmitsToProps<DialogContentEmits>>;
  /**
   * Render an overlay behind the modal.
   * @defaultValue true
   */
  overlay?: boolean;
  /**
   * Animate the modal when opening or closing.
   * @defaultValue true
   */
  transition?: boolean;
  /**
   * When `true`, the modal will take up the full screen.
   * @defaultValue false
   */
  fullscreen?: boolean;
  /**
   * Render the modal in a portal.
   * @defaultValue true
   */
  portal?: boolean | string | HTMLElement;
  /**
   * Display a close button to dismiss the modal.
   * `{ size: 'md', color: 'neutral', variant: 'ghost' }`{lang="ts-type"}
   * @defaultValue true
   */
  close?: boolean | Partial<ButtonProps>;
  /**
   * The icon displayed in the close button.
   * @defaultValue appConfig.ui.icons.close
   * @IconifyIcon
   */
  closeIcon?: string;
  /**
   * When `false`, the modal will not close when clicking outside or pressing escape.
   * @defaultValue true
   */
  dismissible?: boolean;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface ModalEmits extends DialogRootEmits {
  "after:leave": [];
  "after:enter": [];
  "close:prevent": [];
}

export interface ModalSlots {
  default(props: { open: boolean }): any;
  content(props: { close: () => void }): any;
  header(props: { close: () => void }): any;
  title(props?: object): any;
  description(props?: object): any;
  actions(props?: object): any;
  close(props: { close: () => void; ui: { [K in keyof Required<typeof theme.slots>]: (props?: Record<string, any>) => string } }): any;
  body(props: { close: () => void }): any;
  footer(props: { close: () => void }): any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, DialogTrigger, useForwardPropsEmits, VisuallyHidden } from "reka-ui";
import { computed, toRef } from "vue";
import { Button } from "@/components/ui/element";
import { usePortal } from "@/composables/usePortal";

const props = withDefaults(defineProps<ModalProps>(), {
  close: true,
  portal: true,
  overlay: true,
  transition: true,
  modal: true,
  dismissible: true,
});
const emits = defineEmits<ModalEmits>();
const slots = defineSlots<ModalSlots>();

const rootProps = useForwardPropsEmits(reactivePick(props, "open", "defaultOpen", "modal"), emits);
const portalProps = usePortal(toRef(() => props.portal));
const contentProps = toRef(() => props.content);
const contentEvents = computed(() => {
  const defaultEvents = {
    closeAutoFocus: (e: Event) => e.preventDefault(),
  };

  if (!props.dismissible) {
    const events = ["pointerDownOutside", "interactOutside", "escapeKeyDown"];

    return events.reduce((acc, curr) => {
      acc[curr] = (e: Event) => {
        e.preventDefault();
        emits("close:prevent");
      };
      return acc;
    }, defaultEvents as Record<typeof events[number] | keyof typeof defaultEvents, (e: Event) => void>);
  }

  return defaultEvents;
});

const ui = computed(() => tv({ extend: theme })({
  transition: props.transition,
  fullscreen: props.fullscreen,
}));
</script>
