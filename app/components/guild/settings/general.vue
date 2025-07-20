<template>
  <SettingsSection title="General Settings">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Prefix Setting -->
      <div class="space-y-2">
        <ShadLabel for="prefix">{{ generalConfig.prefix.name }}</ShadLabel>
        <ShadInput
          id="prefix"
          v-model="formData.prefix"
          :placeholder="generalConfig.prefix.placeholder"
          :maxlength="generalConfig.prefix.maxLength"
          :color="errors.prefix ? 'error' : 'primary'"
          class="w-full"
        />
        <p class="text-sm text-base-content/70">{{ generalConfig.prefix.description }}</p>
        <p v-if="errors.prefix" class="text-sm text-error">{{ errors.prefix }}</p>
      </div>

      <!-- Language Setting -->
      <div class="space-y-2">
        <ShadLabel for="language">{{ generalConfig.language.name }}</ShadLabel>
        <ShadSelect
          id="language"
          v-model="formData.language"
          :color="errors.language ? 'error' : 'primary'"
          placeholder="Select language..."
          class="w-full"
        >
          <option value="">Select language...</option>
          <option v-for="option in languageOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </ShadSelect>
        <p class="text-sm text-base-content/70">{{ generalConfig.language.description }}</p>
        <p v-if="errors.language" class="text-sm text-error">{{ errors.language }}</p>
      </div>

      <!-- Disable Natural Prefix Setting -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div>
            <ShadLabel for="disableNaturalPrefix">{{ generalConfig.disableNaturalPrefix.name }}</ShadLabel>
            <p class="text-sm text-base-content/70">{{ generalConfig.disableNaturalPrefix.description }}</p>
          </div>
          <ShadCheckbox
            id="disableNaturalPrefix"
            v-model="formData.disableNaturalPrefix"
            color="primary"
          />
        </div>
      </div>
    </div>
  </SettingsSection>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useGuildGeneral } from '~~/app/composables/useGuildSettings'

interface Props {
  languages: string[]
}

const props = defineProps<Props>()

// Use the new general composable
const { generalConfig, settings, updateGeneralSetting } = useGuildGeneral()

// Form validation schema
const guildGeneralSchema = z.object({
  prefix: z.string()
    .min(1, 'Prefix must be at least 1 character')
    .max(generalConfig.prefix.maxLength, `Prefix cannot be longer than ${generalConfig.prefix.maxLength} characters`)
    .optional(),
  language: z.string().optional(),
  disableNaturalPrefix: z.boolean().optional(),
})

type FormData = z.infer<typeof guildGeneralSchema>

// Form data reactive state
const formData = ref<FormData>({
  prefix: settings.value.prefix ?? '',
  language: settings.value.language ?? '',
  disableNaturalPrefix: settings.value.disableNaturalPrefix ?? false,
})

// Form validation errors
const errors = ref<Record<string, string>>({})

// Watch for changes and update settings with validation
watch(
  formData,
  async (newValue) => {
    try {
      await guildGeneralSchema.parseAsync(newValue)
      errors.value = {}
      
      // Update settings using the composable
      Object.entries(newValue).forEach(([key, value]) => {
        if (value !== undefined) {
          updateGeneralSetting(key, value)
        }
      })
    }
    catch (err) {
      if (err instanceof z.ZodError) {
        // Map Zod errors to simple string errors
        const fieldErrors: Record<string, string> = {}
        Object.entries(err.formErrors.fieldErrors || {}).forEach(([key, messages]) => {
          if (messages && messages.length > 0 && messages[0]) {
            fieldErrors[key] = messages[0]
          }
        })
        errors.value = fieldErrors
      }
    }
  },
  { deep: true },
)

// Language mapping function
function mapLanguageKeysToNames(langKey: string): [string] | [string, string] {
  const supportedLanguagesMap: Record<string, [string] | [string, string]> = {
    'ckb-IR': ['Kurdiya Navîn (Iranran)', 'Kurdish'],
    'de-DE': ['Deutsch', 'German'],
    'en-GB': ['British English', 'English, United Kingdom'],
    'en-US': ['American English', 'English, United States'],
    'es-ES': ['Español', 'Spanish'],
    'fa-IR': ['فارسی', 'Persian'],
    'fr-FR': ['Français', 'French'],
    'hi-IN': ['हिंदी', 'Hindi'],
    'hi-Latn-IN': ['Hinglish', 'Hindi (Latin Alphabet)'],
    'it-IT': ['Italiano', 'Italian'],
    'ja-JP': ['日本語', 'Japanese'],
    'nb-NO': ['Bokmål', 'Norwegian Bokmal'],
    'nl-NL': ['Nederlands', 'Dutch'],
    'pt-BR': ['Português Brasileiro', 'Portuguese, Brazilian'],
    'ro-RO': ['Română', 'Romanian'],
    'ru-RU': ['Pусский', 'Russian'],
    'sl-SI': ['Slovenščina', 'Slovenian'],
    'tr-TR': ['Türkçe', 'Turkish'],
  }
  return supportedLanguagesMap[langKey] ?? [langKey]
}

// Computed language options
const languageOptions = computed(() =>
  props.languages.map(langKey => ({
    value: langKey,
    label: mapLanguageKeysToNames(langKey).join(' - '),
  })),
)
</script>
