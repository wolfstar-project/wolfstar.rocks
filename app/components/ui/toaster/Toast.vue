<template>
  <ToastRoot
    ref="el"
    v-slot="{ remaining, duration }"
    v-bind="rootProps"
    :data-orientation="orientation"
    :class="ui.root({ class: [props.class, props.ui?.root] })"
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

      <div v-if="orientation === 'vertical' && actions?.length" :class="ui.actions({ class: props.ui?.actions })">
        <slot name="actions">
          <ToastAction v-for="(action, index) in actions" :key="index" :alt-text="action.label || 'Action'" as-child @click.stop>
            <Button size="xs" :color="color" v-bind="action" />
          </ToastAction>
        </slot>
      </div>
    </div>

    <div v-if="(orientation === 'horizontal' && actions?.length) || close" :class="ui.actions({ class: props.ui?.actions, orientation: 'horizontal' })">
      <template v-if="orientation === 'horizontal' && actions?.length">
        <slot name="actions">
          <ToastAction v-for="(action, index) in actions" :key="index" :alt-text="action.label || 'Action'" as-child @click.stop>
            <Button size="xs" :color="color" v-bind="action" />
          </ToastAction>
        </slot>
      </template>

      <ToastClose as-child>
        <slot name="close" :ui="ui">
          <Button
            v-if="close"
            :icon="closeIcon || 'heroicons:x-mark'"
            size="md"
            color="neutral"
            variant="link"
            aria-label="Close"
            v-bind="(typeof close === 'object' ? close as Partial<ButtonProps> : {})"
            :class="ui.close({ class: props.ui?.close })"
            @click.stop
          />
        </slot>
      </ToastClose>
    </div>

    <div v-if="remaining > 0 && duration" :class="ui.progress({ class: props.ui?.progress })" :style="{ width: `${remaining / duration * 100}%` }"></div>
  </ToastRoot>
</template>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { ToastAction, ToastClose, ToastDescription, ToastRoot, ToastTitle, useForwardPropsEmits } from "reka-ui";
import { computed, onMounted, ref } from "vue";
import { Avatar, type AvatarProps } from "@/components/ui/avatar";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toast, type ToastEmits, type ToastProps, type ToastSlots } from ".";

const props = withDefaults(defineProps<ToastProps>(), {
  close: true,
  orientation: "vertical",
});
const emits = defineEmits<ToastEmits>();
const slots = defineSlots<ToastSlots>();

const rootProps = useForwardPropsEmits(reactivePick(props, "as", "defaultOpen", "open", "duration", "type"), emits);

const ui = computed(() => toast({
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

  setTimeout(() => {
    height.value = el.value.$el.getBoundingClientRect()?.height;
  }, 0);
});

defineExpose({
  height,
});
</script>
