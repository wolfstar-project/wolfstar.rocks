<template>
  <UDashboardPanel id="guild-settings">
    <template #header>
      <UDashboardNavbar title="Guild Settings" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              aria-label="Open notifications panel"
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" aria-hidden="true" />
              </UChip>
            </UButton>
          </UTooltip>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
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
              <UFormField :label="generalConfig.prefix.name" name="prefix">
                <UInput
                  id="prefix"
                  v-model="state.prefix"
                  :placeholder="generalConfig.prefix.placeholder"
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
                      {{ state.prefix?.length }}/{{ generalConfig.prefix.maxLength }}
                    </div>
                  </template>
                </UInput>
                <template #error="{ error }">
                  <p class="text-sm text-error">{{ error }}</p>
                </template>
                <template #description>
                  <p id="prefix-description" class="text-sm text-base-content/70">{{ generalConfig.prefix.description }}</p>
                </template>
              </UFormField>
            </div>

            <!-- Language Setting -->
            <div>
              <UFormField :label="generalConfig.language.name" name="language">
                <template #description>
                  <p id="language-description" class="text-sm text-base-content/70">{{ generalConfig.language.description }}</p>
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

            <!-- Disable Natural Prefix Setting -->
            <div>
              <div class="flex items-center justify-between">
                <UFormField :label="generalConfig.disableNaturalPrefix.name" name="disableNaturalPrefix">
                  <template #description>
                    <p id="disableNaturalPrefix-description" class="text-sm text-base-content/70">{{ generalConfig.disableNaturalPrefix.description }}</p>
                  </template>
                  <UCheckbox
                    id="disableNaturalPrefix"
                    v-model="state.disableNaturalPrefix"
                    color="primary"
                    aria-describedby="disableNaturalPrefix-description"
                    aria-label="Disable natural language prefix"
                  />
                </UFormField>
              </div>
            </div>
          </UForm>
        </div>
      </GuildSettingsSection>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import { Time } from "@sapphire/time-utilities";
import * as yup from "yup";

definePageMeta({
  layout: "dashboard",
});

const loading = useState("loading", () => false);

const { isNotificationsSlideoverOpen } = useDashboardLayout();

// Use composables and stores

const commands = useState<FlattenedCommand[]>("guildCommands", () => []);
const languages = useState<string[]>("guildLanguages", () => []);

const toast = useToast();
// Use the new general composable
const { generalConfig, settings, updateGeneralSetting } = useGuildGeneral();

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
    .trim()
    .max(generalConfig.prefix.maxLength, `Prefix cannot be longer than ${generalConfig.prefix.maxLength} characters`)
    .transform(v => (v === "" ? undefined : v))
    .optional(),
  language: yup.object({
    value: yup.string().optional(),
    label: yup.string().optional(),
  }).optional(),
  disableNaturalPrefix: yup.boolean().optional(),
});

type Schema = yup.InferType<typeof schema>;

// Form data reactive state
const state = reactive<NonNullable<Schema>>({
  // Use the guild's existing prefix if available, otherwise start empty.
  // The placeholder should remain a UI hint, not the submitted value.
  prefix: settings?.prefix ?? generalConfig.prefix.placeholder,
  language: {
    value: "",
    label: "",
  },
  disableNaturalPrefix: false,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (event.data.language?.value) {
    updateGeneralSetting("language", event.data.language.value);
  }

  if (event.data.prefix) {
    updateGeneralSetting("prefix", event.data.prefix);
  }

  if ("disableNaturalPrefix" in event.data) {
    updateGeneralSetting("disableNaturalPrefix", Boolean(event.data.disableNaturalPrefix ?? false));
  }

  toast.add({
    color: "success",
    icon: "heroicons:check",
    title: "Settings Updated",
    description: "Settings updated successfully",
  });
}

async function onError(event: FormErrorEvent) {
  const errorMessage = event.errors[0]?.message;
  toast.add({
    color: "error",
    title: "Error",
    description: `Failed to save general settings. Please try again later.\n${errorMessage ?? "Unknown error"}`,
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

async function fetchCommandsAndLanguages() {
  loading.value = true;

  const commandsStorage = useSessionStorage<ExpirableLocalStorageStructure<FlattenedCommand[]>>(LocalStorageKeys.Commands, {
    expire: 0,
    data: [],
  });
  if (commandsStorage.value && (import.meta.env.DEV || commandsStorage.value.expire > Date.now())) {
    commands.value = commandsStorage.value.data;
  }
  else {
    const { data: commandsData } = await useAPI<FlattenedCommand[]>("/commands");
    commands.value = commandsData.value!;
    commandsStorage.value = {
      expire: Date.now() + Time.Day * 6,
      data: commandsData.value!,
    };
  }

  const languagesStorage = useSessionStorage<ExpirableLocalStorageStructure<string[]>>(LocalStorageKeys.Languages, {
    expire: 0,
    data: [],
  });
  if (languagesStorage.value && (import.meta.env.DEV || languagesStorage.value.expire > Date.now())) {
    languages.value = languagesStorage.value.data;
  }
  else {
    const { data: languagesData } = await useAPI<string[]>("/languages");
    languages.value = languagesData.value!;
    languagesStorage.value = {
      expire: Date.now() + Time.Day * 6,
      data: languagesData.value!,
    };
  }

  loading.value = false;
}

onMounted(fetchCommandsAndLanguages);
</script>
