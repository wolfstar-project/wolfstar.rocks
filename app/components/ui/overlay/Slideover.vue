<!-- eslint-disable vue/no-template-shadow -->
<template>
  <DialogRoot v-slot="{ open, close }" v-bind="rootProps">
    <DialogTrigger v-if="!!slots.default" as-child :class="props.class">
      <slot :open="open"></slot>
    </DialogTrigger>

    <DialogPortal v-bind="portalProps">
      <DialogOverlay v-if="overlay" :class="ui.overlay({ class: props.ui?.overlay })" />

      <DialogContent
        :data-side="side"
        :class="ui.content({ class: [!slots.default && props.class, props.ui?.content] })"
        v-bind="contentProps"
        @after-enter="emits('after:enter')"
        @after-leave="emits('after:leave')"
        v-on="contentEvents"
      >
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
                    :icon="closeIcon || 'ic:round-close'"
                    color="neutral"
                    variant="ghost"
                    aria-label="Close"
                    v-bind="(typeof props.close === 'object' ? props.close as Partial<ButtonProps> : {})"
                    :class="ui.close({ class: props.ui?.close })"
                  />
                </slot>
              </DialogClose>
            </slot>
          </div>

          <div :class="ui.body({ class: props.ui?.body })">
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
import type { ButtonProps } from "@/components/ui/element";
import type { EmitsToProps } from "@/types/utils";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    overlay: "fixed inset-0 bg-base-300/75",
    content: "fixed bg-base-100 divide-y divide-base-200 sm:ring ring-base-200 sm:shadow-lg flex flex-col focus:outline-none",
    header: "flex items-center gap-1.5 p-4 sm:px-6 min-h-16",
    wrapper: "",
    body: "flex-1 overflow-y-auto p-4 sm:p-6",
    footer: "flex items-center gap-1.5 p-4 sm:px-6",
    title: "text-base-content font-semibold",
    description: "mt-1 text-base-content/70 text-sm",
    close: "absolute top-4 end-4",
  },
  variants: {
    side: {
      top: {
        content: "inset-x-0 top-0 max-h-full",
      },
      right: {
        content: "right-0 inset-y-0 w-full max-w-md",
      },
      bottom: {
        content: "inset-x-0 bottom-0 max-h-full",
      },
      left: {
        content: "left-0 inset-y-0 w-full max-w-md",
      },
    },
    transition: {
      true: {
        overlay: "data-[state=open]:animate-[fade-in_200ms_ease-out] data-[state=closed]:animate-[fade-out_200ms_ease-in]",
      },
    },
  },
  compoundVariants: [{
    transition: true,
    side: "top",
    class: {
      content: "data-[state=open]:animate-[slide-in-from-top_200ms_ease-in-out] data-[state=closed]:animate-[slide-out-to-top_200ms_ease-in-out]",
    },
  }, {
    transition: true,
    side: "right",
    class: {
      content: "data-[state=open]:animate-[slide-in-from-right_200ms_ease-in-out] data-[state=closed]:animate-[slide-out-to-right_200ms_ease-in-out]",
    },
  }, {
    transition: true,
    side: "bottom",
    class: {
      content: "data-[state=open]:animate-[slide-in-from-bottom_200ms_ease-in-out] data-[state=closed]:animate-[slide-out-to-bottom_200ms_ease-in-out]",
    },
  }, {
    transition: true,
    side: "left",
    class: {
      content: "data-[state=open]:animate-[slide-in-from-left_200ms_ease-in-out] data-[state=closed]:animate-[slide-out-to-left_200ms_ease-in-out]",
    },
  }],
});

type Slideover = VariantProps<typeof theme>;

export interface SlideoverProps extends DialogRootProps {
  title?: string;
  description?: string;
  /** The content of the slideover. */
  content?: Omit<DialogContentProps, "as" | "asChild" | "forceMount"> & Partial<EmitsToProps<DialogContentEmits>>;
  /**
   * Render an overlay behind the slideover.
   * @defaultValue true
   */
  overlay?: boolean;
  /**
   * Animate the slideover when opening or closing.
   * @defaultValue true
   */
  transition?: boolean;
  /**
   * The side of the slideover.
   * @defaultValue 'right'
   */
  side?: Slideover["side"];
  /**
   * Render the slideover in a portal.
   * @defaultValue true
   */
  portal?: boolean | string | HTMLElement;
  /**
   * Display a close button to dismiss the slideover.
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
   * When `false`, the slideover will not close when clicking outside or pressing escape.
   * @defaultValue true
   */
  dismissible?: boolean;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface SlideoverEmits extends DialogRootEmits {
  "after:leave": [];
  "after:enter": [];
  "close:prevent": [];
}

export interface SlideoverSlots {
  default(props: { open: boolean }): any;
  content(props: { close: () => void }): any;
  header(props: { close: () => void }): any;
  title(props?: object): any;
  description(props?: object): any;
  actions(props?: object): any;
  close(props: { close: () => void; ui: { [K in keyof Required<typeof theme["slots"]>]: (props?: Record<string, any>) => string } }): any;
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

const props = withDefaults(defineProps<SlideoverProps>(), {
  close: true,
  portal: true,
  overlay: true,
  transition: true,
  modal: true,
  dismissible: true,
  side: "right",
});
const emits = defineEmits<SlideoverEmits>();
const slots = defineSlots<SlideoverSlots>();

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
  side: props.side,
}));
</script>
