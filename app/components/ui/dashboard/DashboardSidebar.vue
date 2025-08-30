<template>
  <DefineToggleTemplate>
    <slot name="toggle" :open="open" :toggle="toggleOpen">
      <DashboardSidebarToggle
        v-if="toggle"
        v-bind="(typeof toggle === 'object' ? toggle as Partial<ButtonProps> : {})"
        :side="toggleSide"
        :class="ui.toggle({ class: props.ui?.toggle, toggleSide })"
      />
    </slot>
  </DefineToggleTemplate>

  <DefineResizeHandleTemplate>
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
  </DefineResizeHandleTemplate>

  <ReuseResizeHandleTemplate v-if="side === 'right'" />

  <div
    :id="id"
    ref="el"
    v-bind="$attrs"
    :data-collapsed="isCollapsed"
    :data-dragging="isDragging"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    :style="{ '--width': `${size || 0}${dashboardContext.unit}` }"
  >
    <div v-if="!!slots.header" :class="ui.header({ class: props.ui?.header })">
      <slot name="header" :collapsed="isCollapsed" :collapse="collapse"></slot>
    </div>

    <div :class="ui.body({ class: props.ui?.body })">
      <slot :collapsed="isCollapsed" :collapse="collapse"></slot>
    </div>

    <div v-if="!!slots.footer" :class="ui.footer({ class: props.ui?.footer })">
      <slot name="footer" :collapsed="isCollapsed" :collapse="collapse"></slot>
    </div>
  </div>

  <ReuseResizeHandleTemplate v-if="side === 'left'" />

  <Menu
    v-model:open="open"
    title="Dashboard"
    description="Dashboard sidebar"
    v-bind="menuProps"
    :ui="{
      overlay: ui.overlay({ class: props.ui?.overlay }),
      content: ui.content({ class: props.ui?.content })
    }"
  >
    <template #content>
      <slot name="content">
        <div v-if="!!slots.header || mode !== 'drawer'" :class="ui.header({ class: props.ui?.header, menu: true })">
          <ReuseToggleTemplate v-if="mode !== 'drawer' && toggleSide === 'left'" />

          <slot name="header" :collapsed="isCollapsed" :collapse="collapse"></slot>

          <ReuseToggleTemplate v-if="mode !== 'drawer' && toggleSide === 'right'" />
        </div>

        <div :class="ui.body({ class: props.ui?.body, menu: true })">
          <slot :collapsed="isCollapsed" :collapse="collapse"></slot>
        </div>

        <div v-if="!!slots.footer" :class="ui.footer({ class: props.ui?.footer, menu: true })">
          <slot name="footer" :collapsed="isCollapsed" :collapse="collapse"></slot>
        </div>
      </slot>
    </template>
  </Menu>
</template>

<script lang="ts">
import type { ButtonProps } from "@/components/ui/element";
import type { DrawerProps, ModalProps, SlideoverProps } from "@/components/ui/overlay";
import type { UseResizableProps } from "@/composables/useResizable";
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "relative hidden lg:flex flex-col min-h-svh min-w-16 w-(--width) shrink-0",
    header: "h-16 shrink-0 flex items-center gap-1.5 px-4",
    body: "flex flex-col gap-4 flex-1 overflow-y-auto px-4 py-2",
    footer: "shrink-0 flex items-center gap-1.5 px-4 py-2",
    toggle: "",
    handle: "",
    content: "lg:hidden",
    overlay: "lg:hidden",
  },
  variants: {
    menu: {
      true: {
        header: "sm:px-6",
        body: "sm:px-6",
        footer: "sm:px-6",
      },
    },
    side: {
      left: {
        root: "border-r border-default",
      },
      right: {
        root: "",
      },
    },
    toggleSide: {
      left: {
        toggle: "",
      },
      right: {
        toggle: "ms-auto",
      },
    },
  },
});

type DashboardSidebarMode = "modal" | "slideover" | "drawer";
type DashboardSidebarMenu<T> = T extends "modal" ? ModalProps : T extends "slideover" ? SlideoverProps : T extends "drawer" ? DrawerProps : never;

