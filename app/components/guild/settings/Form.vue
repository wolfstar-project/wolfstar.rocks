<template>
	<UForm
		ref="form-settings"
		:schema="schema"
		:state="state"
		v-bind="$attrs"
		@error="handleError"
		@submit="handleSubmit"
	>
		<slot></slot>
	</UForm>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import type { GuildData } from "#server/database";
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import type { GenericSchema } from "valibot";
import { isDeepEqual } from "#shared/utils/isDeepEqual";
import { objectKeys } from "@sapphire/utilities/objectKeys";

interface Props {
	schema: GenericSchema;
	state: T;
	mapToGuildData?: (state: T) => Partial<GuildData>;
}

const { schema, state, mapToGuildData } = defineProps<Props>();
const emit = defineEmits<{
	error: [event: FormErrorEvent];
}>();
const { setGuildSettingsChanges, removeChange, resetCounter } = useGuildSettingsChanges();
const { originalGuildSettings } = useGuildSettings();
const formRef = useTemplateRef("form-settings");

const originalState = ref<T | undefined>(undefined);
const isOriginalStateInitialized = ref(false);
const isResetting = ref(false);

// Calculate changes between current state and original values
function calculateChanges(currentState: T): {
	changes: Partial<GuildData>;
	changedKeys: Set<keyof GuildData>;
	revertedKeys: Set<keyof GuildData>;
} {
	const changes: Partial<GuildData> = {};
	const changedKeys = new Set<keyof GuildData>();
	const revertedKeys = new Set<keyof GuildData>();

	if (!originalState.value) {
		return { changedKeys, changes, revertedKeys };
	}

	const mappedCurrent = mapToGuildData ? mapToGuildData(currentState) : currentState;
	const mappedOriginal = mapToGuildData
		? mapToGuildData(originalState.value)
		: originalState.value;

	const allKeys = new Set([...objectKeys(mappedCurrent), ...objectKeys(mappedOriginal)]);

	for (const key of allKeys) {
		const currentValue = (mappedCurrent as any)[key];
		const originalValue = (mappedOriginal as any)[key];

		if (!isDeepEqual(currentValue, originalValue)) {
			if (currentValue !== undefined) {
				(changes as any)[key] = currentValue;
				changedKeys.add(key as keyof GuildData);
			}
		} else {
			revertedKeys.add(key as keyof GuildData);
		}
	}

	return { changedKeys, changes, revertedKeys };
}

function handleSubmit(event: FormSubmitEvent<any>) {
	// Ensure the store has the final changes before submission
	// This is important if the form is submitted before the watcher has a chance to run
	const { changes } = calculateChanges(event.data as T);

	if (objectKeys(changes).length > 0) {
		setGuildSettingsChanges(changes);
	}
}

function handleError(event: FormErrorEvent) {
	emit("error", event);
}

watch(
	() => state,
	(newState) => {
		if (!isOriginalStateInitialized.value || isResetting.value) {
			return;
		}

		const { changes, revertedKeys } = calculateChanges(newState);

		for (const key of revertedKeys) {
			removeChange(key);
		}

		const hasChanges = objectKeys(changes).length > 0;
		if (hasChanges) {
			setGuildSettingsChanges(changes);
		} else {
			setGuildSettingsChanges(undefined);
		}
	},
	{ deep: true },
);

watchEffect(() => {
	if (!isOriginalStateInitialized.value && originalGuildSettings.value !== undefined) {
		originalState.value = structuredClone(toRaw(state));
		isOriginalStateInitialized.value = true;
	}
});

watch(
	originalGuildSettings,
	() => {
		if (isOriginalStateInitialized.value) {
			originalState.value = structuredClone(toRaw(state));
		}
	},
	{ flush: "sync" },
);

watch(
	resetCounter,
	async () => {
		if (!isOriginalStateInitialized.value || !originalState.value) {
			return;
		}

		isResetting.value = true;
		Object.assign(state, structuredClone(toRaw(originalState.value)));
		formRef.value?.clear();
		await nextTick();
		isResetting.value = false;
	},
	{ flush: "sync" },
);

defineExpose({
	clear: () => formRef.value?.clear(),
	getErrors: () => formRef.value?.getErrors(),
	setErrors: (errors: any) => formRef.value?.setErrors(errors),
	validate: (options?: any) => formRef.value?.validate(options),
});
</script>
