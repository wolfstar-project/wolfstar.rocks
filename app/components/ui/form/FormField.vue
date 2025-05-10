<template>
    <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
        <div :class="ui.wrapper({ class: props.ui?.wrapper })">
            <div v-if="label || !!slots.label" :class="ui.labelWrapper({ class: props.ui?.labelWrapper })">
                <Label :for="id" :class="ui.label({ class: props.ui?.label })">
                    <slot name="label" :label="label">
                        {{ label }}
                    </slot>
                </Label>
                <span v-if="hint || !!slots.hint" :id="`${ariaId}-hint`" :class="ui.hint({ class: props.ui?.hint })">
                    <slot name="hint" :hint="hint">
                        {{ hint }}
                    </slot>
                </span>
            </div>

            <p v-if="description || !!slots.description" :id="`${ariaId}-description`" :class="ui.description({ class: props.ui?.description })">
                <slot name="description" :description="description">
                    {{ description }}
                </slot>
            </p>
        </div>

        <div :class="[(label || !!slots.label || description || !!slots.description) && ui.container({ class: props.ui?.container })]">
            <slot :error="error"></slot>

            <p v-if="(typeof error === 'string' && error) || !!slots.error" :id="`${ariaId}-error`" :class="ui.error({ class: props.ui?.error })">
                <slot name="error" :error="error">
                    {{ error }}
                </slot>
            </p>
            <p v-else-if="help || !!slots.help" :class="ui.help({ class: props.ui?.help })">
                <slot name="help" :help="help">
                    {{ help }}
                </slot>
            </p>
        </div>
    </Primitive>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import type { FormFieldProps, FormFieldSlots } from '.';
import type { FormError, FormFieldInjectedOptions } from '~/types/form';
import { Primitive } from 'reka-ui';
import { computed, inject, provide, ref, useId } from 'vue';
import { formFieldInjectionKey, inputIdInjectionKey } from '~/composables/useFormField';
import { formField } from '.';

const props = defineProps<FormFieldProps>();
const slots = defineSlots<FormFieldSlots>();

const ui = computed(() =>
    formField({
        size: props.size,
        required: props.required,
    }),
);

const formErrors = inject<Ref<FormError[]> | null>('form-errors', null);

const error = computed(
    () =>
        props.error
        || formErrors?.value?.find(error => error.name && (error.name === props.name || (props.errorPattern && error.name.match(props.errorPattern))))
            ?.message,
);

const id = ref(useId());
// Copies id's initial value to bind aria-attributes such as aria-describedby.
// This is required for the RadioGroup component which unsets the id value.
const ariaId = id.value;

provide(inputIdInjectionKey, id);

provide(
    formFieldInjectionKey,
    computed(
        () =>
            ({
                error: error.value,
                name: props.name,
                size: props.size,
                eagerValidation: props.eagerValidation,
                validateOnInputDelay: props.validateOnInputDelay,
                errorPattern: props.errorPattern,
                hint: props.hint,
                description: props.description,
                help: props.help,
                ariaId,
            }) as FormFieldInjectedOptions<FormFieldProps>,
    ),
);
</script>
