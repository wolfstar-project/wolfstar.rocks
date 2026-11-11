<template>
	<section class="console-card" :aria-labelledby="headingId">
		<div class="thresholds-heading">
			<h2 :id="headingId">{{ ts("guild_settings.warn_thresholds.title") }}</h2>
			<span aria-hidden="true"></span>
			<UBadge color="neutral" variant="subtle">
				{{
					ts("guild_settings.warn_thresholds.count", {
						count: thresholds.length,
						maximum: MAXIMUM_WARN_THRESHOLDS,
					})
				}}
			</UBadge>
		</div>
		<p class="mt-1.5 text-[0.8125rem] text-muted">
			{{ ts("guild_settings.warn_thresholds.help") }}
		</p>

		<form
			class="thresholds-form"
			:aria-label="ts('guild_settings.warn_thresholds.form_aria')"
			@submit.prevent="submit"
		>
			<UFormField
				:label="ts('guild_settings.warn_thresholds.fields.count')"
				:name="`${formId}-count`"
			>
				<UInputNumber
					v-model="draft.count"
					:min="WARN_THRESHOLD_COUNT.minimum"
					:max="WARN_THRESHOLD_COUNT.maximum"
					:step="1"
					class="w-full"
				/>
			</UFormField>
			<UFormField
				:label="ts('guild_settings.warn_thresholds.fields.action')"
				:name="`${formId}-action`"
			>
				<USelect v-model="draft.action" :items="actionItems" class="w-full" />
			</UFormField>
			<UFormField
				:label="ts('guild_settings.warn_thresholds.fields.duration')"
				:name="`${formId}-duration`"
				:hint="timed ? durationHint : undefined"
			>
				<GuildAutomodDurationInput
					v-model="draft.duration"
					:label="ts('guild_settings.warn_thresholds.fields.duration')"
					:disabled="!timed"
				/>
			</UFormField>
			<UFormField
				:label="ts('guild_settings.warn_thresholds.fields.period')"
				:name="`${formId}-period`"
				:hint="ts('guild_settings.warn_thresholds.period_hint')"
			>
				<GuildAutomodDurationInput
					v-model="draft.period"
					:label="ts('guild_settings.warn_thresholds.fields.period')"
				/>
			</UFormField>

			<div class="thresholds-submit">
				<UButton
					type="submit"
					color="primary"
					:icon="replacing ? 'ic:round-check' : 'ic:round-add'"
					:loading="saving"
					:disabled="atLimit"
				>
					{{
						replacing
							? ts("guild_settings.warn_thresholds.replace")
							: ts("guild_settings.warn_thresholds.add")
					}}
				</UButton>
			</div>
		</form>

		<p v-if="formError" class="mt-2 text-sm text-error" role="alert">{{ formError }}</p>
		<p v-else-if="atLimit" class="mt-2 text-[0.8125rem] text-muted">
			{{ ts("guild_settings.warn_thresholds.limit", { maximum: MAXIMUM_WARN_THRESHOLDS }) }}
		</p>
		<UAlert
			v-if="needsMutedRole"
			class="mt-3"
			color="warning"
			variant="subtle"
			icon="ic:round-warning-amber"
			:description="ts('guild_settings.warn_thresholds.no_muted_role')"
		/>

		<DashboardSkeleton v-if="isLoading" kind="table" bare class="mt-4" />
		<UAlert
			v-else-if="error"
			class="mt-4"
			color="error"
			variant="subtle"
			icon="ic:round-error-outline"
			:title="ts('guild_settings.warn_thresholds.load_failed')"
			:actions="[{ label: ts('guild_settings.auto.retry'), onClick: () => refresh() }]"
		/>
		<template v-else>
			<p v-if="shown.length === 0" class="mt-4 text-[0.8125rem] text-muted">
				{{ ts("guild_settings.warn_thresholds.empty") }}
			</p>
			<template v-else>
				<p v-if="usingDefaults" class="mt-4 text-[0.8125rem] text-muted">
					{{ ts("guild_settings.warn_thresholds.defaults_note") }}
				</p>
				<!-- Scrolls sideways on a phone, so the keyboard can reach it too. -->
				<div
					class="mt-3 overflow-x-auto"
					tabindex="0"
					role="region"
					:aria-label="ts('guild_settings.warn_thresholds.table_aria')"
				>
					<table
						class="thresholds-table"
						:aria-label="ts('guild_settings.warn_thresholds.table_aria')"
					>
						<thead>
							<tr>
								<th scope="col">
									{{ ts("guild_settings.warn_thresholds.columns.count") }}
								</th>
								<th scope="col">
									{{ ts("guild_settings.warn_thresholds.columns.period") }}
								</th>
								<th scope="col">
									{{ ts("guild_settings.warn_thresholds.columns.action") }}
								</th>
								<th scope="col">
									{{ ts("guild_settings.warn_thresholds.columns.duration") }}
								</th>
								<th v-if="!usingDefaults" scope="col">
									<span class="sr-only">{{
										ts("guild_settings.auto.columns.actions")
									}}</span>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="threshold in shown" :key="threshold.count">
								<td class="font-mono text-sm font-semibold text-highlighted">
									{{ threshold.count }}
								</td>
								<td class="text-[0.8125rem]">
									{{
										threshold.period === 0
											? ts("guild_settings.warn_thresholds.any_time")
											: compactSeconds(threshold.period, locale)
									}}
								</td>
								<td>
									<GuildLogsPill :tone="ACTION_TONES[threshold.action]">
										{{ ts(AUTOMOD_HARD_ACTION_KEYS[threshold.action]) }}
									</GuildLogsPill>
								</td>
								<td class="text-[0.8125rem]">
									{{ durationLabel(threshold) }}
								</td>
								<td v-if="!usingDefaults">
									<span class="flex justify-end gap-1">
										<UButton
											color="neutral"
											variant="ghost"
											size="sm"
											icon="ic:round-edit"
											:aria-label="
												ts('guild_settings.warn_thresholds.edit_aria', {
													count: threshold.count,
												})
											"
											@click="edit(threshold)"
										/>
										<UButton
											color="neutral"
											variant="ghost"
											size="sm"
											icon="ic:round-close"
											:aria-label="
												ts('guild_settings.warn_thresholds.remove_aria', {
													count: threshold.count,
												})
											"
											@click="askRemove(threshold)"
										/>
									</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</template>
		</template>
	</section>

	<UModal
		:open="removing !== null"
		:title="ts('guild_settings.warn_thresholds.remove_title', { count: removing?.count ?? 0 })"
		:description="
			ts(
				thresholds.length === 1 &&
					originalGuildSettings?.moderationDefaultWarnThresholds === true
					? 'guild_settings.warn_thresholds.remove_last_description'
					: 'guild_settings.warn_thresholds.remove_description',
			)
		"
		:dismissible="removingCount === null"
		@update:open="!$event && closeRemove()"
	>
		<template #footer>
			<div class="flex w-full justify-end gap-2">
				<UButton
					color="neutral"
					variant="outline"
					:disabled="removingCount !== null"
					@click="closeRemove()"
				>
					{{ ts("guild_settings.auto.editor.cancel") }}
				</UButton>
				<UButton color="error" :loading="removingCount !== null" @click="confirmRemove">
					{{ ts("guild_settings.warn_thresholds.remove") }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { WarnThreshold, WarnThresholdAction } from "#shared/utils/warn-thresholds";

const { ts } = useI18n();
const { locale } = useAppLocale();
const toast = useToast();
const { activeGuildId } = useActiveGuild();
const { originalGuildSettings } = useGuildSettings();
const { error, refresh, removeThreshold, setThreshold, status, thresholds } =
	useWarnThresholds(activeGuildId);

const headingId = useId();
const formId = useId();

const ACTION_TONES: Record<WarnThresholdAction, "error" | "warning" | "neutral"> = {
	Ban: "error",
	Kick: "warning",
	Mute: "neutral",
	Softban: "warning",
	Timeout: "neutral",
	VoiceKick: "neutral",
};

const actionItems = computed(() =>
	WARN_THRESHOLD_ACTIONS.map((value) => ({ label: ts(AUTOMOD_HARD_ACTION_KEYS[value]), value })),
);

const hasMutedRole = computed(() => Boolean(originalGuildSettings.value?.rolesMuted));

// The bot holds a server with none of its own to its defaults while the
// setting is on: they are shown, and the first one added replaces them all.
const usingDefaults = computed(
	() =>
		thresholds.value.length === 0 &&
		originalGuildSettings.value?.moderationDefaultWarnThresholds === true,
);
const shown = computed<WarnThreshold[]>(() =>
	usingDefaults.value ? getDefaultWarnThresholds(hasMutedRole.value) : thresholds.value,
);

const isLoading = computed(() => status.value === "pending" && thresholds.value.length === 0);

// The fields work in milliseconds; the API keeps whole seconds.
const draft = reactive({
	action: "Timeout" as WarnThresholdAction,
	count: 3 as number | null,
	duration: 30 * 60 * 1000,
	period: 0,
});

const timed = computed(() => isTimedWarnThresholdAction(draft.action));
const replacing = computed(() =>
	thresholds.value.some((threshold) => threshold.count === draft.count),
);
const atLimit = computed(
	() => !replacing.value && thresholds.value.length >= MAXIMUM_WARN_THRESHOLDS,
);
const needsMutedRole = computed(() => draft.action === "Mute" && !hasMutedRole.value);
const durationHint = computed(() =>
	draft.action === "Timeout"
		? ts("guild_settings.warn_thresholds.timeout_hint")
		: ts("guild_settings.warn_thresholds.permanent_hint"),
);

const saving = ref(false);
const submitted = ref(false);
const serverError = ref<string | null>(null);

const toSeconds = (milliseconds: number) => Math.round(milliseconds / 1000);

const clientError = computed(() => {
	const count = draft.count;
	if (
		count === null ||
		!Number.isInteger(count) ||
		count < WARN_THRESHOLD_COUNT.minimum ||
		count > WARN_THRESHOLD_COUNT.maximum
	) {
		return ts("guild_settings.warn_thresholds.errors.count", WARN_THRESHOLD_COUNT);
	}
	if (toSeconds(draft.period) > MAXIMUM_WARN_THRESHOLD_SECONDS) {
		return ts("guild_settings.warn_thresholds.errors.period");
	}
	if (draft.action === "Timeout") {
		const seconds = toSeconds(draft.duration);
		if (seconds < 1) return ts("guild_settings.warn_thresholds.errors.timeout_duration");
		if (seconds > MAXIMUM_TIMEOUT_SECONDS)
			return ts("guild_settings.warn_thresholds.errors.timeout_long");
	} else if (timed.value && toSeconds(draft.duration) > MAXIMUM_WARN_THRESHOLD_SECONDS) {
		return ts("guild_settings.warn_thresholds.errors.duration");
	}
	return null;
});

const formError = computed(() =>
	submitted.value && clientError.value ? clientError.value : serverError.value,
);

watch(draft, () => {
	serverError.value = null;
});

function durationLabel(threshold: WarnThreshold): string {
	if (!isTimedWarnThresholdAction(threshold.action)) return "—";
	return threshold.duration === null
		? ts("guild_settings.warn_thresholds.permanent")
		: compactSeconds(threshold.duration, locale.value);
}

function edit(threshold: WarnThreshold) {
	submitted.value = false;
	draft.count = threshold.count;
	draft.action = threshold.action;
	draft.duration = (threshold.duration ?? 0) * 1000;
	draft.period = threshold.period * 1000;
}

const SERVER_ERRORS = {
	generic: "guild_settings.please_try_again",
	invalid: "guild_settings.warn_thresholds.errors.invalid",
	limit: "guild_settings.warn_thresholds.limit",
	unknown: "guild_settings.please_try_again",
} as const;

async function submit() {
	submitted.value = true;
	if (clientError.value || draft.count === null || atLimit.value) return;

	const count = draft.count;
	const seconds = toSeconds(draft.duration);
	saving.value = true;
	const result = await setThreshold(count, {
		action: draft.action,
		duration: timed.value && seconds > 0 ? seconds : null,
		period: toSeconds(draft.period),
	});
	saving.value = false;

	if (!result.ok) {
		serverError.value = ts(SERVER_ERRORS[result.code], { maximum: MAXIMUM_WARN_THRESHOLDS });
		return;
	}
	submitted.value = false;
	toast.add({
		color: "success",
		description: ts("guild_settings.warn_thresholds.saved_description", { count }),
		icon: "heroicons:check",
		title: ts("guild_settings.auto.saved_title"),
	});
}

const removing = shallowRef<WarnThreshold | null>(null);
const removingCount = ref<number | null>(null);

function askRemove(threshold: WarnThreshold) {
	removing.value = threshold;
}

function closeRemove() {
	removing.value = null;
}

async function confirmRemove() {
	const threshold = removing.value;
	if (!threshold) return;
	removingCount.value = threshold.count;
	const result = await removeThreshold(threshold.count);
	removingCount.value = null;
	removing.value = null;

	toast.add(
		result.ok
			? {
					color: "success",
					description: ts("guild_settings.warn_thresholds.removed_description", {
						count: threshold.count,
					}),
					icon: "heroicons:check",
					title: ts("guild_settings.auto.removed_title"),
				}
			: {
					color: "error",
					description: ts("guild_settings.please_try_again"),
					icon: "heroicons:x-circle",
					title: ts("guild_settings.save_failed"),
				},
	);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.thresholds-heading {
	@apply flex items-center gap-3;
}

.thresholds-heading h2 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.thresholds-heading > span {
	@apply h-px flex-1;
	background-color: var(--console-border);
}

/* One field a row on a phone, two from `sm`, all of them on one row from `xl`. */
.thresholds-form {
	@apply mt-4 grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[7rem_minmax(9rem,1fr)_minmax(14rem,1.4fr)_minmax(14rem,1.4fr)_auto];
}

.thresholds-submit {
	@apply flex sm:col-span-2 xl:col-span-1;
}

.thresholds-table {
	@apply w-full min-w-140 border-collapse;
}

.thresholds-table th {
	@apply px-2.5 pb-2 text-left text-[0.6875rem] font-bold tracking-[0.06em] uppercase;
	color: var(--ui-text-muted);
}

.thresholds-table td {
	@apply h-12 px-2.5 py-2;
	border-top: 1px solid var(--home-border-subtle);
}
</style>
