<template>
	<div class="join">
		<UIButton :variant="error ? 'destructive' : undefined" :title="tooltipTitle" @click="openDialog"> {{ label }}: {{ displayValue }} </UIButton>

		<UIModal v-model:open="isOpen" :title="label" @update:open="(value: boolean) => !value && closeDialog()">
			<template #body>
				<UIForm :validation-schema="validationSchema" @submit="handleSubmit">
					<div class="w-full">
						<UIFormField :name="name">
							<UILabel>{{ label }}</UILabel>
							<UISelect v-model="selectedValue" :items="options" :placeholder="placeholder || `Select ${label}`" />
							<span v-if="errors?.[name]" class="text-error">
								{{ errors[name] }}
							</span>
							<span v-else-if="helperText" class="">
								{{ helperText }}
							</span>
						</UIFormField>
					</div>

					<div class="mt-4 flex justify-end gap-2">
						<UIButton variant="outline" @click="closeDialog">Cancel</UIButton>
						<UIButton type="submit">Confirm</UIButton>
					</div>
				</UIForm>
			</template>
		</UIModal>
	</div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

interface Option<T = string | number> {
	label: string;
	value: T;
}

interface Props<T = string | number> {
	label: string;
	options: Option<T>[];
	value?: T | null;
	error?: boolean;
	helperText?: string;
	name?: string;
	tooltipTitle?: string;
	required?: boolean;
	placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
	value: null,
	error: false,
	name: () => `select-${Math.random().toString(36).slice(2)}`,
	helperText: undefined,
	tooltipTitle: undefined,
	required: true,
	placeholder: undefined
});

const emit = defineEmits<{
	(e: 'update:value' | 'change', value: Props['value'] | null): void;
}>();

const isOpen = ref(false);

const selectedValue = ref<any>(props.value);

const validationSchema = computed(() =>
	toTypedSchema(
		z.object({
			[props.name]: props.required ? z.string().min(1, 'This field is required') : z.string().optional()
		})
	)
);

const displayValue = computed(() => {
	const option = props.options.find((opt) => opt.value === selectedValue.value);
	return option?.label ?? (props.placeholder || 'Select...');
});

function openDialog() {
	isOpen.value = true;
}

function closeDialog() {
	isOpen.value = false;
}

function handleSubmit() {
	emit('update:value', selectedValue.value);
	emit('change', selectedValue.value);
	closeDialog();
}

watch(
	() => props.value,
	(newValue) => {
		selectedValue.value = newValue;
	}
);
</script>

<style>
@reference "@/assets/css/main.css";
.modal-backdrop {
	@apply bg-black/50;
}
</style>
