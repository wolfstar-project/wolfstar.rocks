<template>
	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.joinguard.checkpoint.form_aria')"
		@error="onError"
	>
		<section class="console-card" :aria-labelledby="headingId">
			<div class="jg-heading">
				<h2 :id="headingId">{{ ts("guild_settings.joinguard.checkpoint.title") }}</h2>
				<span class="jg-heading-rule" aria-hidden="true"></span>
			</div>

			<div class="mt-4 border-b border-(--home-border-subtle) pb-1">
				<GuildSettingsToggleRow
					v-model="state.joinGuardCheckpoint"
					name="joinGuardCheckpoint"
					:title="ts('guild_settings.joinguard.checkpoint.switch')"
					:description="ts('guild_settings.joinguard.checkpoint.switch_help')"
				/>
			</div>

			<template v-if="state.joinGuardCheckpoint">
				<div class="jg-link">
					<UIcon
						name="ic:round-link"
						class="size-4.5 shrink-0 text-muted"
						aria-hidden="true"
					/>
					<a
						:href="link.href"
						class="min-w-0 flex-[1_1_12.5rem] font-mono text-[0.8125rem] break-all text-toned hover:underline"
						target="_blank"
						rel="noopener"
					>
						{{ link.label }}
					</a>
					<div class="flex flex-wrap gap-2">
						<UButton color="neutral" variant="ghost" size="sm" @click="copyLink">
							{{ ts("guild_settings.joinguard.checkpoint.copy_link") }}
						</UButton>
						<UButton
							color="neutral"
							variant="outline"
							size="sm"
							:loading="posting"
							:disabled="!savedChannel"
							:title="
								savedChannel
									? undefined
									: ts('guild_settings.joinguard.checkpoint.post_needs_channel')
							"
							@click="emit('postButton')"
						>
							{{ ts("guild_settings.joinguard.checkpoint.post_button") }}
						</UButton>
					</div>
				</div>
				<p v-if="!savedChannel" class="mt-1.5 text-xs text-muted">
					{{ ts("guild_settings.joinguard.checkpoint.post_needs_channel") }}
				</p>

				<div class="mt-4 grid gap-4 md:grid-cols-2">
					<SelectRole
						v-model="state.joinGuardPendingRole"
						layout="field"
						:guild="guildData"
						:label="ts('guild_settings.joinguard.checkpoint.pending_role')"
						:tooltip-title="ts('guild_settings.joinguard.checkpoint.pending_role_help')"
						:empty-label="ts('guild_settings.joinguard.checkpoint.no_pending_role')"
					/>
					<SelectRole
						v-model="state.joinGuardVerifiedRole"
						layout="field"
						:guild="guildData"
						:label="ts('guild_settings.joinguard.checkpoint.verified_role')"
						:tooltip-title="
							ts('guild_settings.joinguard.checkpoint.verified_role_help')
						"
						:empty-label="ts('guild_settings.joinguard.checkpoint.no_verified_role')"
					/>
					<SelectChannel
						v-model="state.joinGuardCheckpointChannel"
						layout="field"
						:guild="guildData"
						:label="ts('guild_settings.joinguard.checkpoint.channel')"
						:tooltip-title="ts('guild_settings.joinguard.checkpoint.channel_help')"
						:empty-label="ts('guild_settings.joinguard.checkpoint.no_channel')"
					/>
					<UFormField
						name="joinGuardCheckpointTimeout"
						:label="ts('guild_settings.joinguard.checkpoint.timeout')"
						:help="timeoutHelp"
						:ui="{
							label: 'text-sm font-medium',
							help: 'mt-1.5 text-[0.8125rem] leading-normal text-muted',
						}"
					>
						<div class="flex items-center gap-2.5">
							<UInputNumber
								:model-value="hours"
								:min="0"
								:max="JoinGuardCheckpointTimeoutHours.maximum"
								:step="1"
								class="w-32"
								:aria-label="ts('guild_settings.joinguard.checkpoint.timeout_aria')"
								@update:model-value="setHours"
							/>
							<span class="text-sm text-muted">
								{{ ts("guild_settings.joinguard.checkpoint.hours") }}
							</span>
						</div>
					</UFormField>
				</div>

				<div class="mt-4.5">
					<p :id="trustLabelId" class="mb-1.5 text-sm font-medium">
						{{ ts("guild_settings.joinguard.checkpoint.minimum_trust") }}
					</p>
					<URadioGroup
						:model-value="String(state.joinGuardMinimumTrust)"
						:items="trustItems"
						variant="card"
						orientation="horizontal"
						:aria-labelledby="trustLabelId"
						:ui="{
							fieldset: 'grid gap-2.5 md:grid-cols-3',
							item: 'rounded-lg',
							description: 'text-[0.8125rem] leading-snug',
						}"
						@update:model-value="setTrust"
					/>
					<p class="mt-1.5 text-[0.8125rem] leading-normal text-muted">
						{{ ts("guild_settings.joinguard.checkpoint.trust_scale") }}
					</p>
				</div>

				<h3 class="mt-4.5 text-[0.8125rem] font-semibold text-muted">
					{{ ts("guild_settings.joinguard.checkpoint.checks_title") }}
				</h3>
				<div class="mt-1">
					<GuildSettingsToggleRow
						v-model="state.joinGuardCaptcha"
						name="joinGuardCaptcha"
						:title="ts('guild_settings.joinguard.checkpoint.captcha')"
						:description="ts('guild_settings.joinguard.checkpoint.captcha_help')"
					/>
					<GuildSettingsToggleRow
						v-model="state.joinGuardConnections"
						name="joinGuardConnections"
						:title="ts('guild_settings.joinguard.checkpoint.connections')"
						:description="ts('guild_settings.joinguard.checkpoint.connections_help')"
					/>
					<GuildSettingsToggleRow
						v-model="state.joinGuardSharedBans"
						name="joinGuardSharedBans"
						:title="ts('guild_settings.joinguard.checkpoint.shared_bans')"
						:description="ts('guild_settings.joinguard.checkpoint.shared_bans_help')"
					/>
				</div>
				<p class="mt-2.5 flex items-start gap-2 text-[0.8125rem] leading-normal text-muted">
					<UIcon
						name="ic:round-info"
						class="mt-0.5 size-4 shrink-0 text-primary"
						aria-hidden="true"
					/>
					<i18n-t keypath="guild_settings.joinguard.checkpoint.note" tag="span">
						<template #command><code class="font-mono">/verify</code></template>
					</i18n-t>
				</p>
			</template>
		</section>
	</GuildSettingsForm>
