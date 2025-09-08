<template>
  <SettingsSection title="General Settings">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Prefix Setting -->
      <UForm ref="form" :schema="schema" :state="state" class="space-y-4" :on-error="onError" @submit="onSubmit">
        <div>
          <UFormField>
            <template #label>
              <ShadLabel for="prefix">{{ generalConfig.prefix.name }}</ShadLabel>
            </template>

            <UInput
              id="prefix"
              v-model="state.prefix"
              :placeholder="generalConfig.prefix.placeholder"
              :maxlength="generalConfig.prefix.maxLength"
              color="primary"
              class="w-full"
            >
              <template #trailing>
                <div
                  id="character-count"
                  class="text-xs text-muted tabular-nums"
                  aria-live="polite"
                  role="status"
                >
                  {{ state.prefix?.length }}/{{ generalConfig.prefix.maxLength }}
                </div>
              </template>
            </UInput>
            <template #error="{ error }">
              <p class="text-sm text-error">{{ error }}</p>
            </template>
            <template #description>
              <p class="text-sm text-base-content/70">{{ generalConfig.prefix.description }}</p>
            </template>
          </UFormField>
        </div>

        <!-- Language Setting -->
        <div>
          <UFormField>
            <template #label>
              <ShadLabel for="language">{{ generalConfig.language.name }}</ShadLabel>
            </template>
            <template #description>
              <p class="text-sm text-base-content/70">{{ generalConfig.language.description }}</p>
            </template>
            <UInputMenu
              id="language"
              color="primary"
              placeholder="Select language..."
              class="w-full"
              v-model="state.language"
              :items="items"
            />
            <template #error="{ error }">
              <p class="text-sm text-error">{{ error }}</p>
            </template>
          </UFormField>
        </div>

        <!-- Disable Natural Prefix Setting -->
        <div>
          <div class="flex items-center justify-between">
            <UFormField>
              <template #label>
                <ShadLabel for="disableNaturalPrefix">{{ generalConfig.disableNaturalPrefix.name }}</ShadLabel>
              </template>
              <template #description>
                <p class="text-sm text-base-content/70">{{ generalConfig.disableNaturalPrefix.description }}</p>
              </template>
              <UCheckbox
                id="disableNaturalPrefix"
                v-model="state.disableNaturalPrefix"
                color="primary"
              />
            </UFormField>
          </div>
        </div>
      </UForm>
    </div>
  </SettingsSection>
</template>

<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from "~/types/form";
import * as yup from "yup";
import { useGuildGeneral } from "~~/app/composables/useGuildSettings";

const _form = useTemplateRef("form");
const toast = useToast();
// Use the new general composable
const { generalConfig, settings: _settings, updateGeneralSetting } = useGuildGeneral();

// Computed language options
const items = computed(() =>
  useLanguages().languages.value.map(langKey => ({
    value: langKey,
    label: mapLanguageKeysToNames(langKey).join(" - "),
  })),
);

// Form validation schema
const schema = yup.object({
  prefix: yup.string()
    .min(1, "Prefix must be at least 1 character")
    .max(generalConfig.prefix.maxLength, `Prefix cannot be longer than ${generalConfig.prefix.maxLength} characters`)
    .optional()
    .default(generalConfig.prefix.placeholder),
  language: yup.string().optional(),
  disableNaturalPrefix: yup.boolean().optional().default(false),
});

type Schema = yup.InferType<typeof schema>;

// Form data reactive state
const state = reactive<Partial<Schema>>({
  prefix: "",
  language: "",
  disableNaturalPrefix: false,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (event.data.language) {
    updateGeneralSetting("language", event.data.language);
  }

  if (event.data.prefix) {
    updateGeneralSetting("prefix", event.data.prefix);
  }

  if (event.data.disableNaturalPrefix) {
    updateGeneralSetting("disableNaturalPrefix", event.data.disableNaturalPrefix);
  }

  toast.add({
    color: "success",
    icon: "heroicons:check",
    title: "Settings Updated",
    description: "Settings updated successfully",
  });
  console.log(event.data);
}

async function onError(payload: FormErrorEvent) {
  console.log(payload);

  toast.add({
    color: "error",
    icon: "heroicons:exclamation-triangle",
    title: "Error",
  });
}
// Language mapping function
function mapLanguageKeysToNames(langKey: string): [string] | [string, string] {
  const supportedLanguagesMap: Record<string, [string] | [string, string]> = {
    "ckb-IR": ["Kurdiya Navîn (Iranran)", "Kurdish"],
    "de-DE": ["Deutsch", "German"],
    "en-GB": ["British English", "English, United Kingdom"],
    "en-US": ["American English", "English, United States"],
    "es-ES": ["Español", "Spanish"],
    "fa-IR": ["فارسی", "Persian"],
    "fr-FR": ["Français", "French"],
    "hi-IN": ["हिंदी", "Hindi"],
    "hi-Latn-IN": ["Hinglish", "Hindi (Latin Alphabet)"],
    "it-IT": ["Italiano", "Italian"],
    "ja-JP": ["日本語", "Japanese"],
    "nb-NO": ["Bokmål", "Norwegian Bokmal"],
    "nl-NL": ["Nederlands", "Dutch"],
    "pt-BR": ["Português Brasileiro", "Portuguese, Brazilian"],
    "ro-RO": ["Română", "Romanian"],
    "ru-RU": ["Pусский", "Russian"],
    "sl-SI": ["Slovenščina", "Slovenian"],
    "tr-TR": ["Türkçe", "Turkish"],
  };
  return supportedLanguagesMap[langKey] ?? [langKey];
};
</script>
