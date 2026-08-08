<template>
	<StarAlert
		v-if="$pwa?.showInstallPrompt && !$pwa?.needRefresh"
		color="primary"
		variant="soft"
		:title="t('pwa.install_app')"
		class="m-2 pr-28 sm:pr-36 relative overflow-hidden"
		v-bind="$attrs"
	>
		<!-- Decorative background icon (presentational) -->
		<div
			class="inset-y-0 right-4 sm:flex pointer-events-none absolute hidden items-center select-none"
			aria-hidden="true"
			role="presentation"
		>
			<StarIcon
				name="material-symbols-install-desktop-rounded"
				class="text-muted sm:text-[7.5rem] text-[5.5rem] opacity-10"
			/>
		</div>

		<template #actions>
			<div class="mt-2 gap-2 flex">
				<StarButton size="sm" @click="$pwa?.install()">{{ t("pwa.install") }}</StarButton>
				<StarButton size="sm" color="error" variant="ghost" @click="$pwa?.cancelInstall()">
					{{ t("pwa.dismiss") }}
				</StarButton>
			</div>
		</template>
	</StarAlert>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
