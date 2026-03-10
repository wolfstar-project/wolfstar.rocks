<template>
	<UAlert
		v-if="$pwa?.showInstallPrompt && !$pwa?.needRefresh"
		color="primary"
		variant="soft"
		title="Install App"
		class="relative m-2 overflow-hidden pr-28 sm:pr-36"
		v-bind="$attrs"
	>
		<!-- Decorative background icon (presentational) -->
		<div
			class="pointer-events-none absolute inset-y-0 right-4 hidden items-center select-none sm:flex"
			aria-hidden="true"
			role="presentation"
		>
			<UIcon
				name="material-symbols-install-desktop-rounded"
				class="text-[5.5rem] text-slate-700 opacity-10 sm:text-[7.5rem] dark:text-slate-400 dark:opacity-8"
			/>
		</div>

		<template #actions>
			<div class="mt-2 flex gap-2">
				<UButton size="sm" @click="$pwa?.install()"> Install </UButton>
				<UButton size="sm" color="error" variant="ghost" @click="$pwa?.cancelInstall()">
					Dismiss
				</UButton>
			</div>
		</template>
	</UAlert>
</template>
