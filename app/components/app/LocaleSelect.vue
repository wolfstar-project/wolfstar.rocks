<template>
	<!-- ClientOnly avoids Reka portal IDs that fail html-validator on prerender. -->
	<ClientOnly>
		<USelect
			v-model="currentLocale"
			:items="localeItems"
			value-key="value"
			:aria-label="t('common.language')"
			size="sm"
			color="neutral"
			variant="ghost"
			class="min-w-28"
		/>
		<template #fallback>
			<div class="h-8 min-w-28" aria-hidden="true" />
		</template>
	</ClientOnly>
</template>

<script setup lang="ts">
import { isAppLocaleCode } from "~/utils/is-app-locale";

const { locale, locales, setLocale, t } = useI18n();
const { setPreferredLocale } = usePreferredLocale();

const localeItems = computed(() =>
	locales.value.map((entry) => ({
		label: entry.name ?? entry.code,
		value: entry.code,
	})),
);

const currentLocale = computed({
	get: () => locale.value,
	set: (code: string) => {
		if (!isAppLocaleCode(code)) return;
		setPreferredLocale(code);
		void setLocale(code);
	},
});
</script>
