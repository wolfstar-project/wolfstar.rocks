<template>
  <div
    :id="id"
    ref="el"
    v-bind="$attrs"
    :data-dragging="isDragging"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    :style="[size ? { '--width': `${size}${dashboardContext.unit}` } : undefined]"
  >
    <slot>
      <slot name="header"></slot>

      <div :class="ui.body({ class: props.ui?.body })">
        <slot name="body"></slot>
      </div>

      <slot name="footer"></slot>
    </slot>
  </div>

  <slot name="resize-handle" :on-mouse-down="onMouseDown" :on-touch-start="onTouchStart" :on-double-click="onDoubleClick">
    <DashboardResizeHandle
      v-if="resizable"
      :aria-controls="id"
      :class="ui.handle({ class: props.ui?.handle })"
      @mousedown="onMouseDown"
      @touchstart="onTouchStart"
      @dblclick="onDoubleClick"
    />
  </slot>
</template>

<script lang="ts">
import type { UseResizableProps } from "@/composables/useResizable";
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "relative flex flex-col min-w-0 min-h-svh lg:not-last:border-r lg:not-last:border-default shrink-0",
    body: "flex flex-col gap-4 sm:gap-6 flex-1 overflow-y-auto p-4 sm:p-6",
    handle: "",
  },
  variants: {
    size: {
      true: {
        root: "w-full lg:w-(--width)",
      },
      false: {
        root: "flex-1",
      },
    },
  },
});

export interface DashboardPanelProps extends Pick<UseResizableProps, "id" | "minSize" | "maxSize" | "defaultSize" | "resizable"> {
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface DashboardPanelSlots {
  "default"(props?: {}): any;
  "header"(props?: {}): any;
  "body"(props?: {}): any;
  "footer"(props?: {}): any;
  "resize-handle"(props: { onMouseDown: (e: MouseEvent) => void; onTouchStart: (e: TouchEvent) => void; onDoubleClick: (e: MouseEvent) => void }): any;
}
</script>

<script setup lang="ts">
import { computed, toRef, useId } from "vue";
import { DashboardResizeHandle } from "@/components/ui/dashboard";
import { useResizable } from "@/composables/useResizable";
import { useDashboard } from "@/utils/dashboard";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DashboardPanelProps>(), {
  minSize: 15,
  resizable: false,
});
defineSlots<DashboardPanelSlots>();

const dashboardContext = useDashboard({ storageKey: "dashboard", unit: "%" });

const id = `${dashboardContext.storageKey}-panel-${props.id || useId()}`;

const { el, size, isDragging, onMouseDown, onTouchStart, onDoubleClick } = useResizable(id, toRef(() => ({ ...dashboardContext, ...props })));

const ui = computed(() => tv({ extend: theme })({
  size: !!size.value,
}));
</script>
