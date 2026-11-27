<template>
	<section
		class="console-card flex flex-wrap items-center gap-3.5 border-l-[3px] border-l-error"
		role="alert"
	>
		<UIcon name="ic:round-sync-problem" class="size-6 shrink-0 text-error" aria-hidden="true" />
		<div class="min-w-48 flex-1">
			<p class="text-sm font-semibold text-highlighted">
				{{ ts("guild_settings.onboarding.conflict.title") }}
			</p>
			<p class="text-[0.8125rem] leading-normal text-muted">
				{{ ts("guild_settings.onboarding.conflict.body") }}
			</p>
		</div>
		<UButton color="neutral" variant="outline" :loading="reloading" @click="reload">
			{{ ts("guild_settings.onboarding.conflict.reload") }}
		</UButton>
	</section>
</template>

<script setup lang="ts">
import type { OnboardingModule } from "~/composables/useOnboarding";
/**
 * Shown when a write was refused because the onboarding changed since the
 * page read it: what happened, that the change was not saved, and the way on.
 */
const { onboarding } = defineProps<{
	onboarding: Pick<OnboardingModule, "reload">;
}>();

const { ts } = useI18n();

const reloading = ref(false);

async function reload() {
	reloading.value = true;
	await onboarding.reload();
	reloading.value = false;
}
</script>
