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
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import type { Schema } from "yup";
import type { GuildData } from "~~/server/database";
import { objectKeys } from "@sapphire/utilities/objectKeys";
import { isDeepEqual } from "~~/shared/utils/isDeepEqual";

interface Props {
  schema: Schema;
  state: T;
  mapToGuildData?: (state: T) => Partial<GuildData>;
}

const { schema, state, mapToGuildData } = defineProps<Props>();
const emit = defineEmits<{
  error: [event: FormErrorEvent];
}>();
const toast = useToast();
const { setGuildSettingsChanges } = useGuildSettingsChanges();
const formRef = useTemplateRef("form-settings");

// Original state snapshot
const originalState = ref<T>() as Ref<T>;

// Initialize original state on mount
onMounted(() => {
  originalState.value = structuredClone(toRaw(state));
});

// Calculate changes between current state and original values
function calculateChanges(currentState: T): Partial<GuildData> {
  const changes: Partial<GuildData> = {};
  if (!originalState.value)
    return changes;

  // If a custom mapper is provided, use it
  if (mapToGuildData) {
    const mappedChanges = mapToGuildData(currentState);

    // Check if any values have actually changed
    for (const [key, value] of Object.entries(mappedChanges)) {
      const originalValue = (originalState.value as any)[key];
      // Use deep comparison
      if (!isDeepEqual(value, originalValue) && value !== undefined) {
        (changes as any)[key] = value;
      }
    }
  }
  else {
    // Default behavior if no mapper (comparative check on all keys in originalValues)
    for (const key of Object.keys(originalState.value)) {
      const value = currentState[key];
      const originalValue = (originalState.value as any)[key];
      if (!isDeepEqual(value, originalValue) && value !== undefined) {
        (changes as any)[key] = value;
      }
    }
  }

  return changes;
}

// Watch for state changes to update the global settings store (triggers UI footer)
watch(
  () => state,
  (newState) => {
    const changes = calculateChanges(newState);
    // Identify if there are any keys in changes
    const hasChanges = objectKeys(changes).length > 0;

    if (hasChanges) {
      setGuildSettingsChanges(changes);
      toast.add({
        color: "info",
        icon: "heroicons:information-circle",
        title: "Changes Staged",
        description: "Click 'Save Changes' to apply your changes",
      });
    }
    else {
      setGuildSettingsChanges({}); // Clear changes if state matches original
    }
  },
  { deep: true },
);

function handleSubmit(event: FormSubmitEvent<T>) {
  // Changes are already tracked by the watcher, but we calculate one last time for the event
  // or rely on what's in the store.
  // Actually, the emit event.data is usually the same as props.state if v-model is used.

  // We can just emit submit. The form submission might be triggered by the footer button?
  // If the footer button calls form.submit(), we want to finalize things.

  const changes = calculateChanges(event.data);
  // Ensure the store has the final changes before emitting submit.
  // This is important if the form is submitted before the watcher has a chance to run,
  // or if event.data differs slightly from props.state due to form internals.
  setGuildSettingsChanges(changes);
}

function handleError(event: FormErrorEvent) {
  emit("error", event);
}

// Expose form ref methods
defineExpose({
  validate: (options?: any) => formRef.value?.validate(options),
  clear: () => formRef.value?.clear(),
  getErrors: () => formRef.value?.getErrors(),
  setErrors: (errors: any) => formRef.value?.setErrors(errors),
});
</script>
