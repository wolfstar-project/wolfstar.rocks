<!-- eslint-disable vue/no-template-shadow -->
<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <div :class="ui.container({ class: props.ui?.container })">
      <CheckboxRoot
        :id="id"
        v-bind="{ ...rootProps, ...$attrs, ...ariaAttrs }"
        v-model="modelValue"
        :name="name"
        :disabled="disabled"
        :class="ui.base({ class: props.ui?.base })"
        @update:model-value="onUpdate"
      >
        <template #default="{ modelValue }">
          <CheckboxIndicator as-child>
            <Icon
              v-if="modelValue === 'indeterminate'"
              :name="indeterminateIcon || appConfig.ui.icons.minus"
              :class="ui.icon({ class: props.ui?.icon })"
            />
            <Icon v-else :name="icon || appConfig.ui.icons.check" :class="ui.icon({ class: props.ui?.icon })" />
          </CheckboxIndicator>
        </template>
      </CheckboxRoot>
    </div>

    <div v-if="label || !!slots.label || description || !!slots.description" :class="ui.wrapper({ class: props.ui?.wrapper })">
      <Label v-if="label || !!slots.label" :for="id" :class="ui.label({ class: props.ui?.label })">
        <slot name="label" :label="label">
          {{ label }}
        </slot>
      </Label>
      <p v-if="description || !!slots.description" :class="ui.description({ class: props.ui?.description })">
        <slot name="description" :description="description">
          {{ description }}
        </slot>
      </p>
    </div>
  </Primitive>
</template>

<script setup lang="ts">
import type { CheckboxEmits, CheckboxProps, CheckboxSlots } from '.'
import { reactivePick } from '@vueuse/core'
import { CheckboxIndicator, CheckboxRoot, Label, Primitive, useForwardProps } from 'reka-ui'

import { computed, useId } from 'vue'
import { Icon } from '@/components/ui/icon'
import { useFormField } from '@/composables/useFormField'
import { checkbox } from '.'

defineOptions({ inheritAttrs: false })

const props = defineProps<CheckboxProps>()
const emits = defineEmits<CheckboxEmits>()
const slots = defineSlots<CheckboxSlots>()
const modelValue = defineModel<boolean | 'indeterminate'>({ default: undefined })

const rootProps = useForwardProps(reactivePick(props, 'required', 'value', 'defaultValue'))

const { id: _id, emitFormChange, emitFormInput, size, color, name, disabled, ariaAttrs } = useFormField<CheckboxProps>(props)
const id = _id.value ?? useId()

const ui = computed(() =>
  checkbox({
    size: size.value,
    color: color.value,
    required: props.required,
    disabled: disabled.value,
    checked: Boolean(modelValue.value ?? props.defaultValue),
  }),
)

function onUpdate(value: any) {
  // @ts-expect-error - 'target' does not exist in type 'EventInit'
  const event = new Event('change', { target: { value } })
  emits('change', event)
  emitFormChange()
  emitFormInput()
}
</script>
