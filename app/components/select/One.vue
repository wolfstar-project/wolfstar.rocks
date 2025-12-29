<template>
  <UModal :title="formattedLabel" :description>
    <UButton :label="buttonLabel" :disabled variant="soft" />

    <template #body>
      <SelectFieldWrapper
        :field-name
        :tooltip-title
      >
        <USelect
          v-model="selectedValue"
          :items
          :disabled
          value-key="value"
          label-key="label"
          :placeholder
          class="w-full"
        >
          <template v-if="imageInName" #trailing>
            <UAvatar :src="imageInName" alt="Emoji" size="2xs" />
          </template>
        </USelect>

        <template #help>
          <div class="flex items-center justify-between gap-2">
            <UButton
              variant="ghost"
              color="error"
              size="sm"
              :disabled
              @click="handleReset"
            >
              Clear selected
            </UButton>
          </div>
        </template>
      </SelectFieldWrapper>
    </template>
  </UModal>
</template>

<script lang="ts">
import { toTitleCase } from "@sapphire/utilities";

export interface SelectOneValue {
  /** The name to render */
  name: string;
  /** The value to emit */
  value: string;
  /** Optional icon to be shown next to the key (i.e. for emojis) */
  icon?: string;
}

interface SelectOption {
  label: string;
  value: string;
  icon?: string;
}

export interface SelectOneProps {
  /** The label to show on the button */
  label: string;
  /** The name of the current value */
  name?: string;
  /** Array of values */
  values: SelectOneValue[];
  /** Optional description below the field */
  description?: string;
  /** Content to be shown as a tooltip when hovering over the button */
  tooltipTitle?: string;
  /** Whether to append an image to the end of the button, next to the value of the key */
  imageInName?: string;
  /** Disable the field */
  disabled?: boolean;
}

interface Emits {
  (e: "change", value: string): void;
  (e: "reset"): void;
}
</script>

<script setup lang="ts">
const { name = "None", disabled = false, label, values, description, tooltipTitle, imageInName } = defineProps<SelectOneProps>();

const emit = defineEmits<Emits>();

const selectedValue = ref<string | undefined>(resolveValueFromName(name));

const items = computed<SelectOption[]>(() =>
  values.map(value => ({
    label: value.name,
    value: value.value,
    icon: value.icon,
  })),
);

const formattedLabel = computed(() => toTitleCase(label));
const placeholder = computed(() => name || "None");
const fieldName = computed(() => label.trim().toLowerCase().replace(/\s+/g, "-"));

const selectedLabel = computed(() => {
  const current = items.value.find((item: SelectOption) => item.value === selectedValue.value);
  return current?.label;
});

watch(
  () => name,
  newName => {
    selectedValue.value = resolveValueFromName(newName);
  },
);

watch(
  selectedValue,
  newValue => {
    if (newValue)
      emit("change", newValue);
  },
);

function resolveValueFromName(name?: string) {
  if (!name)
    return undefined;

  const match = values.find((item: SelectOneValue) => item.name === name);
  return match?.value;
}

function handleReset() {
  selectedValue.value = undefined;
  emit("reset");
}

// Button label shown in the trigger, e.g. "Member Add Logs: None"
const buttonLabel = computed(() => `${formattedLabel.value}: ${selectedLabel.value ?? "None"}`);
</script>
