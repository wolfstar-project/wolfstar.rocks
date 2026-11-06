<template>
	<section class="console-card" :aria-labelledby="headingId">
		<div class="queue-heading">
			<h2 :id="headingId">{{ ts("guild_settings.appeals.queue.title") }}</h2>
			<span aria-hidden="true"></span>
		</div>
		<p class="mt-1.5 text-[0.8125rem] text-muted">
			{{ ts("guild_settings.appeals.queue.description") }}
		</p>

		<div
			class="mt-4 flex flex-wrap gap-2"
			role="group"
			:aria-label="ts('guild_settings.appeals.queue.filter_aria')"
		>
			<button
				v-for="option in filters"
				:key="option.value"
				type="button"
				class="queue-filter"
				:aria-pressed="option.value === selected"
				@click="selected = option.value"
			>
				{{ option.label }}
				<span v-if="option.count !== null" class="queue-count">{{ option.count }}</span>
			</button>
		</div>

		<div class="mt-4">
			<DashboardSkeleton v-if="isLoading" kind="table" bare />

			<div v-else-if="hasFailed" class="queue-empty" role="alert">
				<UIcon
					name="heroicons:exclamation-triangle"
					class="size-8 text-error"
					aria-hidden="true"
				/>
				<p class="text-toned">{{ ts("guild_settings.appeals.queue.load_failed") }}</p>
				<UButton color="neutral" variant="outline" class="dialog-cancel" @click="refresh()">
					{{ ts("guild_settings.appeals.queue.retry") }}
				</UButton>
			</div>

			<div v-else-if="entries.length === 0" class="queue-empty" role="status">
				<span class="queue-empty-icon" aria-hidden="true">
					<UIcon name="ic:round-rate-review" class="size-6 text-muted" />
				</span>
				<p class="text-base font-bold">{{ empty.title }}</p>
				<p class="max-w-90 text-[0.8125rem] leading-[1.55] text-muted">
					{{ empty.description }}
				</p>
			</div>

			<template v-else>
				<p v-if="!canReview" class="mb-1 text-[0.8125rem] text-muted">
					{{ ts("guild_settings.appeals.queue.no_review") }}
				</p>

				<ul class="queue-list">
					<li v-for="row in rows" :key="row.entry.id" class="queue-row">
						<div class="queue-head">
							<UAvatar v-bind="row.avatar" :ui="{ root: 'size-7 shrink-0' }" />
							<span class="min-w-0 truncate text-sm font-semibold text-highlighted">
								{{ row.name }}
							</span>
							<GuildLogsPill v-if="row.entry.caseType" :tone="row.caseTone">
								{{ row.entry.caseType }}
							</GuildLogsPill>
							<span class="font-mono text-xs text-muted">
								{{
									ts("guild_settings.appeals.queue.case_number", {
										id: row.entry.caseId,
									})
								}}
							</span>
							<span v-if="row.entry.formName" class="queue-tag">
								{{ row.entry.formName }}
							</span>
							<span class="queue-when">
								<GuildLogsPill :tone="row.statusTone">{{
									row.statusLabel
								}}</GuildLogsPill>
								<time
									class="font-mono text-xs whitespace-nowrap text-muted"
									:datetime="row.datetime"
									:title="row.fullDate"
								>
									{{ row.at }}
								</time>
							</span>
						</div>

						<div class="queue-body">
							<div v-for="answer in row.entry.answers" :key="answer.questionId">
								<p v-if="row.severalAnswers" class="queue-question">
									{{ answer.label }}
								</p>
								<p class="queue-answer">{{ answer.value }}</p>
							</div>

							<div
								v-if="row.entry.status === 'pending' && canReview"
								class="queue-actions"
							>
								<UButton
									color="neutral"
									variant="solid"
									class="queue-action"
									:disabled="busyId !== null"
									:loading="isBusy(row.entry, 'Approve')"
									:aria-label="
										ts('guild_settings.appeals.queue.accept_aria', {
											name: row.name,
										})
									"
									@click="ask(row.entry, 'Approve')"
								>
									{{ ts("guild_settings.appeals.queue.accept") }}
								</UButton>
								<UButton
									color="primary"
									variant="outline"
									class="queue-action"
									:disabled="busyId !== null"
									:loading="isBusy(row.entry, 'Deny')"
									:aria-label="
										ts('guild_settings.appeals.queue.deny_aria', {
											name: row.name,
										})
									"
									@click="ask(row.entry, 'Deny')"
								>
									{{ ts("guild_settings.appeals.queue.deny") }}
								</UButton>
							</div>
							<template v-else-if="row.entry.status !== 'pending'">
								<p class="queue-decided">{{ row.decidedLine }}</p>
								<p v-if="row.entry.reason" class="queue-decided">
									{{
										ts("guild_settings.appeals.queue.decision.reason", {
											reason: row.entry.reason,
										})
									}}
								</p>
							</template>
						</div>
					</li>
				</ul>

				<div v-if="hasMore" class="mt-3 flex flex-wrap items-center gap-3">
					<p class="text-[0.8125rem] text-muted">
						{{
							ts("guild_settings.appeals.queue.showing", {
								shown: entries.length,
								total,
							})
						}}
					</p>
					<UButton
						color="neutral"
						variant="outline"
						size="sm"
						class="dialog-cancel"
						:loading="isLoadingMore"
						@click="loadMore()"
					>
						{{ ts("guild_settings.appeals.queue.show_more") }}
					</UButton>
				</div>
				<p v-if="loadMoreFailed" class="mt-2 text-[0.8125rem] text-error" role="alert">
					{{ ts("guild_settings.appeals.queue.more_failed") }}
				</p>
			</template>
		</div>

		<GuildAppealsQueueDecisionDialog
			v-model:open="dialogOpen"
			:decision="deciding?.decision ?? 'Approve'"
			:name="deciding ? `@${deciding.entry.user.displayName}` : ''"
			:case-id="deciding?.entry.caseId ?? 0"
			@confirm="submit"
		/>
	</section>
