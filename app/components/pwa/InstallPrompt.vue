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
				class="text-[5.5rem] text-muted opacity-10 sm:text-[7.5rem]"
			/>
		</div>

		<template #actions>
			<UFieldGroup size="sm" class="mt-2">
				<UButton @click="$pwa?.install()"> Install </UButton>
				<UButton color="error" variant="ghost" @click="$pwa?.cancelInstall()">
					Dismiss
				</UButton>
			</UFieldGroup>
		</template>
	</UAlert>
</template>
