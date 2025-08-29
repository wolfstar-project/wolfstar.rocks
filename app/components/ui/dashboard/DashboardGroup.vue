<template>
  <Primitive :as="as" :class="ui({ class: props.class })">
    <slot></slot>
  </Primitive>
</template>

<script lang="ts">
import type { UseResizableProps } from "@/composables/useResizable";
import { tv } from "tailwind-variants";

const theme = tv({
  base: "fixed inset-0 flex overflow-hidden",
});

export interface DashboardGroupProps extends Pick<UseResizableProps, "storage" | "storageKey" | "persistent" | "unit"> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  class?: any;
}

export interface DashboardGroupSlots {
  default(props?: object): any;
}
</script>

<script setup lang="ts">
import { useNuxtApp } from "#imports";
import { Primitive } from "reka-ui";
import { computed, ref } from "vue";
import { provideDashboardContext } from "@/utils/dashboard";

const props = withDefaults(defineProps<DashboardGroupProps>(), {
  storage: "cookie",
  storageKey: "dashboard",
  persistent: true,
  unit: "%",
});
defineSlots<DashboardGroupSlots>();

const nuxtApp = useNuxtApp();

const ui = computed(() => tv({ extend: theme }));

const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);

provideDashboardContext({
  storage: props.storage,
  storageKey: props.storageKey,
  persistent: props.persistent,
  unit: props.unit,
  sidebarOpen,
  toggleSidebar: () => {
    nuxtApp.hooks.callHook("dashboard:sidebar:toggle");
  },
  sidebarCollapsed,
  collapseSidebar: (collapsed: boolean) => {
    nuxtApp.hooks.callHook("dashboard:sidebar:collapse", collapsed);
  },
  toggleSearch: () => {
    nuxtApp.hooks.callHook("dashboard:search:toggle");
  },
});
</script>
