<template>
	<h2 class="setup-title" tabindex="-1">{{ ts("guild_settings.setup.language.title") }}</h2>
	<p class="setup-lead">{{ ts("guild_settings.setup.language.description") }}</p>

	<div class="setup-field">
		<label for="setup-language" class="mb-1.5 block text-sm font-medium">
			{{ ts("guild_settings.setup.language.label") }}
		</label>
		<USkeleton v-if="loading" class="h-12 w-full rounded-[8px]" />
		<SelectBase
			v-else
			id="setup-language"
			:model-value="draft.language"
			:options="options"
			:clearable="false"
			variant="field"
			class="w-full"
			aria-describedby="setup-language-help"
			@update:model-value="onChange"
		/>
		<p id="setup-language-help" class="mt-1.5 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.setup.language.help") }}
		</p>
	</div>
</template>

<script setup lang="ts">
import type { SetupDraft } from "~/utils/guild-setup";
import { guildLanguageOptions } from "~/utils/guild-languages";

const draft = defineModel<SetupDraft>("draft", { required: true });

const { ts } = useI18n();
const { data: languages, status } = useLanguages();

const loading = computed(() => status.value === "idle" || status.value === "pending");

// The language the server has now stays on the list even if the list does not carry it.
const options = computed(() =>
	guildLanguageOptions(
		languages.value.includes(draft.value.language)
			? languages.value
			: [draft.value.language, ...languages.value],
	),
);

function onChange(value: string | string[] | null) {
	if (typeof value === "string") draft.value = { ...draft.value, language: value };
}
</script>
