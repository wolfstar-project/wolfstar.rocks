<template>
	<dialog ref="dialogRef" class="modal">
		<div class="modal-backdrop" @click="handleClose"></div>

		<div class="modal-box max-w-md">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<h3 :id="`${name}-title`" class="text-xl font-medium">
					<div class="flex items-center gap-2">
						<nuxt-icon name="fa6-solid:palette" class="h-5 w-5" />
						Choose Color
					</div>
				</h3>
				<button type="button" class="btn btn-ghost btn-circle btn-sm" aria-label="Close dialog" @click="handleClose">
					<nuxt-icon name="fa6-solid:xmark" class="h-5 w-5" />
				</button>
			</div>

			<div class="p-4">
				<Form :validation-schema="validationSchema" @submit="handleConfirm">
					<FormField v-slot="{ error }" :name="name">
						<div class="flex flex-col gap-4">
							<!-- Color Preview -->
							<div class="relative h-24 rounded-lg" :style="{ backgroundColor: selectedColor }">
								<div class="absolute right-2 bottom-2">
									<nuxt-icon name="fa6-solid:eye-dropper" class="text-base-100 h-5 w-5 opacity-75" />
								</div>
							</div>

							<!-- Color Picker -->
							<div class="form-control w-full">
								<FormKit
									type="color"
									:value="selectedColor"
									:class="['input input-bordered w-full', { 'input-error': error }]"
									:validation="undefined"
									:alpha="false"
									@input="handleChange"
								/>
								<div class="absolute top-1/2 right-2 -translate-y-1/2">
									<nuxt-icon name="fa6-solid:circle-half-stroke" class="text-base-content h-5 w-5 opacity-50" />
								</div>
							</div>

							<div v-if="error" class="alert alert-error">
								<nuxt-icon name="fa6-solid:circle-exclamation" class="h-4 w-4" />
								<span>{{ error }}</span>
							</div>
						</div>
					</FormField>

					<!-- Actions -->
					<div class="modal-action">
						<button type="button" class="btn btn-ghost gap-2" @click="handleClose">
							<nuxt-icon name="fa6-solid:xmark" class="h-4 w-4" />
							Cancel
						</button>
						<button type="submit" class="btn btn-primary gap-2">
							<nuxt-icon name="fa6-solid:check" class="h-4 w-4" />
							Confirm
						</button>
					</div>
				</Form>
			</div>
		</div>
	</dialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

interface ColorPickerDialogProps {
	isOpen: boolean;
	value?: string;
	name?: string;
	required?: boolean;
	// eslint-disable-next-line vue/require-default-prop
	onChange?: (value: string) => void;
	// eslint-disable-next-line vue/require-default-prop
	onClose?: () => void;
}

const props = withDefaults(defineProps<ColorPickerDialogProps>(), {
	value: '#000000',
	name: () => `color-${Math.random().toString(36).slice(2)}`,
	required: true
});

const emit = defineEmits<{
	(e: 'update:value' | 'change', value: string): void;
	(e: 'close'): void;
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const selectedColor = ref(props.value);

const validationSchema = computed(() =>
	toTypedSchema(
		z.object({
			[props.name]: props.required
				? z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
				: z
						.string()
						.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
						.optional()
		})
	)
);

watch(
	() => props.isOpen,
	(isOpen) => {
		if (isOpen) {
			dialogRef.value?.showModal();
			selectedColor.value = props.value;
		} else {
			dialogRef.value?.close();
		}
	}
);

const handleClose = () => {
	emit('close');
	props.onClose?.();
};

const handleChange = (value: string) => {
	selectedColor.value = value;
	emit('update:value', value);
	emit('change', value);
	props.onChange?.(value);
};

const handleConfirm = () => {
	emit('update:value', selectedColor.value);
	emit('change', selectedColor.value);
	props.onChange?.(selectedColor.value);
	handleClose();
};

// Watch for external value changes
watch(
	() => props.value,
	(newValue) => {
		selectedColor.value = newValue;
	}
);
</script>