</template>

<script setup lang="ts">
/**
 * The checkpoint of the join guard: where a stopped member waits until they
 * pass the verification page. Its settings are staged with the save bar; the
 * button in Discord is posted at once, through a request to the bot.
 */
defineProps<{
	/** A request to post the button is in flight. */
	posting?: boolean;
}>();

const emit = defineEmits<{ postButton: [] }>();

const { ts, tc } = useI18n();
const { guildData } = useGuildData();
const { originalGuildSettings } = useGuildSettings();
const { copy } = useClipboard();
const config = useRuntimeConfig();

const headingId = useId();
const trustLabelId = useId();

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: ["joinGuardPendingRole", "joinGuardVerifiedRole", "joinGuardCheckpointChannel"],
	toggles: [
		"joinGuardCheckpoint",
		"joinGuardCaptcha",
		"joinGuardConnections",
		"joinGuardSharedBans",
	],
	numbers: ["joinGuardCheckpointTimeout", "joinGuardMinimumTrust"],
});

const link = computed(() => {
	const siteUrl = config.public.siteUrl || (import.meta.client ? window.location.origin : "");
	return joinGuardVerifyLink(siteUrl, guildData.value?.id ?? "");
});

// The bot posts the button in the channel it has saved, not in one staged here.
const savedChannel = computed(
	() => originalGuildSettings.value?.joinGuardCheckpointChannel ?? null,
);

function copyLink() {
	void copy(link.value.href, {
		color: "success",
		description: ts("guild_settings.joinguard.checkpoint.copied_description"),
		icon: "heroicons:check",
		title: ts("guild_settings.joinguard.checkpoint.copied_title"),
	});
}

// Edited in hours, kept in seconds: 0 never kicks.
const hours = computed(() => joinGuardTimeoutHours(state.joinGuardCheckpointTimeout));
function setHours(next: number | null | undefined) {
	state.joinGuardCheckpointTimeout = joinGuardTimeoutSeconds(next ?? 0);
}

const timeoutHelp = computed(() =>
	hours.value === 0
		? ts("guild_settings.joinguard.checkpoint.timeout_never")
		: tc("guild_settings.joinguard.checkpoint.timeout_help", { count: hours.value }),
);

const trustItems = computed(() =>
	JoinGuardMinimumTrustLevels.map((level) => ({
		description: ts(JOIN_GUARD_MINIMUM_TRUST_HELP_KEYS[level]),
		label: ts(JOIN_GUARD_TRUST_KEYS[level]),
		value: String(level),
	})),
);

function setTrust(next: unknown) {
	const level = Number(next);
	if (level === 1 || level === 2 || level === 3) state.joinGuardMinimumTrust = level;
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.jg-heading {
	@apply flex items-center gap-3;
}

.jg-heading h2 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.jg-heading-rule {
	@apply h-px flex-1;
	background-color: var(--console-border);
}

.jg-link {
	@apply mt-3.5 flex flex-wrap items-center gap-2.5 rounded-[10px] px-3 py-2.5;
	background-color: var(--console-rail, var(--ink-800));
	border: 1px solid var(--home-border-subtle);
}
</style>
