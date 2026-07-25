<template>
	<div class="fieldset w-full gap-1.5">
		<label v-if="label || $slots.label" class="label justify-start gap-1 px-0" :for="fieldId">
			<span class="label-text font-medium">
				<slot name="label">{{ label }}</slot>
			</span>
			<span v-if="required" class="text-error" aria-hidden="true">*</span>
		</label>
		<slot name="description">
			<p v-if="description" class="text-sm text-muted">{{ description }}</p>
		</slot>
		<slot />
		<slot name="error" :error="errorMessage">
			<p v-if="errorMessage" class="text-sm text-error" role="alert">{{ errorMessage }}</p>
		</slot>
		<div v-if="hint || help || $slots.help" class="text-sm text-muted">
			<slot name="help">{{ hint || help }}</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { formErrorsKey, type FormError } from "#shared/types/ui";

const props = defineProps<{
	label?: string;
	name?: string;
	error?: string | boolean;
	hint?: string;
	help?: string;
	description?: string;
	required?: boolean;
}>();

const injectedErrors = inject(formErrorsKey, ref<FormError[]>([]));

const fieldId = computed(() => props.name);

const errorMessage = computed(() => {
	if (typeof props.error === "string" && props.error) return props.error;
	if (props.error === true) return "Invalid value";
	if (!props.name) return undefined;
	return injectedErrors.value.find((error) => error.name === props.name)?.message;
});
</script>
