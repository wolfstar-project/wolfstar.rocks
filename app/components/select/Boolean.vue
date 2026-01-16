<template>
  <UModal :title="formattedLabel" :description>
    <UButton :label="buttonLabel" :disabled variant="soft" />

    <template #body>
      <SelectFieldWrapper
        :field-name
        :tooltip-title
      >
        <div class="flex items-center gap-3">
          <UToggle
            v-model="isEnabled"
            :disabled
            size="lg"
          />
          <span class="text-sm font-medium text-base-content">
            {{ isEnabled ? 'Enabled' : 'Disabled' }}
          </span>
        </div>

        <template #help>
          <div class="flex items-center justify-between gap-2">
            <UButton
              variant="ghost"
              color="error"
              size="sm"
              :disabled
              @click="handleReset"
            >
              Reset to default
            </UButton>
          </div>
        </template>
      </SelectFieldWrapper>
    </template>
  </UModal>
</template>

<script lang="ts">
import { toTitleCase } from "@sapphire/utilities";

export interface SelectBooleanProps {
  /** The label to show on the button */
  label: string;
  /** The current boolean value */
  value?: boolean;
  /** Optional description below the field */
  description?: string;
  /** Content to be shown as a tooltip when hovering over the button */
  tooltipTitle?: string;
  /** Disable the field */
  disabled?: boolean;
  /** Default value when reset */
  defaultValue?: boolean;
}

interface Emits {
  (e: "change", value: boolean): void;
  (e: "reset"): void;
}
</script>

<script setup lang="ts">
const { value = false, disabled = false, label, description, tooltipTitle, defaultValue = false } = defineProps<SelectBooleanProps>();

const emit = defineEmits<Emits>();

const isEnabled = ref<boolean>(value);

const formattedLabel = computed(() => toTitleCase(label));
const fieldName = computed(() => label.trim().toLowerCase().replace(/\s+/g, "-"));

const statusText = computed(() => isEnabled.value ? "Enabled" : "Disabled");
const buttonLabel = computed(() => `${formattedLabel.value}: ${statusText.value}`);

watch(
  () => value,
  newValue => {
    isEnabled.value = newValue;
  },
);

watch(
  isEnabled,
  newValue => {
    emit("change", newValue);
  },
);

function handleReset() {
  isEnabled.value = defaultValue;
  emit("reset");
}
</script>
