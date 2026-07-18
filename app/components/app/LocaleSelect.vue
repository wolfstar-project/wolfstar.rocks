<template>
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
</template>

<script setup lang="ts">
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
		if (!code || !locales.value.some((entry) => entry.code === code)) return;
		setPreferredLocale(code);
		void setLocale(code);
	},
});
</script>
