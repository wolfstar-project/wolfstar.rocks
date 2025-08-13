<template>
  <DialogRoot v-slot="{ open }" v-bind="rootProps">
    <DialogTrigger v-if="!!slots.default" as-child :class="props.class">
      <slot :open="open"></slot>
    </DialogTrigger>

    <DialogPortal :disabled="!portal">
      <DialogOverlay v-if="overlay" :class="ui.overlay({ class: props.ui?.overlay })" />

      <DialogContent
        :class="ui.content({ class: [!slots.default && props.class, props.ui?.content] })"
        v-bind="contentProps"
        @after-leave="emits('after:leave')"
        v-on="contentEvents"
      >
        <VisuallyHidden v-if="!!slots.content && (title || !!slots.title || description || !!slots.description)">
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

        <slot name="content">
          <div
            v-if="!!slots.header || title || !!slots.title || description || !!slots.description || close || !!slots.close"
            :class="ui.header({ class: props.ui?.header })"
          >
            <slot name="header">
              <div :class="ui.wrapper({ class: props.ui?.wrapper })">
                <DialogTitle v-if="title || !!slots.title" :class="ui.title({ class: props.ui?.title })">
                  <slot name="title">
                    {{ title }}
                  </slot>
                </DialogTitle>

                <DialogDescription
                  v-if="description || !!slots.description"
                  :class="ui.description({ class: props.ui?.description })"
                >
                  <slot name="description">
                    {{ description }}
                  </slot>
                </DialogDescription>
              </div>

              <DialogClose v-if="close || !!slots.close" as-child>
                <slot name="close" :ui="ui">
                  <Button
                    v-if="close"
                    :icon="closeIcon || 'radix-icons:cross2'"
                    size="md"
                    color="neutral"
                    variant="ghost"
                    aria-label="Close"
                    v-bind="typeof close === 'object' ? (close as Partial<ButtonProps>) : {}"
                    :class="ui.close({ class: props.ui?.close })"
                  />
                </slot>
              </DialogClose>
            </slot>
          </div>

          <div v-if="!!slots.body" :class="ui.body({ class: props.ui?.body })">
            <slot name="body"></slot>
          </div>

          <div v-if="!!slots.footer" :class="ui.footer({ class: props.ui?.footer })">
            <slot name="footer"></slot>
          </div>
        </slot>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import type { ModalEmits, ModalProps, ModalSlots } from ".";
import type { ButtonProps } from "@/components/ui/button";
import { reactivePick } from "@vueuse/core";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  useForwardPropsEmits,
  VisuallyHidden,
} from "reka-ui";
import { computed, toRef } from "vue";
import { Button } from "@/components/ui/button";
import { modal } from ".";

const props = withDefaults(defineProps<ModalProps>(), {
  close: true,
  portal: true,
  overlay: true,
  transition: true,
  modal: true,
  dismissible: true,
});
const emits = defineEmits<ModalEmits>();
const slots = defineSlots<ModalSlots>();

const rootProps = useForwardPropsEmits(reactivePick(props, "open", "defaultOpen", "modal"), emits);
const contentProps = toRef(() => props.content);
const contentEvents = computed(() => {
  const events = {
    closeAutoFocus: (e: Event) => e.preventDefault(),
  };

  if (!props.dismissible) {
    return {
      pointerDownOutside: (e: Event) => e.preventDefault(),
      interactOutside: (e: Event) => e.preventDefault(),
      escapeKeyDown: (e: Event) => e.preventDefault(),
      ...events,
    };
  }

  return events;
});

const ui = computed(() =>
  modal({
    transition: props.transition,
    fullscreen: props.fullscreen,
  }),
);
</script>
