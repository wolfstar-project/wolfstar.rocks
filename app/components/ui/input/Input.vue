<template>
	<Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
		<input
			:id="id"
			ref="inputRef"
			:type="type"
			:value="modelValue"
			:name="name"
			:placeholder="placeholder"
			:class="ui.base({ class: props.ui?.base })"
			:disabled="disabled"
			:required="required"
			:autocomplete="autocomplete"
			v-bind="{ ...$attrs, ...ariaAttrs }"
			@input="onInput"
			@blur="onBlur"
			@change="onChange"
			@focus="emitFormFocus"
		/>

		<slot />

		<span v-if="isLeading || !!avatar || !!slots.leading" :class="ui.leading({ class: props.ui?.leading })">
			<slot name="leading">
				<Icon v-if="isLeading && leadingIconName" :name="leadingIconName" :class="ui.leadingIcon({ class: props.ui?.leadingIcon })" />
				<Avatar
					v-else-if="!!avatar"
					:size="(props.ui?.leadingAvatarSize || ui.leadingAvatarSize()) as AvatarProps['size']"
					v-bind="avatar"
					:class="ui.leadingAvatar({ class: props.ui?.leadingAvatar })"
				/>
			</slot>
		</span>

		<span v-if="isTrailing || !!slots.trailing" :class="ui.trailing({ class: props.ui?.trailing })">
			<slot name="trailing">
				<Icon v-if="trailingIconName" :name="trailingIconName" :class="ui.trailingIcon({ class: props.ui?.trailingIcon })" />
			</slot>
		</span>
	</Primitive>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Primitive } from 'reka-ui';
import { Icon } from '@/components/ui/icon';
import { Avatar, type AvatarProps } from '@/components/ui/avatar';
import { input, type InputProps, type InputEmits, type InputSlots, type InputVariants } from '.';
import { useFormField } from '~/composables/useFormField';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<InputProps>(), {
	type: 'text',
	autocomplete: 'off',
	autofocusDelay: 0
});
const emits = defineEmits<InputEmits>();
const slots = defineSlots<InputSlots>();

const [modelValue, modelModifiers] = defineModel<string | number | null>();

const {
	emitFormBlur,
	emitFormInput,
	emitFormChange,
	size: formGroupSize,
	color,
	id,
	name,
	highlight,
	disabled,
	emitFormFocus,
	ariaAttrs
} = useFormField<InputProps>(props, { deferInputValidation: true });
const { orientation, size: buttonGroupSize } = useButtonGroup<InputProps>(props);
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);

const inputSize = computed(() => buttonGroupSize.value || formGroupSize.value);

const ui = computed(() =>
	input({
		type: props.type as InputVariants['type'],
		color: color.value,
		variant: props.variant,
		size: inputSize?.value,
		loading: props.loading,
		highlight: highlight.value,
		leading: isLeading.value || !!props.avatar || !!slots.leading,
		trailing: isTrailing.value || !!slots.trailing,
		buttonGroup: orientation.value
	})
);

const inputRef = ref<HTMLInputElement | null>(null);

// Custom function to handle the v-model properties
function updateInput(value: string | null) {
	if (modelModifiers.trim) {
		value = value?.trim() ?? null;
	}

	if (modelModifiers.number || props.type === 'number') {
		value = looseToNumber(value);
	}

	if (modelModifiers.nullify) {
		value ||= null;
	}

	modelValue.value = value;
	emitFormInput();
}

function onInput(event: Event) {
	if (!modelModifiers.lazy) {
		updateInput((event.target as HTMLInputElement).value);
	}
}

function onChange(event: Event) {
	const value = (event.target as HTMLInputElement).value;

	if (modelModifiers.lazy) {
		updateInput(value);
	}

	// Update trimmed input so that it has same behavior as native input https://github.com/vuejs/core/blob/5ea8a8a4fab4e19a71e123e4d27d051f5e927172/packages/runtime-dom/src/directives/vModel.ts#L63
	if (modelModifiers.trim) {
		(event.target as HTMLInputElement).value = value.trim();
	}

	emitFormChange();
	emits('change', event);
}

function onBlur(event: FocusEvent) {
	emitFormBlur();
	emits('blur', event);
}

function autoFocus() {
	if (props.autofocus) {
		inputRef.value?.focus();
	}
}

onMounted(() => {
	setTimeout(() => {
		autoFocus();
	}, props.autofocusDelay);
});

defineExpose({
	inputRef
});
</script>
