<template>
  <component :is="nested ? DrawerRootNested : DrawerRoot" v-bind="rootProps">
    <DrawerTrigger v-if="!!slots.default" as-child :class="props.class">
      <slot></slot>
    </DrawerTrigger>

    <DrawerPortal v-bind="portalProps">
      <DrawerOverlay v-if="overlay" :class="ui.overlay({ class: props.ui?.overlay })" />

      <DrawerContent :class="ui.content({ class: [!slots.default && props.class, props.ui?.content] })" v-bind="contentProps" v-on="contentEvents">
        <DrawerHandle v-if="handle" :class="ui.handle({ class: props.ui?.handle })" />

        <VisuallyHidden v-if="!!slots.content && ((title || !!slots.title) || (description || !!slots.description))">
          <DrawerTitle v-if="title || !!slots.title">
            <slot name="title">
              {{ title }}
            </slot>
          </DrawerTitle>

          <DrawerDescription v-if="description || !!slots.description">
            <slot name="description">
              {{ description }}
            </slot>
          </DrawerDescription>
        </VisuallyHidden>

        <slot name="content">
          <div :class="ui.container({ class: props.ui?.container })">
            <div v-if="!!slots.header || (title || !!slots.title) || (description || !!slots.description)" :class="ui.header({ class: props.ui?.header })">
              <slot name="header">
                <DrawerTitle v-if="title || !!slots.title" :class="ui.title({ class: props.ui?.title })">
                  <slot name="title">
                    {{ title }}
                  </slot>
                </DrawerTitle>

                <DrawerDescription v-if="description || !!slots.description" :class="ui.description({ class: props.ui?.description })">
                  <slot name="description">
                    {{ description }}
                  </slot>
                </DrawerDescription>
              </slot>
            </div>

            <div v-if="!!slots.body" :class="ui.body({ class: props.ui?.body })">
              <slot name="body"></slot>
            </div>

            <div v-if="!!slots.footer" :class="ui.footer({ class: props.ui?.footer })">
              <slot name="footer"></slot>
            </div>
          </div>
        </slot>
      </DrawerContent>
    </DrawerPortal>
  </component>
</template>

<script lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import type { DrawerRootEmits, DrawerRootProps } from "vaul-vue";
import type { EmitsToProps } from "@/types/utils";
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    overlay: "fixed inset-0 bg-elevated/75",
    content: "fixed bg-default ring ring-default flex focus:outline-none",
    handle: [
      "shrink-0 !bg-accented",
      "transition-opacity",
    ],
    container: "w-full flex flex-col gap-4 p-4 overflow-y-auto",
    header: "",
    title: "text-highlighted font-semibold",
    description: "mt-1 text-muted text-sm",
    body: "flex-1",
    footer: "flex flex-col gap-1.5",
  },
  variants: {
    direction: {
      top: {
        content: "mb-24 flex-col-reverse",
        handle: "mb-4",
      },
      right: {
        content: "flex-row",
        handle: "!ml-4",
      },
      bottom: {
        content: "mt-24 flex-col",
        handle: "mt-4",
      },
      left: {
        content: "flex-row-reverse",
        handle: "!mr-4",
      },
    },
    inset: {
      true: {
        content: "rounded-lg after:hidden overflow-hidden [--initial-transform:calc(100%+1.5rem)]",
      },
    },
  },
  compoundVariants: [
    {
      direction: [
        "top",
        "bottom",
      ],
      class: {
        content: "h-auto max-h-[96%]",
        handle: "!w-12 !h-1.5 mx-auto",
      },
    },
    {
      direction: [
        "right",
        "left",
      ],
      class: {
        content: "w-auto max-w-[calc(100%-2rem)]",
        handle: "!h-12 !w-1.5 mt-auto mb-auto",
      },
    },
    {
      direction: "top",
      inset: true,
      class: {
        content: "inset-x-4 top-4",
      },
    },
    {
      direction: "top",
      inset: false,
      class: {
        content: "inset-x-0 top-0 rounded-b-lg",
      },
    },
    {
      direction: "bottom",
      inset: true,
      class: {
        content: "inset-x-4 bottom-4",
      },
    },
    {
      direction: "bottom",
      inset: false,
      class: {
        content: "inset-x-0 bottom-0 rounded-t-lg",
      },
    },
    {
      direction: "left",
      inset: true,
      class: {
        content: "inset-y-4 left-4",
      },
    },
    {
      direction: "left",
      inset: false,
      class: {
        content: "inset-y-0 left-0 rounded-r-lg",
      },
    },
    {
      direction: "right",
      inset: true,
      class: {
        content: "inset-y-4 right-4",
      },
    },
    {
      direction: "right",
      inset: false,
      class: {
        content: "inset-y-0 right-0 rounded-l-lg",
      },
    },
  ],
});

export interface DrawerProps extends Pick<DrawerRootProps, "activeSnapPoint" | "closeThreshold" | "shouldScaleBackground" | "setBackgroundColorOnScale" | "scrollLockTimeout" | "fixed" | "dismissible" | "modal" | "open" | "defaultOpen" | "nested" | "direction" | "noBodyStyles" | "handleOnly" | "preventScrollRestoration" | "snapPoints"> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  title?: string;
  description?: string;
  /**
   * Whether to inset the drawer from the edges.
   * @defaultValue false
   */
  inset?: boolean;
  /** The content of the drawer. */
  content?: Omit<DialogContentProps, "as" | "asChild" | "forceMount"> & Partial<EmitsToProps<DialogContentEmits>>;
  /**
   * Render an overlay behind the drawer.
   * @defaultValue true
   */
  overlay?: boolean;
  /**
   * Render a handle on the drawer.
   * @defaultValue true
   */
  handle?: boolean;
  /**
   * Render the drawer in a portal.
   * @defaultValue true
   */
  portal?: boolean | string | HTMLElement;
  /**
   * Whether the drawer is nested in another drawer.
   * @defaultValue false
   */
  nested?: boolean;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface DrawerEmits extends DrawerRootEmits {}

export interface DrawerSlots {
  default(props?: object): any;
  content(props?: object): any;
  header(props?: object): any;
  title(props?: object): any;
  description(props?: object): any;
  body(props?: object): any;
  footer(props?: object): any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { useForwardPropsEmits, VisuallyHidden } from "reka-ui";
import { DrawerContent, DrawerDescription, DrawerHandle, DrawerOverlay, DrawerPortal, DrawerRoot, DrawerRootNested, DrawerTitle, DrawerTrigger } from "vaul-vue";
import { computed, toRef } from "vue";
import { usePortal } from "@/composables/usePortal";

const props = withDefaults(defineProps<DrawerProps>(), {
  direction: "bottom",
  portal: true,
  overlay: true,
  handle: true,
  modal: true,
  dismissible: true,
});
const emits = defineEmits<DrawerEmits>();
const slots = defineSlots<DrawerSlots>();

const rootProps = useForwardPropsEmits(reactivePick(props, "activeSnapPoint", "closeThreshold", "shouldScaleBackground", "setBackgroundColorOnScale", "scrollLockTimeout", "fixed", "dismissible", "modal", "open", "defaultOpen", "nested", "direction", "noBodyStyles", "handleOnly", "preventScrollRestoration", "snapPoints"), emits);
const portalProps = usePortal(toRef(() => props.portal));
const contentProps = toRef(() => props.content);
const contentEvents = {
  closeAutoFocus: (e: Event) => e.preventDefault(),
};

const ui = computed(() => tv({ extend: theme })({
  direction: props.direction,
  inset: props.inset,
}));
</script>
