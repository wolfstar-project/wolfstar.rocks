<template>
	<section class="console-card" :aria-labelledby="headingId">
		<h3 :id="headingId" class="text-[1.0625rem] font-semibold">
			{{ ts("guild_settings.onboarding.log.title") }}
		</h3>
		<p class="mt-1.5 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.onboarding.log.help") }}
		</p>
		<form class="mt-3 flex flex-wrap items-end gap-2" novalidate @submit.prevent="save">
			<SelectChannel
				v-model="draft"
				class="min-w-48 flex-1"
				layout="field"
				:guild="guildData"
				:label="ts('guild_settings.onboarding.log.channel')"
				:empty-label="ts('guild_settings.onboarding.log.none')"
				:disabled="saving || locked"
			/>
			<UButton
				type="submit"
				color="neutral"
				variant="outline"
				:loading="saving"
				:disabled="locked || draft === channelId"
			>
				{{ ts("guild_settings.onboarding.log.save") }}
			</UButton>
		</form>
		<p v-if="refusal" class="mt-2 text-[0.8125rem] leading-normal text-error" role="alert">
			{{ refusal }}
		</p>
	</section>
</template>

<script setup lang="ts">
import type { OnboardingModule } from "~/composables/useOnboarding";
/**
 * The channel WolfStar reports every pass, failure and action of the
 * onboarding to. It is saved at once, and a channel WolfStar cannot post in is
 * refused with the permissions it lacks, the saved channel staying as it was.
 */
const { channelId, onboarding } = defineProps<{
	/** The saved channel; `null` for none. */
	channelId: string | null;
	onboarding: Pick<OnboardingModule, "conflict" | "setLogChannel">;
}>();

const { ts } = useI18n();
const text = useOnboardingText();
const names = useJoinGuardNames();
const toast = useToast();
const { guildData } = useGuildData();

const headingId = useId();

const draft = ref<string | null>(channelId);
const saving = ref(false);
const refusal = ref<string | null>(null);
const locked = computed(() => onboarding.conflict.value);

// A reload, or the bot's panel, may bring another saved channel: the picker follows it.
watch(
	() => channelId,
	(saved) => {
		draft.value = saved;
		refusal.value = null;
	},
);

async function save() {
	const picked = draft.value;
	saving.value = true;
	refusal.value = null;
	const result = await onboarding.setLogChannel(picked);
	saving.value = false;

	if (result.ok) {
		toast.add({
			color: "success",
			description:
				picked === null
					? ts("guild_settings.onboarding.log.removed_description")
					: ts("guild_settings.onboarding.log.saved_description"),
			icon: "heroicons:check-circle",
			title: ts("guild_settings.onboarding.log.saved_title"),
		});
		return;
	}

	// A conflict is said by the section's banner, which offers to reload.
	if (result.error.code === "conflict") return;
	refusal.value = onboardingWriteErrorMessage(
		result.error,
		{ logChannelId: picked },
		text,
		names,
	);
}
</script>
