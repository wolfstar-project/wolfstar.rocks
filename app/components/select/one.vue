<template>
  <div class="relative">
    <ShadButton :color="error ? 'error' : 'outline'" :title="tooltipTitle" :aria-label="label" :aria-expanded="isOpen" block @click="openDialog">
      <span class="flex items-center">
        {{ label }}: {{ displayValue }}
        <img v-if="imageInName" :src="imageInName" :alt="label" class="ml-2 h-8 w-8" />
      </span>
    </ShadButton>

    <ShadModal v-model:open="isOpen" :title="label" :dismissible="true" @after:leave="onModalClose">
      <template #content>
        <ShadForm :validation-schema="validationSchema" @submit="handleSubmit">
          <div class="space-y-4">
            <ShadInput
              v-if="searchable && options.length > 10"
              v-model="search"
              name="search"
              type="search"
              placeholder="Search..."
              :color="error ? 'error' : 'primary'"
            />

            <div class="max-h-64 overflow-y-auto" role="listbox" :aria-label="label">
              <ul>
                <li
                  v-for="item in filteredOptions"
                  :key="item.value"
                  class="flex cursor-pointer items-center p-2 hover:bg-base-200"
                  :class="{ 'bg-primary/10': selectedValue === item.value }"
                  role="option"
                  :aria-selected="selectedValue === item.value"
                  @click="selectItem(item.value)"
                >
                  <span>{{ item.label }}</span>
                  <img v-if="item.iconUrl" :src="item.iconUrl" :alt="`${item.label} icon`" class="ml-2 h-8 w-8" />
                </li>
              </ul>
            </div>

            <div class="flex justify-end gap-2">
              <ShadButton v-if="!required" type="button" variant="ghost" @click="handleReset"> Clear </ShadButton>
              <ShadButton type="submit" color="primary"> Confirm </ShadButton>
            </div>
          </div>
        </ShadForm>
      </template>
    </ShadModal>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

interface Option<T = string> {
  label: string;
  value: T;
  iconUrl?: string;
}

interface Props<T = string> {
  label: string;
  options: Option<T>[];
  value?: T;
  error?: boolean;
  helperText?: string;
  name?: string;
  tooltipTitle?: string;
  required?: boolean;
  placeholder?: string;
  searchable?: boolean;
  imageInName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  error: false,
  name: () => `one-select-${Math.random().toString(36).slice(2)}`,
  tooltipTitle: undefined,
  required: true,
  placeholder: undefined,
  helperText: undefined,
  searchable: true,
  imageInName: undefined,
});

const emit = defineEmits<{
  "update:value": [value: Props["value"]];
  "change": [value: Props["value"]];
  "reset": [];
}>();

const isOpen = ref(false);
const search = ref("");
const selectedValue = ref<Props["value"]>(props.value);

const validationSchema = computed(() =>
  toTypedSchema(
    z.object({
      [props.name]: props.required ? z.any().refine(val => val !== undefined, "This field is required") : z.any().optional(),
      search: z.string().optional(),
    }),
  ),
);

const filteredOptions = computed(() => {
  if (!search.value)
    return props.options;
  const searchLower = search.value.toLowerCase();
  return props.options.filter(item => item.label.toLowerCase().includes(searchLower));
});

const displayValue = computed(() => {
  const option = props.options.find(opt => opt.value === selectedValue.value);
  return option?.label ?? props.placeholder ?? "Select...";
});

function openDialog() {
  isOpen.value = true;
  search.value = "";
}

function closeDialog() {
  isOpen.value = false;
}

function onModalClose() {
  search.value = "";
}

function selectItem(value: Props["value"]) {
  selectedValue.value = value;
}

function handleSubmit() {
  if (selectedValue.value !== undefined) {
    emit("update:value", selectedValue.value);
    emit("change", selectedValue.value);
    closeDialog();
  }
}

function handleReset() {
  selectedValue.value = undefined;
  emit("reset");
  closeDialog();
}

watch(
  () => props.value,
  (newValue) => {
    selectedValue.value = newValue;
  },
);

// Cleanup on unmount
onUnmounted(() => {
  if (isOpen.value) {
    closeDialog();
  }
});
</script>
