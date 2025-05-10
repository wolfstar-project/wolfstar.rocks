<template>
    <layout-settings-section title="General Settings">
        <form-auto-save :model-value="formData" :schema="validationSchema" @submit="onSubmit">
            <div class="form-control w-full">
                <label class="label">
                    <span class="label-text">Prefix</span>
                    <span class="label-text-alt">This is your server's prefix, use it to trigger WolfStar commands.</span>
                </label>
                <input v-model="formData.prefix" type="text" class="input-bordered input w-full" :class="{ 'input-error': errors.prefix }" />
                <label v-if="errors.prefix" class="label">
                    <span class="label-text-alt text-error">{{ errors.prefix }}</span>
                </label>
            </div>

            <div class="form-control w-full">
                <label class="label">
                    <span class="label-text">Language</span>
                    <span class="label-text-alt">Select the language you want for this guild</span>
                </label>
                <select v-model="formData.language" class="select-bordered select w-full" :class="{ 'select-error': errors.language }">
                    <option v-for="option in languageOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
                <label v-if="errors.language" class="label">
                    <span class="label-text-alt text-error">{{ errors.language }}</span>
                </label>
            </div>
        </form-auto-save>
    </layout-settings-section>
</template>

<script setup lang="ts">
import { z } from 'zod';

const props = defineProps<{
    languages: string[];
}>();

const guildSettingsSchema = z.object({
    prefix: z.string().min(1, 'Prefix must be at least 1 character').max(11, 'Prefix cannot be longer than 11 characters').optional(),
    language: z.string().optional(),
});

type FormData = z.infer<typeof guildSettingsSchema>;

const { settings, changes } = useGuildSettings();

const formData = ref<FormData>({
    prefix: settings.value.prefix ?? undefined,
    language: settings.value.language ?? undefined,
});

const validationSchema = guildSettingsSchema;

const errors = ref<{
    [x: string]: string[] | undefined;
    [x: number]: string[] | undefined;
    [x: symbol]: string[] | undefined;
}>({});

watch(
    formData,
    async (newValue) => {
        try {
            await validationSchema.parseAsync(newValue);
            errors.value = {};
        }
        catch (err) {
            if (err instanceof z.ZodError) {
                errors.value = err.formErrors.fieldErrors;
            }
        }
    },
    { deep: true },
);

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
    };
    return supportedLanguagesMap[langKey] ?? [langKey];
}

const languageOptions = computed(() =>
    props.languages.map(langKey => ({
        value: langKey,
        label: mapLanguageKeysToNames(langKey).join(' - '),
    })),
);

function onSubmit(data: FormData) {
    changes({
        prefix: data.prefix,
        language: data.language,
    });
}
</script>
