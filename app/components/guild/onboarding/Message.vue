<template>
	<section class="console-card" :aria-labelledby="headingId">
		<h3 :id="headingId" class="text-[1.0625rem] font-semibold">
			{{ ts("guild_settings.onboarding.message.title") }}
		</h3>
		<p class="mt-1.5 text-[0.8125rem] leading-normal text-muted">
			{{
				channelId === null
					? ts("guild_settings.onboarding.message.missing")
					: ts("guild_settings.onboarding.message.posted", {
							channel: onboardingChannelName(channelId, text, names),
						})
			}}
		</p>
	</section>
</template>

<script setup lang="ts">
/**
 * Where the bot posted its verification message. The bot owns that message:
 * only its panel in Discord posts or moves it, so the dashboard shows it and
 * does not change it.
 */
defineProps<{
	/** The channel of the message; `null` when the bot posted none. */
	channelId: string | null;
}>();

const { ts } = useI18n();
const text = useOnboardingText();
const names = useJoinGuardNames();

const headingId = useId();
</script>
