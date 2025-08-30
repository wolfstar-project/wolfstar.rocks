<template>
  <ToastProvider :swipe-direction="swipeDirection" v-bind="providerProps">
    <slot></slot>

    <Toast
      v-for="(toast, index) of toasts"
      :key="toast.id"
      ref="refs"
      v-bind="omit(toast, ['id', 'close'])"
      :close="(toast.close as boolean)"
      :data-expanded="expanded"
      :data-front="!expanded && index === toasts.length - 1"
      :style="{
        '--index': (index - toasts.length) + toasts.length,
        '--before': toasts.length - 1 - index,
        '--offset': getOffset(index),
        '--scale': expanded ? '1' : 'calc(1 - var(--before) * var(--scale-factor))',
        '--translate': expanded ? 'calc(var(--offset) * var(--translate-factor))' : 'calc(var(--before) * var(--gap))',
        '--transform': 'translateY(var(--translate)) scale(var(--scale))'
      }"
      :class="[ui.base(), {
        'cursor-pointer': !!toast.onClick
      }]"
      @update:open="onUpdateOpen($event, toast.id)"
      @click="toast.onClick && toast.onClick(toast)"
    />

    <ToastPortal :disabled="!portal">
      <ToastViewport
        :data-expanded="expanded"
        :class="ui.viewport({ class: [props.class, props.ui?.viewport] })"
        :style="{
          '--scale-factor': '0.05',
          '--translate-factor': position?.startsWith('top') ? '1px' : '-1px',
          '--gap': position?.startsWith('top') ? '16px' : '-16px',
          '--front-height': `${frontHeight}px`,
          '--height': `${height}px`
        }"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
      />
    </ToastPortal>
  </ToastProvider>
</template>

<script lang="ts">
import type { ToastProviderProps } from "reka-ui";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    viewport: "toast z-50",
    base: "toast-item transition-all duration-200 ease-out",
  },
  variants: {
    position: {
      "top-left": {
        viewport: "toast-top toast-start",
      },
      "top-center": {
        viewport: "toast-top toast-center",
      },
      "top-right": {
        viewport: "toast-top toast-end",
      },
      "bottom-left": {
        viewport: "toast-start",
      },
      "bottom-center": {
        viewport: "toast-center",
      },
      "bottom-right": {
        viewport: "toast-end",
      },
    },
    swipeDirection: {
      up: "data-[swipe=end]:animate-[slide-out-to-top_200ms_ease-out]",
      right: "data-[swipe=end]:animate-[slide-out-to-right_200ms_ease-out]",
      down: "data-[swipe=end]:animate-[slide-out-to-bottom_200ms_ease-out]",
      left: "data-[swipe=end]:animate-[slide-out-to-left_200ms_ease-out]",
    },
  },
  compoundVariants: [{
    position: ["top-left", "top-center", "top-right"],
    class: {
      base: "data-[state=open]:animate-[slide-in-from-top_200ms_ease-in-out]",
    },
  }, {
    position: ["bottom-left", "bottom-center", "bottom-right"],
    class: {
      base: "data-[state=open]:animate-[slide-in-from-bottom_200ms_ease-in-out]",
    },
  }, {
    swipeDirection: ["left", "right"],
    class: "data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=end]:translate-x-[var(--reka-toast-swipe-end-x)] data-[swipe=cancel]:translate-x-0",
  }, {
    swipeDirection: ["up", "down"],
    class: "data-[swipe=move]:translate-y-[var(--reka-toast-swipe-move-y)] data-[swipe=end]:translate-y-[var(--reka-toast-swipe-end-y)] data-[swipe=cancel]:translate-y-0",
  }],
  defaultVariants: {
    position: "bottom-right",
  },
});

type ToasterVariants = VariantProps<typeof theme>;

export interface ToasterProps extends Omit<ToastProviderProps, "swipeDirection"> {
  /**
   * The position on the screen to display the toasts.
   * @defaultValue 'bottom-right'
   */
  position?: ToasterVariants["position"];
  /**
   * Expand the toasts to show multiple toasts at once.
   * @defaultValue true
   */
  expand?: boolean;
  /**
   * Render the toaster in a portal.
   * @defaultValue true
   */
  portal?: boolean;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface ToasterSlots {
  default(props?: object): any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { ToastPortal, ToastProvider, ToastViewport, useForwardProps } from "reka-ui";
import { computed, ref } from "vue";
import { useToast } from "@/composables/useToast";
import { omit } from "@/utils/index";
import Toast from "../element/Toast.vue";

const props = withDefaults(defineProps<ToasterProps>(), {
  expand: true,
  portal: true,
  duration: 5000,
});
defineSlots<ToasterSlots>();

const providerProps = useForwardProps(reactivePick(props, "duration", "label", "swipeThreshold"));

const { toasts, remove } = useToast();

const swipeDirection = computed(() => {
  switch (props.position) {
    case "top-center":
      return "up";
    case "top-right":
    case "bottom-right":
      return "right";
    case "bottom-center":
      return "down";
    case "top-left":
    case "bottom-left":
      return "left";
  }
  return "right";
});

const ui = computed(() => tv({ extend: theme })({
  position: props.position,
  swipeDirection: swipeDirection.value,
}));

function onUpdateOpen(value: boolean, id: string | number) {
  if (value) {
    return;
  }

  remove(id);
}

const hovered = ref(false);
const expanded = computed(() => props.expand || hovered.value);

const refs = ref<{ height: number }[]>([]);

const height = computed(() => refs.value.reduce((acc, { height }) => acc + height + 16, 0));
const frontHeight = computed(() => refs.value[refs.value.length - 1]?.height || 0);

function getOffset(index: number) {
  return refs.value.slice(index + 1).reduce((acc, { height }) => acc + height + 16, 0);
}
</script>