</template>

<script setup lang="ts">
import type {
	AppealDecision,
	AppealQueueEntry,
	AppealQueueFilter,
	AppealStatus,
} from "#shared/utils/appeal-queue";
import type {
	AppealDecisionErrorCode,
	AppealDecisionResult,
	AppealLateResult,
} from "~/composables/useAppealQueue";
import type { LogsPillTone } from "../logs/Pill.vue";
import { AppealQueueFilters } from "#shared/utils/appeal-queue";
import { avatarURL } from "#shared/utils/discord";

/**
 * The appeals of the open server, newest first, with a filter for each status,
 * and the means to accept or deny a pending one. Deciding is asking the bot,
 * which undoes the case and tells the member: see `useAppealQueue`.
 */
const { ts } = useI18n();
const { timeLocale } = useAppLocale();
const { activeGuildId } = useActiveGuild();
const toast = useToast();

const headingId = useId();

const selected = ref<AppealQueueFilter>("pending");

const {
	busyId,
	canReview,
	counts,
	decide,
	entries,
	hasMore,
	isLoadingMore,
	loadMore,
	loadMoreFailed,
	refresh,
	status,
	total,
} = useAppealQueue({
	guildId: activeGuildId,
	filter: selected,
	// The bot answered a decision after the toast said it had not yet.
	onLateResult: (result: AppealLateResult, decision: AppealDecision) => notify(result, decision),
});

const STATUS_TONES: Record<AppealStatus, LogsPillTone> = {
	accepted: "success",
	denied: "error",
	pending: "warning",
};

// Static maps, not keys built from the value: the i18n report can only follow
// keys it can read in the source.
const STATUS_KEYS: Record<AppealStatus, string> = {
	accepted: "guild_settings.appeals.queue.status.accepted",
	denied: "guild_settings.appeals.queue.status.denied",
	pending: "guild_settings.appeals.queue.status.pending",
};

const EMPTY_KEYS: Record<AppealQueueFilter, { title: string; description: string }> = {
	accepted: {
		title: "guild_settings.appeals.queue.empty.accepted_title",
		description: "guild_settings.appeals.queue.empty.accepted_description",
	},
	all: {
		title: "guild_settings.appeals.queue.empty.all_title",
		description: "guild_settings.appeals.queue.empty.all_description",
	},
	denied: {
		title: "guild_settings.appeals.queue.empty.denied_title",
		description: "guild_settings.appeals.queue.empty.denied_description",
	},
	pending: {
		title: "guild_settings.appeals.queue.empty.pending_title",
		description: "guild_settings.appeals.queue.empty.pending_description",
	},
};

const ERROR_KEYS: Record<AppealDecisionErrorCode, string> = {
	caseGone: "guild_settings.appeals.queue.errors.caseGone",
	decided: "guild_settings.appeals.queue.errors.decided",
	failed: "guild_settings.appeals.queue.errors.failed",
	generic: "guild_settings.appeals.queue.errors.generic",
	invalid: "guild_settings.appeals.queue.errors.invalid",
	noAccess: "guild_settings.appeals.queue.errors.noAccess",
	undoFailed: "guild_settings.appeals.queue.errors.undoFailed",
	unknown: "guild_settings.appeals.queue.errors.unknown",
};

const filters = computed(() =>
	AppealQueueFilters.map((value) => ({
		value,
		label:
			value === "all"
				? ts("guild_settings.appeals.queue.filters.all")
				: ts(STATUS_KEYS[value]),
		count: value === "all" ? null : counts.value[value],
	})),
);

// A first load, or a change of filter, draws the skeleton, so rows of the last
// status never pass for this one; a longer page loads behind the rows it has.
const isLoading = computed(
	() => (status.value === "pending" || status.value === "idle") && entries.value.length === 0,
);
const hasFailed = computed(() => status.value === "error" && entries.value.length === 0);

const empty = computed(() => ({
	title: ts(EMPTY_KEYS[selected.value].title),
	description: ts(EMPTY_KEYS[selected.value].description),
}));

