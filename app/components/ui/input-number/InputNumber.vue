<template>
  <NumberFieldRoot
    v-bind="rootProps"
    :id="id"
    :class="ui.root({ class: [props.class, props.ui?.root] })"
    :name="name"
    :disabled="disabled"
    @update:model-value="onUpdate"
  >
    <NumberFieldInput
      v-bind="{ ...$attrs, ...ariaAttrs }"
      ref="inputRef"
      :placeholder="placeholder"
      :required="required"
      :class="ui.base({ class: props.ui?.base })"
      @blur="onBlur"
      @focus="emitFormFocus"
    />

    <div :class="ui.increment({ class: props.ui?.increment })">
      <NumberFieldIncrement as-child :disabled="disabled">
        <slot name="increment">
          <Button
            :icon="incrementIcon"
            :color="color"
            :size="size"
            variant="link"
            aria-label="Increment"
            v-bind="typeof increment === 'object' ? increment : undefined"
          />
        </slot>
      </NumberFieldIncrement>
    </div>

    <div :class="ui.decrement({ class: props.ui?.decrement })">
      <NumberFieldDecrement as-child :disabled="disabled">
        <slot name="decrement">
          <Button
            :icon="decrementIcon"
            :color="color"
            :size="size"
            variant="link"
            aria-label="Decrement"
            v-bind="typeof decrement === 'object' ? decrement : undefined"
          />
        </slot>
      </NumberFieldDecrement>
    </div>
  </NumberFieldRoot>
</template>

<script setup lang="ts">
import type { InputNumberEmits, InputNumberProps, InputNumberSlots } from ".";
import { reactivePick } from "@vueuse/core";
import { NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, NumberFieldRoot, useForwardPropsEmits } from "reka-ui";
import { computed, onMounted, ref } from "vue";
import { Button } from "@/components/ui/button";
import { useFormField } from "@/composables/useFormField";
import { inputNumber } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<InputNumberProps>(), {
  orientation: "horizontal",
});
const emits = defineEmits<InputNumberEmits>();
defineSlots<InputNumberSlots>();

const rootProps = useForwardPropsEmits(
  reactivePick(props, "as", "modelValue", "defaultValue", "min", "max", "step", "stepSnapping", "formatOptions", "disableWheelChange"),
  emits,
);

const { emitFormBlur, emitFormFocus, emitFormChange, emitFormInput, id, color, size, name, highlight, disabled, ariaAttrs }
	= useFormField<InputNumberProps>(props);

const ui = computed(() =>
  inputNumber({
    color: color.value,
    variant: props.variant,
    size: size.value,
    highlight: highlight.value,
    orientation: props.orientation,
  }),
);

const incrementIcon = computed(() => props.incrementIcon || (props.orientation === "horizontal" ? "radix-icons:plus" : "radix-icons:chevron-up"));
const decrementIcon = computed(() => props.decrementIcon || (props.orientation === "horizontal" ? "radix-icons:minus" : "radix-icons:chevron-down"));

const inputRef = ref<InstanceType<typeof NumberFieldInput> | null>(null);

function onUpdate(value: number) {
  // @ts-expect-error - 'target' does not exist in type 'EventInit'
  const event = new Event("change", { target: { value } });
  emits("change", event);

  emitFormChange();
  emitFormInput();
}

function onBlur(event: FocusEvent) {
  emitFormBlur();
  emits("blur", event);
}

function autoFocus() {
  if (props.autofocus) {
    inputRef.value?.$el?.focus();
  }
}

onMounted(() => {
  setTimeout(() => {
    autoFocus();
  }, props.autofocusDelay);
});

defineExpose({
  inputRef,
});
</script>
