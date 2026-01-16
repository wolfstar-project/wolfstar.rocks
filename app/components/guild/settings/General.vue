<template>
  <GuildSettingsSection title="General Settings">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GuildSettingsForm
        :schema="schema"
        :state="state"
        :map-to-guild-data="mapToGuildData"
        class="space-y-4"
        aria-label="General guild settings form"
        @error="onError"
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
            <USelectMenu
              id="language"
              v-model="state.language"
              color="primary"
              placeholder="Select language..."
              class="w-full"
              :items="items"
              value-attribute="value"
              aria-label="Select bot language"
              aria-describedby="language-description"
            />
            <template #error="{ error }">
              <p class="text-sm text-error">{{ error }}</p>
            </template>
          </UFormField>
        </div>
      </GuildSettingsForm>
    </div>
  </GuildSettingsSection>
</template>

<script lang="ts" setup>
import type { FormErrorEvent } from "@nuxt/ui";
import type { GuildData } from "~~/server/database";
import * as yup from "yup";

const { languages } = defineProps<{
  languages: string[];
}>();

const { guildSettings } = useGuildSettings();
const toast = useToast();

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
}

// Computed language options
const items = computed(() =>
  languages.map(langKey => {
    const [lang, label] = mapLanguageKeysToNames(langKey);
    return label
      ? {
          value: lang,
          label,
        }
      : {
          value: lang,
          label: `This Language ${lang} is not supported`,
          disabled: true,
        };
  }),
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
  language: yup.object()
    .shape({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .optional()
    .default({
      value: guildSettings.value.language,
      label: mapLanguageKeysToNames(guildSettings.value.language)[1] ?? "Unknown Language",
    }),
});

type Schema = yup.InferType<typeof schema>;

// Form data reactive state
const state = reactive<Schema>(schema.getDefault());

// Original values for change detection

// Watch for guild settings to populate state
/* watch(guildSettings, (settings) => {
  if (settings) {
    state.prefix = settings.prefix;
    state.language = {
      value: settings.language,
      label: mapLanguageKeysToNames(settings.language)[1] ?? "Unknown Language",
    };
  }
}, { immediate: true }); */

// Map form state to GuildData format
function mapToGuildData(formState: Schema): Partial<GuildData> {
  const changes: Partial<GuildData> = {};

  if (formState.prefix) {
    changes.prefix = formState.prefix;
  }

  if (formState.language) {
    changes.language = formState.language.value;
  }

  return changes;
}

async function onError(event: FormErrorEvent) {
  const element = event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
  const errorMessage = event.errors[0]?.message;
  toast.add({
    color: "error",
    title: "Error",
    description: `Failed to update general settings. ${errorMessage ?? "Unknown error"}`,
    icon: "heroicons:circle",
  });
}
</script>
