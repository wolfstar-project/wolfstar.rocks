<template>
	<div>
		<Button :variant="error ? 'error' : 'default'" :title="tooltipTitle" @click="openDialog">
			{{ label }}: {{ displayValue }}
			<Icon v-if="icon" :name="icon" class="ml-2 size-6" />
		</Button>

		<Modal :open="isOpen" @close="closeDialog">
			<template #header>
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold">{{ label }}</h3>
				</div>
			</template>

			<VeeForm v-slot="{ errors }" :validation-schema="validationSchema" @submit="handleSubmit">
				<div class="w-full">
					<Input v-if="searchable && options.length > 10" v-model="search" name="search" type="text" class="mb-4" placeholder="Search..." />

					<div class="max-h-64 overflow-y-auto">
						<div v-for="option in filteredOptions" :key="option.value">
							<label class="label cursor-pointer">
								<span class="flex items-center">
									{{ option.label }}
									<img v-if="option.iconUrl" :src="option.iconUrl" :alt="option.label" class="ml-2 size-6" />
								</span>
								<ShadCheckbox
									:name="props.name"
									:value="option.value"
									:checked="selectedValues.includes(option.value)"
									@change="toggleSelection(option.value)"
								/>
							</label>
						</div>
					</div>

					<ErrorMessage v-slot="{ message }" :name="props.name">
						<Alert variant="error" class="mt-2">{{ message }}</Alert>
					</ErrorMessage>

					<Text v-if="helperText && !errors[props.name]" variant="muted" class="mt-2">
						{{ helperText }}
					</Text>
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<ShadButton variant="ghost" @click="clearSelection">Clear</ShadButton>
						<ShadButton variant="default" @click="closeDialog">Cancel</ShadButton>
						<ShadButton type="submit" variant="primary">Confirm</ShadButton>
					</div>
				</template>
			</VeeForm>
		</Modal>
	</div>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

interface Option<T = string> {
	label: string;
	value: T;
	[keY: string]: T | string | null;
}

interface Props<T = string> {
	label: string;
	options: Option<T>[];
	value: T[];
	error?: boolean;
	helperText?: string;
	name?: string;
	tooltipTitle?: string;
	required?: boolean;
	placeholder?: string;
	searchable?: boolean;
	icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
	error: false,
	name: () => `multi-select-${Math.random().toString(36).slice(2)}`,
	tooltipTitle: undefined,
	required: true,
	helperText: undefined,
	placeholder: undefined,
	searchable: true,
	imageInName: undefined
});

const emit = defineEmits<{
	(e: 'update:value' | 'change', value: Props['value']): void;
}>();

const isOpen = ref(false);
const search = ref('');
const validationSchema = toTypedSchema(props.required ? z.array(z.string()).min(1, 'At least one item must be selected') : z.array(z.string()));

const { value: fieldValue } = useField<string[]>(props.name, validationSchema);

const selectedValues = computed({
	get: () => fieldValue.value ?? [...props.value],
	set: (newValue) => {
		fieldValue.value = newValue;
	}
});

const filteredOptions = computed(() => {
	if (!search.value) return props.options;
	const searchLower = search.value.toLowerCase();
	return props.options.filter((item) => item.label.toLowerCase().includes(searchLower));
});

const displayValue = computed(() => {
	if (!selectedValues.value.length) return props.placeholder || 'Select...';
	return `${selectedValues.value.length} selected`;
});

const openDialog = () => {
	isOpen.value = true;
};

const closeDialog = () => {
	isOpen.value = false;
	search.value = '';
};

const toggleSelection = (value: Props['value'][number]) => {
	const currentValues = Array.isArray(selectedValues.value) ? [...selectedValues.value] : [];
	const index = currentValues.indexOf(value);

	if (index === -1) {
		selectedValues.value = [...currentValues, value];
	} else {
		currentValues.splice(index, 1);
		selectedValues.value = currentValues;
	}
};

const clearSelection = () => {
	selectedValues.value = [];
};

const handleSubmit = () => {
	emit('update:value', selectedValues.value);
	emit('change', selectedValues.value);
	closeDialog();
};

watch(
	() => props.value,
	(newValue) => {
		selectedValues.value = [...newValue];
	}
);
</script>

<style>
@reference "@/assets/css/main.css";

.modal-backdrop {
	@apply bg-black/50;
}

.checkbox:checked {
	@apply border-primary bg-primary;
}
</style>
