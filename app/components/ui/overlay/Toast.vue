<template>
  <ToastRoot
    ref="el"
    v-slot="{ remaining, duration, open }"
    v-bind="rootProps"
    :data-orientation="orientation"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    :style="{ '--height': height }"
  >
    <slot name="leading">
      <Avatar v-if="avatar" :size="((props.ui?.avatarSize || ui.avatarSize()) as AvatarProps['size'])" v-bind="avatar" :class="ui.avatar({ class: props.ui?.avatar })" />
      <Icon v-else-if="icon" :name="icon" :class="ui.icon({ class: props.ui?.icon })" />
    </slot>

    <div :class="ui.wrapper({ class: props.ui?.wrapper })">
      <ToastTitle v-if="title || !!slots.title" :class="ui.title({ class: props.ui?.title })">
        <slot name="title">
          <component :is="title()" v-if="typeof title === 'function'" />
          <component :is="title" v-else-if="typeof title === 'object'" />
          <template v-else>
            {{ title }}
          </template>
        </slot>
      </ToastTitle>
      <ToastDescription v-if="description || !!slots.description" :class="ui.description({ class: props.ui?.description })">
        <slot name="description">
          <component :is="description()" v-if="typeof description === 'function'" />
          <component :is="description" v-else-if="typeof description === 'object'" />
          <template v-else>
            {{ description }}
          </template>
        </slot>
      </ToastDescription>

      <div v-if="orientation === 'vertical' && (actions?.length || !!slots.actions)" :class="ui.actions({ class: props.ui?.actions })">
        <slot name="actions">
          <ToastAction v-for="(action, index) in actions" :key="index" :alt-text="action.label || 'Action'" as-child @click.stop>
            <Button size="xs" :color="color" v-bind="action" />
          </ToastAction>
        </slot>
      </div>
    </div>

    <div v-if="(orientation === 'horizontal' && (actions?.length || !!slots.actions)) || close" :class="ui.actions({ class: props.ui?.actions, orientation: 'horizontal' })">
      <template v-if="orientation === 'horizontal' && (actions?.length || !!slots.actions)">
        <slot name="actions">
          <ToastAction v-for="(action, index) in actions" :key="index" :alt-text="action.label || 'Action'" as-child @click.stop>
            <Button size="xs" :color="color" v-bind="action" />
          </ToastAction>
        </slot>
      </template>

      <ToastClose v-if="close || !!slots.close" as-child>
        <slot name="close" :ui="ui">
          <Button
            v-if="close"
            :icon="closeIcon || 'lucide:x'"
            color="neutral"
            variant="link"
            v-bind="(typeof close === 'object' ? close as Partial<ButtonProps> : {})"
            :class="ui.close({ class: props.ui?.close })"
            @click.stop
          />
        </slot>
      </ToastClose>
    </div>

    <Progress
      v-if="progress && open && remaining > 0 && duration"
      :model-value="remaining / duration * 100"
      :color="color"
      v-bind="(typeof progress === 'object' ? progress as Partial<ProgressProps> : {})"
      size="sm"
      :class="ui.progress({ class: props.ui?.progress })"
    />
  </ToastRoot>
</template>

<script lang="ts">
import type { ToastRootEmits, ToastRootProps } from "reka-ui";
import type { AvatarProps, ButtonProps, ProgressProps } from "@/components/ui/element";
import type { StringOrVNode } from "@/types/utils";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "alert shadow-lg rounded-lg p-4 flex gap-2.5 focus:outline-none",
    wrapper: "w-0 flex-1 flex flex-col",
    title: "text-sm font-medium",
    description: "text-sm opacity-75",
    icon: "shrink-0 size-5",
    avatar: "shrink-0",
    avatarSize: "2xl",
    actions: "flex gap-1.5 shrink-0",
    progress: "absolute inset-x-0 bottom-0 h-1 z-[-1]",
    close: "p-0",
  },
  variants: {
    color: {
      primary: {
        root: "alert-primary",
        icon: "text-current",
        progress: "bg-current",
      },
      secondary: {
        root: "alert-secondary",
        icon: "text-current",
        progress: "bg-current",
      },
      success: {
        root: "alert-success",
        icon: "text-current",
        progress: "bg-current",
      },
      error: {
        root: "alert-error",
        icon: "text-current",
        progress: "bg-current",
      },
      warning: {
        root: "alert-warning",
        icon: "text-current",
        progress: "bg-current",
      },
      info: {
        root: "alert-info",
        icon: "text-current",
        progress: "bg-current",
      },
      neutral: {
        root: "alert",
        icon: "text-current",
        progress: "bg-current",
      },
    },
    orientation: {
      horizontal: {
        root: "items-center alert-horizontal",
        actions: "items-center",
      },
      vertical: {
        root: "items-start alert-vertical",
        actions: "items-start mt-2.5",
      },
    },
    title: {
      true: {
        description: "mt-1",
      },
    },
  },
  defaultVariants: {
    color: "neutral",
  },
});

type ToastVariants = VariantProps<typeof theme>;

export interface ToastProps extends Pick<ToastRootProps, "defaultOpen" | "open" | "type" | "duration"> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'li'
   */
  as?: any;
  title?: StringOrVNode;
  description?: StringOrVNode;
  /**
   * @IconifyIcon
   */
  icon?: string;
  avatar?: AvatarProps;
  /**
   * @defaultValue 'primary'
   */
  color?: ToastVariants["color"];
  /**
   * The orientation between the content and the actions.
   * @defaultValue 'vertical'
   */
  orientation?: ToastVariants["orientation"];
  /**
   * Display a close button to dismiss the toast.
   * `{ size: 'md', color: 'neutral', variant: 'link' }`{lang="ts-type"}
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
   * Display a list of actions:
   * - under the title and description when orientation is `vertical`
   * - next to the close button when orientation is `horizontal`
   * `{ size: 'xs' }`{lang="ts-type"}
   */
  actions?: ButtonProps[];
  /**
   * Display a progress bar showing the toast's remaining duration.
   * `{ size: 'sm' }`{lang="ts-type"}
   * @defaultValue true
   */
  progress?: boolean | Pick<ProgressProps, "color" | "ui">;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface ToastEmits extends ToastRootEmits {}

export interface ToastSlots {
  leading(props?: {}): any;
  title(props?: {}): any;
  description(props?: {}): any;
  actions(props?: {}): any;
  close(props: { ui: { [K in keyof Required<typeof theme.slots>]: (props?: Record<string, any>) => string } }): any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { ToastAction, ToastClose, ToastDescription, ToastRoot, ToastTitle, useForwardPropsEmits } from "reka-ui";
import { computed, nextTick, onMounted, ref } from "vue";
import { Avatar, Button, Icon, Progress } from "@/components/ui/element";

const props = withDefaults(defineProps<ToastProps>(), {
  orientation: "vertical",
  close: true,
  progress: true,
});
const emits = defineEmits<ToastEmits>();
const slots = defineSlots<ToastSlots>();

const rootProps = useForwardPropsEmits(reactivePick(props, "as", "defaultOpen", "open", "duration", "type"), emits);

const ui = computed(() => tv({ extend: theme })({
  color: props.color,
  orientation: props.orientation,
  title: !!props.title || !!slots.title,
}));

const el = ref();
const height = ref(0);

onMounted(() => {
  if (!el.value) {
    return;
  }

  nextTick(() => {
    height.value = el.value?.$el?.getBoundingClientRect()?.height;
  });
});

defineExpose({
  height,
});
</script>
