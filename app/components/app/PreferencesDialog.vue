<template>
	<UModal
		v-model:open="isOpen"
		:title="ts('profile.settings_title')"
		:description="ts('profile.settings_tagline')"
		:ui="{ content: 'sm:max-w-2xl' }"
	>
		<template #body>
			<AppPreferences />
		</template>
	</UModal>
</template>

<script setup lang="ts">
const { ts } = useI18n();
const { isOpen } = usePreferencesDialog();
</script>
