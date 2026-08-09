<template>
	<form novalidate @submit.prevent="onSubmit">
		<slot />
	</form>
</template>

<script setup lang="ts">
import type { GenericSchema } from "valibot";
import {
	formErrorsKey,
	type FormError,
	type FormErrorEvent,
	type FormSubmitEvent,
} from "#shared/types/ui";
import { safeParse } from "valibot";

const props = defineProps<{
	schema?: GenericSchema;
	state: Record<string, unknown>;
}>();

const emit = defineEmits<{
	submit: [event: FormSubmitEvent<Record<string, unknown>>];
	error: [event: FormErrorEvent];
}>();

const errors = ref<FormError[]>([]);
provide(formErrorsKey, errors);

function mapIssues(
	issues: Array<{ message: string; path?: Array<{ key?: unknown }> }>,
): FormError[] {
	return issues.map((issue) => {
		const name =
			issue.path
				?.map((part) =>
					part.key === undefined || part.key === null ? "" : String(part.key),
				)
				.filter(Boolean)
				.join(".") ?? "";
		return {
			id: name || undefined,
			message: issue.message,
			name,
		};
	});
}

function clear() {
	errors.value = [];
}

function getErrors() {
	return errors.value;
}

function setErrors(next: FormError[]) {
	errors.value = next;
}

function validate(options?: { silent?: boolean }) {
	if (!props.schema) {
		errors.value = [];
		return { data: props.state, errors: [] as FormError[] };
	}

	const result = safeParse(props.schema, props.state);
	if (result.success) {
		errors.value = [];
		return { data: result.output as Record<string, unknown>, errors: [] as FormError[] };
	}

	const nextErrors = mapIssues(result.issues);
	errors.value = nextErrors;
	if (!options?.silent) {
		emit("error", { errors: nextErrors });
	}
	return { data: undefined, errors: nextErrors };
}

function onSubmit() {
	const result = validate({ silent: false });
	if (result.errors.length > 0 || result.data === undefined) return;
	emit("submit", { data: result.data });
}

defineExpose({
	clear,
	getErrors,
	setErrors,
	validate,
});
</script>
