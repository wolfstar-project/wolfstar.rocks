<template>
  <GuildSettingsSection title="General Settings">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Prefix Setting -->
      <UForm ref="form" :schema="schema" :state="state" class="space-y-4" :on-error="onError" @submit="onSubmit">
        <div>
          <UFormField :label="generalConfig.prefix.name" name="prefix">
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
          <UFormField :label="generalConfig.language.name" name="language">
            <template #description>
              <p class="text-sm text-base-content/70">{{ generalConfig.language.description }}</p>
            </template>
            <UInputMenu
              id="language"
              v-model="state.language"
              color="primary"
              placeholder="Select language..."
              class="w-full"
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
            <UFormField :label="generalConfig.disableNaturalPrefix.name" name="disableNaturalPrefix">
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
  </GuildSettingsSection>
</template>

<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import * as yup from "yup";

definePageMeta({
  layout: "dashboard",
});

const loading = useState("loading", () => false);
// Use composables and stores

const { fetchLanguages, languages } = useLanguages();
const { fetchCommands } = useCommands();

const _form = useTemplateRef("form");
const toast = useToast();
// Use the new general composable
const { generalConfig, settings: _settings, updateGeneralSetting } = useGuildGeneral();

// Computed language options
const items = computed(() =>
  languages.value.map(langKey => ({
    value: langKey,
    label: mapLanguageKeysToNames(langKey).join(" - "),
  })),
);

// Form validation schema
const schema = yup.object({
  prefix: yup.string()
    .min(1, "Prefix must be at least 1 character")
    .max(generalConfig.prefix.maxLength, `Prefix cannot be longer than ${generalConfig.prefix.maxLength} characters`)
    .optional(),
  language: yup.object({
    value: yup.string().optional(),
    label: yup.string().optional(),
  }).optional(),
  disableNaturalPrefix: yup.boolean().optional(),
});

type Schema = yup.InferType<typeof schema>;

// Form data reactive state
const state = reactive<Schema>({
  prefix: generalConfig.prefix.placeholder,
  language: {
    value: "",
    label: "",
  },
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
  console.log(payload.children);

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

onMounted(async () => {
  loading.value = true;
  await fetchLanguages();

  await fetchCommands();

  loading.value = false;
});
</script>
