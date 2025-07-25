<template>
  <ShadForm :validation-schema="validationSchema" :validate-on="['change', 'blur']">
    <ShadFormField :name="name" :label="label" :required="required" :hint="tooltip">
      <ShadSelect v-model="selectedValues" multiple>
        <ShadSelectTrigger :aria-label="`Select ${label}`">
          <ShadSelectValue>
            <span class="flex items-center gap-2">
              {{ displayValue }}
              <ShadIcon v-if="icon" :name="icon" class="size-6" />
            </span>
          </ShadSelectValue>
        </ShadSelectTrigger>

        <ShadSelectContent>
          <ShadSelectGroup>
            <ShadSelectLabel>{{ label }}</ShadSelectLabel>

            <!-- Search input -->
            <div v-if="searchable && options.length > 10" class="p-2">
              <input v-model="search" type="text" :placeholder="`Search ${label.toLowerCase()}...`" class="input input-sm w-full" />
            </div>

            <!-- Options -->
            <div class="max-h-64 overflow-y-auto">
              <ShadSelectItem v-for="option in filteredOptions" :key="option.value" :value="option.value" class="flex items-center gap-2">
                <ShadCheckbox :label="option.label" @change="toggleSelection(option.value)" />
                <img v-if="option.iconUrl" :src="option.iconUrl" :alt="option.label" class="size-6" />
                {{ option.label }}
              </ShadSelectItem>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 border-t p-2">
              <ShadButton type="button" variant="ghost" size="sm" @click="clearSelection">Clear</ShadButton>
              <ShadButton type="submit" size="sm" @click="handleSubmit">Confirm</ShadButton>
            </div>
          </ShadSelectGroup>
        </ShadSelectContent>
      </ShadSelect>
    </ShadFormField>
  </ShadForm>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useId } from "reka-ui";
import { useField } from "vee-validate";
import * as z from "zod";

interface Option<T = string> {
  label: string;
  value: T;
  [keY: string]: T | string | null;
}

interface Props<T = string> {
  label: string;
  options: Option<T>[];
  value: T[] | null;
  name?: string;
  tooltip?: string;
  required?: boolean;
  placeholder?: string;
  searchable?: boolean;
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  name: () => useId(Math.random().toString(36).slice(2), "multi-select"),
  tooltipTitle: undefined,
  required: true,
  helperText: undefined,
  tooltip: undefined,
  searchable: true,
  placeholder: "Select an option",
  icon: undefined,
});

const emit = defineEmits<{
  (e: "update:value", value: Props["value"] | null): void;
}>();

const isOpen = ref(false);
const search = ref("");
const validationSchema = toTypedSchema(props.required ? z.array(z.string()).min(1, "At least one item must be selected") : z.array(z.string()));

const { value: fieldValue } = useField<string[]>(props.name, validationSchema);

const selectedValues = computed({
  get: () => fieldValue.value ?? (props.value ? [...props.value] : []),
  set: (newValue) => {
    fieldValue.value = newValue;
  },
});

const filteredOptions = computed(() => {
  if (!search.value)
    return props.options;
  const searchLower = search.value.toLowerCase();
  return props.options.filter(item => item.label.toLowerCase().includes(searchLower));
});

const displayValue = computed(() => {
  if (!selectedValues.value.length)
    return props.placeholder || "Select...";
  return `${selectedValues.value.length} selected`;
});

function closeDialog() {
  isOpen.value = false;
  search.value = "";
}

function toggleSelection(value: string) {
  const currentValues = selectedValues.value ?? [];
  const index = currentValues.indexOf(value);

  if (index === -1) {
    selectedValues.value = [...currentValues, value];
  }
  else {
    currentValues.splice(index, 1);
    selectedValues.value = currentValues;
  }
}

function clearSelection() {
  selectedValues.value = [];
}

function handleSubmit() {
  emit("update:value", selectedValues.value);
  closeDialog();
}

watch(
  () => props.value,
  (newValue) => {
    selectedValues.value = newValue ? [...newValue] : [];
  },
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
