<template>
	<Transition
		enter-active-class="transition duration-300 ease-out"
		enter-from-class="opacity-0 translate-y-2"
		enter-to-class="opacity-100 translate-y-0"
		leave-active-class="transition duration-200 ease-in"
		leave-from-class="opacity-100 translate-y-0"
		leave-to-class="opacity-0 translate-y-2"
	>
		<div v-if="$pwa?.needRefresh">
			<div
				class="flex items-center gap-3 rounded-full bg-muted px-4 py-3 shadow-lg ring-1 ring-default"
			>
				<span class="text-lg">✨</span>
				<div class="text-sm font-medium">Update available</div>
				<UFieldGroup size="xs">
					<UButton
						color="primary"
						label="Refresh"
						@click="$pwa?.updateServiceWorker(true)"
					/>
					<UButton
						color="neutral"
						variant="ghost"
						icon="heroicons:x-mark-20-solid"
						aria-label="Dismiss update prompt"
						@click="$pwa?.cancelPrompt()"
					/>
				</UFieldGroup>
			</div>
		</div>
	</Transition>
</template>
