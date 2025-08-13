<template>
  <div class="join">
    <ShadButton :color="error ? 'error' : undefined" :title="tooltipTitle" @click="openDialog"> {{ label }}: {{ displayValue }} </ShadButton>

    <ShadModal v-model:open="isOpen" :title="label" @update:open="(value: boolean) => !value && closeDialog()">
      <template #body>
        <ShadForm :validation-schema="validationSchema" @submit="handleSubmit">
          <ShadFormField :name="name" :description="helperText">
            <template #label>{{ label }}</template>

            <ShadSelect v-model="selectedValue">
              <ShadSelectTrigger>
                <ShadSelectValue :placeholder="placeholder || `Select ${label}`" />
              </ShadSelectTrigger>
              <ShadSelectContent>
                <ShadSelectItem v-for="option in options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </ShadSelectItem>
              </ShadSelectContent>
            </ShadSelect>
          </ShadFormField>

          <div class="mt-4 flex justify-end gap-2">
            <ShadButton variant="outline" @click="closeDialog">Cancel</ShadButton>
            <ShadButton type="submit">Confirm</ShadButton>
          </div>
        </ShadForm>
      </template>
    </ShadModal>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

interface Option<T = string | number> {
  label: string;
  value: T;
}

interface Props<T = string | number> {
  label: string;
  options: Option<T>[];
  value?: T | null;
  error?: boolean;
  helperText?: string;
  name?: string;
  tooltipTitle?: string;
  required?: boolean;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  error: false,
  name: () => `select-${Math.random().toString(36).slice(2)}`,
  helperText: undefined,
  tooltipTitle: undefined,
  required: true,
  placeholder: undefined,
});

const emit = defineEmits<{
  (e: "update:value" | "change", value: Props["value"] | null): void;
}>();

const isOpen = ref(false);

const selectedValue = ref<any>(props.value);

const validationSchema = computed(() =>
  toTypedSchema(
    z.object({
      [props.name]: props.required ? z.string().min(1, "This field is required") : z.string().optional(),
    }),
  ),
);

const displayValue = computed(() => {
  const option = props.options.find(opt => opt.value === selectedValue.value);
  return option?.label ?? (props.placeholder || "Select...");
});

function openDialog() {
  isOpen.value = true;
}

function closeDialog() {
  isOpen.value = false;
}

function handleSubmit() {
  emit("update:value", selectedValue.value);
  emit("change", selectedValue.value);
  closeDialog();
}

watch(
  () => props.value,
  (newValue) => {
    selectedValue.value = newValue;
  },
);
</script>

<style>
@reference "@/assets/css/main.css";
.modal-backdrop {
	@apply bg-black/50;
}
</style>
