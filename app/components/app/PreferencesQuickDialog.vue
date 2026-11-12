<template>
	<UModal
		v-model:open="isOpen"
		:title="ts('profile.settings_title')"
		:description="ts('profile.settings_tagline')"
		:ui="{ content: 'sm:max-w-2xl' }"
	>
		<template #body>
			<div class="quick-preferences">
				<AppPreferences only="appearance" quick />
				<AppPreferences only="language" quick />
				<AppPreferences only="accessibility" quick />
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
const { ts } = useI18n();
const { isOpen: dialogOpen, variant } = usePreferencesDialog();

// The dashboard's two-pane dialog shares the open state; this one only shows
// for its own variant.
const isOpen = computed({
	get: () => dialogOpen.value && variant.value === "quick",
	set: (value: boolean) => {
		dialogOpen.value = value;
	},
});
</script>

<style scoped>
.quick-preferences {
	display: flex;
	flex-direction: column;
	gap: 1.75rem;
}

/* A hairline between the groups, as the dashboard's dialog draws between pages. */
.quick-preferences > * + * {
	padding-top: 1.75rem;
	border-top: 1px solid var(--home-border-subtle);
}
</style>
