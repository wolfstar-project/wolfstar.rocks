<template>
  <GuildSettingsSection title="General Settings">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Prefix Setting -->
      <UForm
        ref="form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        aria-label="General guild settings form"
        @error="onError"
        @submit="onSubmit"
      >
        <div>
          <UFormField label="Prefix" name="prefix">
            <UInput
              id="prefix"
              v-model="state.prefix"
              placeholder="Enter prefix"
              color="primary"
              class="w-full"
              aria-describedby="prefix-description character-count"
              aria-label="Bot command prefix"
            >
              <template #trailing>
                <div
                  id="character-count"
                  class="text-xs text-muted tabular-nums"
                  aria-live="polite"
                  role="status"
                >
                  {{ state.prefix?.length }}/10
                </div>
              </template>
            </UInput>
            <template #error="{ error }">
              <p class="text-sm text-error">{{ error }}</p>
            </template>
            <template #description>
              <p id="prefix-description" class="text-sm text-base-content/70">This is your server's prefix, use it to trigger WolfStar commands.</p>
            </template>
          </UFormField>
        </div>

        <!-- Language Setting -->
        <div>
          <UFormField label="Language" name="language">
            <template #description>
              <p id="language-description" class="text-sm text-base-content/70">Select the language you want for this guild</p>
            </template>
            <UInputMenu
              id="language"
              v-model="state.language as { value: string; label: string }"
              color="primary"
              placeholder="Select language..."
              class="w-full"
              :items="items"
              aria-label="Select bot language"
              aria-describedby="language-description"
            />
            <template #error="{ error }">
              <p class="text-sm text-error">{{ error }}</p>
            </template>
          </UFormField>
        </div>
      </UForm>
    </div>
  </GuildSettingsSection>
</template>

<script lang="ts" setup>
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import * as yup from "yup";
import { useGuildSettings } from "~/composables/useGuildSettings";
import { useGuildSettingsChanges } from "~/composables/useGuildSettingsChanges";

const { languages } = defineProps<{
  languages: string[];
}>();
const { setGuildSettingsChanges } = useGuildSettingsChanges();
const { guildSettings } = useGuildSettings();

const toast = useToast();
// Use the new general composable

// Computed language options
const items = computed(() =>
  languages.map(langKey => ({
    value: langKey,
    label: mapLanguageKeysToNames(langKey).join(" - "),
  })),
);

// Form validation schema
const schema = yup.object({
  prefix: yup.string()
    .trim()
    .min(1, "Prefix must be at least 1 character")
    .max(11, "Prefix cannot be longer than 10 characters")
    .transform(v => (v === "" ? undefined : v))
    .optional()
    .default(guildSettings.value.prefix),
  language: yup.object({
    value: yup.string().optional(),
    label: yup.string().optional(),
  }).optional(),
});

type Schema = yup.InferType<typeof schema>;

// Form data reactive state
const state = reactive<NonNullable<Schema>>(schema.getDefault());

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (event.data.prefix) {
    setGuildSettingsChanges({
      prefix: event.data.prefix,
    });
  }
  if (event.data.language) {
    setGuildSettingsChanges({
      language: event.data.language?.value,
    });
  }

  toast.add({
    color: "info",
    icon: "i-heroicons-information-circle",
    title: "Changes Staged",
    description: "Click 'Save Changes' to apply your changes",
  });
}

async function onError(event: FormErrorEvent) {
  const errorMessage = event.errors[0]?.message;
  toast.add({
    color: "error",
    title: "Error",
    description: `Failed to update general settings. ${errorMessage ?? "Unknown error"}`,
    icon: "i-heroicons-x-circle",
  });
}

// Language mapping function
function mapLanguageKeysToNames(langKey: string): [string] | [string, string] {
  const supportedLanguagesMap: Record<string, [string] | [string, string]> = {
    "ckb-IR": ["Kurdîya Navîn (Iran)", "Kurdish"],
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
    "nb-NO": ["Bokmål", "Norwegian Bokmål"],
    "nl-NL": ["Nederlands", "Dutch"],
    "pt-BR": ["Português Brasileiro", "Portuguese, Brazilian"],
    "ro-RO": ["Română", "Romanian"],
    "ru-RU": ["Русский", "Russian"],
    "sl-SI": ["Slovenščina", "Slovenian"],
    "tr-TR": ["Türkçe", "Turkish"],
  };
  return supportedLanguagesMap[langKey] ?? [langKey];
};
</script>