export interface DashboardSidebarProps<T extends DashboardSidebarMode = DashboardSidebarMode> extends Pick<UseResizableProps, "id" | "side" | "minSize" | "maxSize" | "defaultSize" | "resizable" | "collapsible" | "collapsedSize"> {
  /**
   * The mode of the sidebar menu.
   * @defaultValue 'modal'
   */
  mode?: T;
  /**
   * The props for the sidebar menu component.
   */
  menu?: DashboardSidebarMenu<T>;
  /**
   * Customize the toggle button to open the sidebar.
   * `{ color: 'neutral', variant: 'ghost' }`{lang="ts-type"}
   * @defaultValue true
   */
  toggle?: boolean | Partial<ButtonProps>;
  /**
   * The side to render the toggle button on.
   * @defaultValue 'left'
   */
  toggleSide?: "left" | "right";
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface DashboardSidebarSlots {
  "header"(props: { collapsed?: boolean; collapse?: (value: boolean) => void }): any;
  "default"(props: { collapsed?: boolean; collapse?: (value: boolean) => void }): any;
  "footer"(props: { collapsed?: boolean; collapse?: (value: boolean) => void }): any;
  "toggle"(props: { open: boolean; toggle: () => void }): any;
  "content"(props?: object): any;
  "resize-handle"(props: { onMouseDown: (e: MouseEvent) => void; onTouchStart: (e: TouchEvent) => void; onDoubleClick: (e: MouseEvent) => void }): any;
}
</script>

<script setup lang="ts" generic="T extends DashboardSidebarMode">
import { useRoute, useRuntimeHook } from "#imports";
import { createReusableTemplate } from "@vueuse/core";
import { defu } from "defu";
import { computed, ref, toRef, useId, watch } from "vue";
import { DashboardResizeHandle, DashboardSidebarToggle } from "@/components/ui/dashboard";
import { Drawer, Modal, Slideover } from "@/components/ui/overlay";
import { useResizable } from "@/composables/useResizable";
import { useDashboard } from "@/utils/dashboard";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DashboardSidebarProps<T>>(), {
  side: "left",
  mode: "slideover" as never,
  toggle: true,
  toggleSide: "left",
  minSize: 10,
  maxSize: 20,
  defaultSize: 15,
  resizable: false,
  collapsible: false,
  collapsedSize: 0,
});
const slots = defineSlots<DashboardSidebarSlots>();

const open = defineModel<boolean>("open", { default: false });
const collapsed = defineModel<boolean>("collapsed", { default: false });

const route = useRoute();

const dashboardContext = useDashboard({
  storageKey: "dashboard",
  unit: "%",
  sidebarOpen: ref(false),
  sidebarCollapsed: ref(false),
});

const id = `${dashboardContext.storageKey}-sidebar-${props.id || useId()}`;

const { el, size, collapse, isCollapsed, isDragging, onMouseDown, onTouchStart, onDoubleClick } = useResizable(id, toRef(() => ({ ...dashboardContext, ...props })), { collapsed });

const [DefineToggleTemplate, ReuseToggleTemplate] = createReusableTemplate();
const [DefineResizeHandleTemplate, ReuseResizeHandleTemplate] = createReusableTemplate();

useRuntimeHook("dashboard:sidebar:toggle", () => {
  open.value = !open.value;
});

useRuntimeHook("dashboard:sidebar:collapse", (value: boolean) => {
  isCollapsed.value = value;
});

watch(open, () => dashboardContext.sidebarOpen!.value = open.value, { immediate: true });
watch(isCollapsed, () => dashboardContext.sidebarCollapsed!.value = isCollapsed.value, { immediate: true });

watch(() => route.fullPath, () => {
  open.value = false;
});

const ui = computed(() => tv({ extend: theme })({
  side: props.side,
}));

const Menu = computed(() => ({
  slideover: Slideover,
  modal: Modal,
  drawer: Drawer,
})[props.mode as DashboardSidebarMode]);

const menuProps = toRef(() => defu(props.menu, {
  content: {
    onOpenAutoFocus: (e: Event) => e.preventDefault(),
  },
}, props.mode === "modal"
  ? { fullscreen: true, transition: false }
  : props.mode === "slideover"
    ? { side: "left" }
    : {}) as DashboardSidebarMenu<T>);
function toggleOpen() {
  open.value = !open.value;
}
</script>
