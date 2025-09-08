<template>
  <DefineToggleTemplate>
    <slot name="toggle" v-bind="dashboardContext">
      <DashboardSidebarToggle
        v-if="toggle"
        v-bind="(typeof toggle === 'object' ? toggle as Partial<ButtonProps> : {})"
        :side="toggleSide"
        :class="ui.toggle({ class: props.ui?.toggle, toggleSide })"
      />
    </slot>
  </DefineToggleTemplate>

  <Primitive :as="as" v-bind="$attrs" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div :class="ui.left({ class: props.ui?.left })">
      <ReuseToggleTemplate v-if="toggleSide === 'left'" />

      <slot name="left" v-bind="dashboardContext">
        <slot name="leading" v-bind="dashboardContext">
          <Icon v-if="icon" :name="icon" :class="ui.icon({ class: props.ui?.icon })" />
        </slot>

        <h1 :class="ui.title({ class: props.ui?.title })">
          <slot name="title">
            {{ title }}
          </slot>
        </h1>

        <slot name="trailing" v-bind="dashboardContext"></slot>
      </slot>
    </div>

    <div v-if="!!slots.default" :class="ui.center({ class: props.ui?.center })">
      <slot v-bind="dashboardContext"></slot>
    </div>

    <div :class="ui.right({ class: props.ui?.right })">
      <slot name="right" v-bind="dashboardContext"></slot>

      <ReuseToggleTemplate v-if="toggleSide === 'right'" />
    </div>
  </Primitive>
</template>

<script lang="ts">
import type { ButtonProps } from "@/components/ui/element";
import type { DashboardContext } from "@/utils/dashboard";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "h-(--ui-header-height) shrink-0 flex items-center justify-between border-b border-default px-4 sm:px-6 gap-1.5",
    left: "flex items-center gap-1.5 min-w-0",
    icon: "shrink-0 size-5 self-center me-1.5",
    title: "flex items-center gap-1.5 font-semibold text-highlighted truncate",
    center: "hidden lg:flex",
    right: "flex items-center shrink-0 gap-1.5",
    toggle: "",
  },
  variants: {
    toggleSide: {
      left: {
        toggle: "",
      },
      right: {
        toggle: "",
      },
    },
  },
});

type _DashboardNavbar = VariantProps<typeof theme>;

export interface DashboardNavbarProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  /**
   * The icon displayed next to the title.
   * @IconifyIcon
   */
  icon?: string;
  title?: string;
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

type DashboardNavbarSlotsProps = Omit<DashboardContext, "storage" | "storageKey" | "persistent" | "unit">;

export interface DashboardNavbarSlots {
  title(props?: object): any;
  leading(props: DashboardNavbarSlotsProps): any;
  trailing(props: DashboardNavbarSlotsProps): any;
  left(props: DashboardNavbarSlotsProps): any;
  default(props: DashboardNavbarSlotsProps): any;
  right(props: DashboardNavbarSlotsProps): any;
  toggle(props: DashboardNavbarSlotsProps): any;
}
</script>

<script setup lang="ts">
import { createReusableTemplate } from "@vueuse/core";
import { Primitive } from "reka-ui";
import { computed } from "vue";
import { DashboardSidebarToggle } from "@/components/ui/dashboard";
import { Icon } from "@/components/ui/element";
import { useDashboard } from "@/utils/dashboard";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DashboardNavbarProps>(), {
  toggle: true,
  toggleSide: "left",
});
const slots = defineSlots<DashboardNavbarSlots>();
const dashboardContext = useDashboard({});

const [DefineToggleTemplate, ReuseToggleTemplate] = createReusableTemplate();

const ui = computed(() => tv({ extend: theme })());
</script>
