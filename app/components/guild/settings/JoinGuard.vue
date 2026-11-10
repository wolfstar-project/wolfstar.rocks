<template>
	<DashboardPageHeader
		:title="ts('guild_settings.joinguard.title')"
		:description="ts('guild_settings.joinguard.subtitle')"
	>
		<span class="jg-badge">
			{{ tc("guild_settings.joinguard.stopped_badge", queue.counts.value.all) }}
		</span>
		<span class="jg-badge">
			{{ tc("guild_settings.joinguard.waiting_badge", queue.waiting.value) }}
		</span>
	</DashboardPageHeader>

	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.joinguard.form_aria')"
		@error="onError"
	>
		<GuildModuleBanner
			icon="ic:round-verified-user"
			:title="ts('guild_settings.joinguard.title')"
			:hint="bannerHint"
			:on="state.joinGuardEnabled"
		>
			<USwitch
				v-model="state.joinGuardEnabled"
				:aria-label="ts('guild_settings.joinguard.switch_aria')"
			/>
		</GuildModuleBanner>
	</GuildSettingsForm>

	<template v-if="state.joinGuardEnabled">
		<GuildJoinguardRules />
		<GuildJoinguardCheckpoint :posting="queue.postingButton.value" @post-button="postButton" />
		<GuildJoinguardAllowList />
		<GuildJoinguardNotices />
		<GuildJoinguardQueue v-model:filter="filter" :queue="queue" />
	</template>

	<section v-else class="jg-off" :aria-labelledby="offHeadingId">
		<span class="jg-off-icon" aria-hidden="true">
			<UIcon name="ic:round-verified-user" class="size-6 text-muted" />
		</span>
		<h2 :id="offHeadingId" class="text-base font-bold">
			{{ ts("guild_settings.joinguard.off_title") }}
		</h2>
		<p class="max-w-95 text-[0.8125rem] leading-[1.55] text-muted">
			{{ ts("guild_settings.joinguard.off_body") }}
		</p>
	</section>
</template>

<script setup lang="ts">
/**
 * The Join Guard section: the module's switch, its rules (written at once),
 * its checkpoint, allow list and notices (staged with the save bar), and the
 * queue of the members it stopped this week.
 */
const { ts, tc } = useI18n();
const toast = useToast();
const { activeGuildId } = useActiveGuild();
const { originalGuildSettings } = useGuildSettings();
const names = useJoinGuardNames();

const offHeadingId = useId();

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	toggles: ["joinGuardEnabled"],
});

// The badges and the banner read this week's counts off the queue, so the
// section owns it and hands it to the card that lists it.
const filter = ref<JoinGuardQueueFilter>("Waiting");
const queue = useJoinGuardQueue({ filter, guildId: activeGuildId });

const bannerHint = computed(() =>
	state.joinGuardEnabled
		? ts("guild_settings.joinguard.on_summary", {
				stopped: tc("guild_settings.joinguard.members_stopped", queue.counts.value.all),
				waiting: queue.waiting.value,
			})
		: ts("guild_settings.joinguard.off_summary"),
);

function postedChannel(): string {
	const id = originalGuildSettings.value?.joinGuardCheckpointChannel;
	const name = id ? names.channel(id) : null;
	return name ? `#${name}` : ts("guild_settings.joinguard.checkpoint.the_channel");
}

const POST_REFUSAL_KEYS = {
	generic: "guild_settings.joinguard.requests.generic",
	invalid: "guild_settings.joinguard.requests.invalid",
	notWaiting: "guild_settings.joinguard.requests.generic",
	unknown: "guild_settings.joinguard.requests.generic",
} as const;

function postFailure(result: Exclude<JoinGuardActionResult, { state: "done" }>): string {
	switch (result.state) {
		case "failed":
			return ts("guild_settings.joinguard.requests.failed", {
				reason: ts(joinGuardFailureKey(result.error.code)),
			});
		case "timeout":
			return ts("guild_settings.joinguard.requests.timeout");
		case "unreachable":
			return ts("guild_settings.joinguard.requests.unreachable");
		default:
			return ts(POST_REFUSAL_KEYS[result.code]);
	}
}

async function postButton() {
	const result = await queue.postButton();
	if (result.state === "done") {
		toast.add({
			color: "success",
			description: ts("guild_settings.joinguard.checkpoint.posted_description"),
			icon: "heroicons:check-circle",
			title: ts("guild_settings.joinguard.checkpoint.posted_title", {
				channel: postedChannel(),
			}),
		});
		return;
	}
	toast.add({
		color: result.state === "timeout" ? "warning" : "error",
		description: postFailure(result),
		icon: "heroicons:x-circle",
		title: ts("guild_settings.joinguard.checkpoint.post_failed_title"),
	});
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The design system's soft badge: a blurple tint, the count in monospace. */
.jg-badge {
	@apply inline-flex h-6.5 items-center rounded-full bg-primary/15 px-2.5 font-mono text-xs font-semibold text-primary theme-light:text-default;
}

.jg-off {
	@apply flex flex-col items-center gap-2.5 rounded-[10px] px-6 py-8 text-center;
	border: 1px dashed var(--console-border);
}

.jg-off-icon {
	@apply flex size-13 items-center justify-center rounded-full;
	background-color: var(--console-active, oklch(50% 0 0 / 0.12));
}
</style>