const now = new Date();
const rows = computed(() =>
	entries.value.map((entry) => {
		const created = new Date(entry.createdAt);
		const time = entry.decidedAt
			? formatActivityTime(new Date(entry.decidedAt), now, timeLocale.value)
			: "";
		return {
			at: formatActivityTime(created, now, timeLocale.value),
			avatar: {
				alt: "",
				src: avatarURL({ id: entry.user.id, avatar: entry.user.avatar }, { size: 64 }),
			},
			caseTone: moderationActionVariant(entry.caseType ?? "") as LogsPillTone,
			datetime: created.toISOString(),
			decidedLine: entry.reviewer
				? ts("guild_settings.appeals.queue.decision.by", {
						name: `@${entry.reviewer.displayName}`,
						time,
					})
				: ts("guild_settings.appeals.queue.decision.at", { time }),
			entry,
			fullDate: created.toLocaleString(timeLocale.value),
			name: `@${entry.user.displayName}`,
			severalAnswers: entry.answers.length > 1,
			statusLabel: ts(STATUS_KEYS[entry.status]),
			statusTone: STATUS_TONES[entry.status],
		};
	}),
);

const deciding = ref<{ entry: AppealQueueEntry; decision: AppealDecision } | null>(null);
const dialogOpen = ref(false);

function ask(entry: AppealQueueEntry, decision: AppealDecision) {
	deciding.value = { entry, decision };
	dialogOpen.value = true;
}

function isBusy(entry: AppealQueueEntry, decision: AppealDecision) {
	return busyId.value === entry.id && deciding.value?.decision === decision;
}

function notify(result: AppealDecisionResult, decision: AppealDecision) {
	if (result.ok && result.state === "done") {
		toast.add({
			color: "success",
			icon: "heroicons:check-circle",
			title:
				decision === "Approve"
					? ts("guild_settings.appeals.queue.toasts.accepted")
					: ts("guild_settings.appeals.queue.toasts.denied"),
		});
	} else if (result.ok) {
		toast.add({
			color: "info",
			icon: "ic:round-info",
			title: ts("guild_settings.appeals.queue.toasts.waiting"),
		});
	} else {
		toast.add({
			color: result.code === "decided" ? "warning" : "error",
			description: ts(ERROR_KEYS[result.code]),
			icon:
				result.code === "decided" ? "heroicons:exclamation-triangle" : "heroicons:x-circle",
			title: ts("guild_settings.appeals.queue.toasts.failed"),
		});
	}
}

async function submit(reason: string) {
	const target = deciding.value;
	if (!target) return;

	dialogOpen.value = false;
	notify(await decide(target.entry.id, target.decision, reason), target.decision);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.queue-heading {
	@apply flex items-center gap-3;
}

.queue-heading h2 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.queue-heading > span {
	@apply h-px flex-1;
	background-color: var(--console-border);
}

/* The design's pill filters: a quiet outline, and the picked one tinted. */
.queue-filter {
	@apply inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full bg-transparent px-3 text-[0.8125rem] font-semibold text-toned;
	border: 1px solid var(--console-border);
	transition: background-color 150ms ease;
}

.queue-filter:hover {
	background-color: var(--console-hover);
}

.queue-filter[aria-pressed="true"] {
	@apply text-highlighted;
	background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
	border-color: var(--color-primary);
}

.queue-filter:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.queue-count {
	@apply font-mono text-xs font-medium text-muted;
}

.queue-list {
	@apply flex flex-col;
}

.queue-row {
	@apply py-4;
	border-top: 1px solid var(--home-border-subtle);
}

.queue-row:first-child {
	@apply border-t-0 pt-1;
}

.queue-head {
	@apply flex flex-wrap items-center gap-2.5;
}

/* The status and the time keep to the right edge, and wrap under the rest on a phone. */
.queue-when {
	@apply ml-auto flex items-center gap-2.5;
}

.queue-tag {
	@apply rounded-[4px] bg-base-content/8 px-1.5 py-0.5 text-xs text-muted;
}

/* Under the name, not under the avatar: the avatar and the gap before the name. */
.queue-body {
	@apply mt-2 flex flex-col gap-2 pl-[2.375rem];
}

.queue-question {
	@apply text-xs text-muted;
}

.queue-answer {
	@apply text-[0.8125rem] leading-normal break-words whitespace-pre-wrap text-toned;
}

.queue-actions {
	@apply flex flex-wrap gap-2 pt-1;
}

.queue-action {
	@apply h-8 rounded-[5px] px-3.5 text-[0.8125rem] font-medium;
}

.queue-decided {
	@apply text-[0.8125rem] leading-normal text-muted;
}

.queue-empty {
	@apply flex flex-col items-center gap-2.5 rounded-[10px] px-6 py-10 text-center;
	border: 1px dashed var(--console-border);
}

.queue-empty-icon {
	@apply flex size-13 items-center justify-center rounded-full;
	background-color: var(--console-active);
}
</style>
