<template>
	<!-- Not modal: the dashboard beside it shows the theme, and stays usable. -->
	<USlideover
		:open="isOpen"
		side="right"
		:modal="false"
		:overlay="false"
		:dismissible="false"
		:title="ts('profile.themes.customize')"
		:description="ts('profile.themes.panel_description')"
		:content="{ onEscapeKeyDown: discard }"
		:ui="{
			content:
				'custom-theme-panel max-w-full bg-(--ink-700) theme-light:bg-base-100 sm:max-w-80',
			header: 'px-4 pt-4 pb-2 sm:px-4',
			wrapper: 'min-w-0 flex-1',
			title: 'text-[0.9375rem] font-bold',
			description: 'sr-only',
			body: 'px-4 py-2 sm:px-4',
			footer: 'custom-theme-panel-footer px-4 py-3',
		}"
		@update:open="(open) => open || discard()"
	>
		<template #close>
			<UButton
				color="neutral"
				variant="ghost"
				size="sm"
				icon="ic:round-close"
				:aria-label="ts('profile.themes.discard')"
			/>
		</template>

		<template #body>
			<AppCustomThemeEditor />
		</template>

		<template #footer>
			<UButton color="neutral" variant="soft" class="flex-1 justify-center" @click="back">
				{{ ts("profile.themes.back") }}
			</UButton>
			<UButton color="primary" class="flex-1 justify-center" @click="apply">
				{{ ts("profile.themes.apply") }}
			</UButton>
		</template>
	</USlideover>
</template>

<script setup lang="ts">
const { ts } = useI18n();
const { apply, back, discard, isOpen } = useCustomThemePanel();

// The preview is in the saved settings: a reload would keep it, with no panel to undo it.
useEventListener("pagehide", () => discard());
</script>

<style>
@reference "@/assets/css/main.css";

/* Solid, as Discord's: the theme paints the page beside it, not the panel. */
.custom-theme-panel {
	border-left: 1px solid var(--home-border-subtle);
}

.custom-theme-panel-footer {
	@apply flex gap-2;
	border-top: 1px solid var(--home-border-subtle);
}
</style>
