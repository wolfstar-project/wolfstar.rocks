<template>
  <DefineToggleTemplate>
    <slot name="toggle" :open="open" :toggle="toggleOpen">
      <Button
        v-if="toggle"
        color="neutral"
        variant="ghost"
        :aria-label="open ? 'Close Menu' : 'Open Menu'"
        :icon="open ? 'ic:round-close' : 'heroicons:open'"
        v-bind="(typeof toggle === 'object' ? toggle as Partial<ButtonProps> : {})"
        :class="ui.toggle({ class: props.ui?.toggle, toggleSide })"
        @click="toggleOpen"
      />
    </slot>
  </DefineToggleTemplate>

  <DefineLeftTemplate>
    <div :class="ui.left({ class: props.ui?.left })">
      <ReuseToggleTemplate v-if="toggleSide === 'left'" />

      <slot name="left">
        <Link :to="to" :aria-label="ariaLabel" :class="ui.title({ class: props.ui?.title })">
          <slot name="title">
            {{ title }}
          </slot>
        </Link>
      </slot>
    </div>
  </DefineLeftTemplate>

  <DefineRightTemplate>
    <div :class="ui.right({ class: props.ui?.right })">
      <slot name="right"></slot>

      <ReuseToggleTemplate v-if="toggleSide === 'right'" />
    </div>
  </DefineRightTemplate>

  <Primitive :as="as" v-bind="$attrs" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <slot name="top"></slot>

    <Container :class="ui.container({ class: props.ui?.container })">
      <ReuseLeftTemplate />

      <div :class="ui.center({ class: props.ui?.center })">
        <slot></slot>
      </div>

      <ReuseRightTemplate />
    </Container>

    <slot name="bottom"></slot>
  </Primitive>

  <Menu
    v-model:open="open"
    title="Header"
    description="Header sidebar"
    v-bind="menuProps"
    :ui="{
      overlay: ui.overlay({ class: props.ui?.overlay }),
      content: ui.content({ class: props.ui?.content })
    }"
  >
    <template #content>
      <slot name="content">
        <div v-if="mode !== 'drawer'" :class="ui.header({ class: props.ui?.header })">
          <ReuseLeftTemplate />

          <ReuseRightTemplate />
        </div>

        <div :class="ui.body({ class: props.ui?.body })">
          <slot name="body"></slot>
        </div>
      </slot>
    </template>
  </Menu>
</template>

<script lang="ts">
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "bg-base-100/75 backdrop-blur border-b border-base-200 h-16 sticky top-0 z-50",
    container: "flex items-center justify-between gap-3 h-full",
    left: "lg:flex-1 flex items-center gap-1.5",
    center: "hidden lg:flex",
    right: "flex items-center justify-end lg:flex-1 gap-1.5",
    title: "shrink-0 font-bold text-xl text-primary flex items-end gap-1.5",
    toggle: "lg:hidden",
    content: "lg:hidden",
    overlay: "lg:hidden",
    header: "px-4 sm:px-6 h-16 shrink-0 flex items-center justify-between gap-3",
    body: "p-4 sm:p-6 overflow-y-auto",
  },
  variants: {
    toggleSide: {
      left: {
        toggle: "-ms-1.5",
      },
      right: {
        toggle: "-me-1.5",
      },
    },
  },
});

type HeaderMode = "modal" | "slideover" | "drawer";
type HeaderMenu<T> = T extends "modal" ? ModalProps : T extends "slideover" ? SlideoverProps : T extends "drawer" ? DrawerProps : never;

export interface HeaderProps<T extends HeaderMode = HeaderMode> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'header'
   */
  as?: any;
  title?: string;
  to?: string;
  /**
   * The mode of the header menu.
   * @defaultValue 'modal'
   */
  mode?: T;
  /**
   * The props for the header menu component.
   */
  menu?: HeaderMenu<T>;
  /**
   * Customize the toggle button to open the header menu displayed when the `content` slot is used.
   * `{ color: 'neutral', variant: 'ghost' }`{lang="ts-type"}
   */
  toggle?: boolean | Partial<ButtonProps>;
  /**
   * The side to render the toggle button on.
   * @defaultValue 'right'
   */
  toggleSide?: "left" | "right";
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface HeaderSlots {
  title(props?: object): any;
  left(props?: object): any;
  default(props?: object): any;
  right(props?: object): any;
  toggle(props: { open: boolean; toggle: () => void }): any;
  top(props?: object): any;
  bottom(props?: object): any;
  body(props?: object): any;
  content(props?: object): any;
}
</script>

<script setup lang="ts" generic="T extends HeaderMode">
import { useRoute } from "#imports";
import { createReusableTemplate } from "@vueuse/core";
import { defu } from "defu";
import { Primitive } from "reka-ui";
import { computed, toRef, watch } from "vue";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Drawer, type DrawerProps } from "@/components/ui/drawer";
import { Link } from "@/components/ui/link";
import { Modal, type ModalProps } from "@/components/ui/modal";
import { Slideover, type SlideoverProps } from "@/components/ui/slideover";
import { getSlotChildrenText } from "@/utils/index";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<HeaderProps<T>>(), {
  as: "header",
  mode: "modal" as never,
  toggle: true,
  toggleSide: "right",
  to: "/",
});
const slots = defineSlots<HeaderSlots>();

const open = defineModel<boolean>("open", { default: false });

const route = useRoute();

const [DefineLeftTemplate, ReuseLeftTemplate] = createReusableTemplate();
const [DefineRightTemplate, ReuseRightTemplate] = createReusableTemplate();
const [DefineToggleTemplate, ReuseToggleTemplate] = createReusableTemplate();

const ariaLabel = computed(() => {
  const slotText = slots.title && getSlotChildrenText(slots.title());
  return (slotText || props.title || "Nuxt UI").trim();
});

watch(() => route.fullPath, () => {
  open.value = false;
});

const ui = computed(() => tv({ extend: theme })());

const Menu = computed(() => ({
  slideover: Slideover,
  modal: Modal,
  drawer: Drawer,
})[props.mode as HeaderMode]);

const menuProps = toRef(() => defu(props.menu, {
  content: {
    onOpenAutoFocus: (e: Event) => e.preventDefault(),
  },
}, props.mode === "modal" ? { fullscreen: true, transition: false } : {}) as HeaderMenu<T>);

function toggleOpen() {
  open.value = !open.value;
}
</script>
