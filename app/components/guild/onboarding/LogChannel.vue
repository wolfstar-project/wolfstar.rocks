<template>
	<section class="console-card" :aria-labelledby="headingId">
		<h3 :id="headingId" class="text-[1.0625rem] font-semibold">
			{{ ts("guild_settings.onboarding.log.title") }}
		</h3>
		<p class="mt-1.5 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.onboarding.log.help") }}
		</p>
		<p class="mt-3 text-sm font-semibold text-highlighted">
			{{
				channelId === null
					? ts("guild_settings.onboarding.log.none")
					: onboardingChannelName(channelId, text, names)
			}}
		</p>
	</section>
</template>

<script setup lang="ts">
/** The channel WolfStar reports every pass, failure and action of the onboarding to. */
defineProps<{
	channelId: string | null;
}>();

const { ts } = useI18n();
const text = useOnboardingText();
const names = useJoinGuardNames();

const headingId = useId();
</script>
