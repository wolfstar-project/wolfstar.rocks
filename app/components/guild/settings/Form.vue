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
import type { Schema } from "yup";
import { isDeepEqual } from "#shared/utils/isDeepEqual";
import { objectKeys } from "@sapphire/utilities/objectKeys";

interface Props {
  schema: Schema;
  state: T;
  mapToGuildData?: (state: T) => Partial<GuildData>;
}

const { schema, state, mapToGuildData } = defineProps<Props>();
const emit = defineEmits<{
  error: [event: FormErrorEvent];
}>();
const { setGuildSettingsChanges, removeChange } = useGuildSettingsChanges();
const { originalGuildSettings } = useGuildSettings();
const formRef = useTemplateRef("form-settings");

// Original state snapshot - delay until data is loaded
const originalState = ref<T | undefined>(undefined);
const isOriginalStateInitialized = ref(false);

// Calculate changes between current state and original values
function calculateChanges(currentState: T): { changes: Partial<GuildData>; changedKeys: Set<keyof GuildData>; revertedKeys: Set<keyof GuildData> } {
  const changes: Partial<GuildData> = {};
  const changedKeys = new Set<keyof GuildData>();
  const revertedKeys = new Set<keyof GuildData>();

  if (!originalState.value) {
    return { changes, changedKeys, revertedKeys };
  }

  // Map both current and original states to GuildData format for comparison
  const mappedCurrent = mapToGuildData ? mapToGuildData(currentState) : currentState;
  const mappedOriginal = mapToGuildData ? mapToGuildData(originalState.value) : originalState.value;

  // Track all keys from both mapped states
  const allKeys = new Set([
    ...objectKeys(mappedCurrent),
    ...objectKeys(mappedOriginal),
  ]);

  // Compare each key
  for (const key of allKeys) {
    const currentValue = (mappedCurrent as any)[key];
    const originalValue = (mappedOriginal as any)[key];

    // Check if value has changed from original
    if (!isDeepEqual(currentValue, originalValue)) {
      if (currentValue !== undefined) {
        (changes as any)[key] = currentValue;
        changedKeys.add(key as keyof GuildData);
      }
    }
    else {
      // Value has been reverted to original
      revertedKeys.add(key as keyof GuildData);
    }
  }

  return { changes, changedKeys, revertedKeys };
}

function handleSubmit(event: FormSubmitEvent<T>) {
  // Ensure the store has the final changes before submission
  // This is important if the form is submitted before the watcher has a chance to run
  const { changes } = calculateChanges(event.data);

  if (objectKeys(changes).length > 0) {
    setGuildSettingsChanges(changes);
  }
}

function handleError(event: FormErrorEvent) {
  emit("error", event);
}

// Watch for state changes to update the global settings store (triggers UI footer)
watch(
  () => state,
  (newState) => {
    // Skip if original state hasn't been initialized yet
    if (!isOriginalStateInitialized.value)
      return;

    const { changes, revertedKeys } = calculateChanges(newState);

    // Remove changes for keys that have been reverted to original
    for (const key of revertedKeys) {
      removeChange(key);
    }

    // Update changes for keys that differ from original
    const hasChanges = objectKeys(changes).length > 0;
    if (hasChanges) {
      setGuildSettingsChanges(changes);
    }
    else {
      // Clear all changes if nothing differs from original
      setGuildSettingsChanges(undefined);
    }
  },
  { deep: true },
);

// Watch for when guild settings are loaded, then snapshot original state
watchEffect(() => {
  // Only initialize once, when originalGuildSettings becomes defined
  if (!isOriginalStateInitialized.value && originalGuildSettings.value !== undefined) {
    originalState.value = structuredClone(toRaw(state));
    isOriginalStateInitialized.value = true;
  }
});

// Expose form ref methods
defineExpose({
  validate: (options?: any) => formRef.value?.validate(options),
  clear: () => formRef.value?.clear(),
  getErrors: () => formRef.value?.getErrors(),
  setErrors: (errors: any) => formRef.value?.setErrors(errors),
});
</script>
