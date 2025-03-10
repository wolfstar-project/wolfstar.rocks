<template>
	<form class="form-control w-full max-w-lg" @submit="onSubmit">
		<div class="space-y-4 p-4">
			<div v-for="field in schemaFields" :key="field.name" class="form-control">
				<label :for="field.name" class="label">
					<span class="label-text capitalize">{{ field.name }}</span>
				</label>

				<input
					:id="field.name"
					v-model="field.value"
					v-bind="field.attrs"
					class="input input-bordered w-full"
					:class="{ 'input-error': field.errorMessage }"
				/>

				<label v-if="field.errorMessage" class="label">
					<span class="label-text-alt text-error">{{ field.errorMessage }}</span>
				</label>
			</div>

			<div class="form-control gap-2">
				<!-- Form-level error message -->
				<div v-if="errors.form" class="alert alert-error">
					<nuxt-icon name="heroicons:exclamation-triangle" class="h-6 w-6" />
					<span>{{ errors.form }}</span>
				</div>

				<!-- Action buttons -->
				<div class="flex items-center gap-2">
					<button type="submit" class="btn btn-primary" :class="{ loading: isSubmitting }" :disabled="isSubmitting || hasErrors">
						{{ submitLabel }}
					</button>
					<button type="button" class="btn btn-ghost" :disabled="isSubmitting" @click="handleReset">Reset</button>
				</div>
			</div>
		</div>
	</form>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import type { z } from 'zod';

const props = withDefaults(
	defineProps<{
		schema: z.ZodObject<z.ZodRawShape>;
		initialData?: Record<string, unknown>;
		submitLabel?: string;
		autoSaveDelay?: number;
	}>(),
	{
		initialData: undefined,
		submitLabel: 'Submit',
		autoSaveDelay: 2000
	}
);

const { schema } = toRefs(props);
const validationSchema = toTypedSchema(props.schema);
type FormValues = z.infer<typeof props.schema>;

const { errors, handleSubmit, isSubmitting, values, handleReset } = useForm({
	validationSchema,
	initialValues: props.initialData
});

// Create fields based on schema
const schemaFields = computed(() => {
	const fields = Object.keys(schema.value.shape).map((fieldName) => {
		const { value, errorMessage } = useField(fieldName);
		return {
			name: fieldName,
			value,
			errorMessage,
			attrs: { type: 'text' } // Add more attributes based on field type if needed
		};
	});
	return fields;
});

const emit = defineEmits<{
	(e: 'save', data: FormValues): void;
	(e: 'error', error: Error): void;
}>();

const hasErrors = computed(() => Object.keys(errors.value).length > 0);

// Auto-save using VueUse's useDebounceFn
const autoSave = useDebounceFn(async () => {
	if (hasErrors.value || !values.value) return;

	emit('save', values.value);
	toast.success('Changes saved', { description: 'Your changes have been saved' });
}, props.autoSaveDelay);

// Watch form values and trigger auto-save
watch(
	values,
	() => {
		if (props.autoSaveDelay !== undefined) {
			autoSave();
		}
	},
	{ deep: true }
);

const onSubmit = handleSubmit(
	(values) => {
		emit('save', values);
		toast.success('Success', { description: 'Form has been submitted successfully' });
	},
	({ errors }) => {
		const errorMessage = Object.keys(errors)[0];
		if (errorMessage) {
			emit('error', new Error(errorMessage));
			toast.error('Error', { description: errorMessage });
		}
	}
);
</script>
