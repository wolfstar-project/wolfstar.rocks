<template>
	<section class="console-card" :aria-labelledby="headingId">
		<div class="jg-heading">
			<h2 :id="headingId">{{ ts("guild_settings.joinguard.queue.title") }}</h2>
			<span class="jg-heading-rule" aria-hidden="true"></span>
			<UButton
				color="neutral"
				variant="ghost"
				icon="ic:round-refresh"
				size="xs"
				:loading="queue.status.value === 'pending'"
				:aria-label="ts('guild_settings.joinguard.queue.refresh')"
				@click="queue.refresh()"
			/>
		</div>
		<p class="mt-1.5 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.joinguard.queue.help") }}
		</p>

		<div
			class="mt-4 mb-1 flex flex-wrap gap-2"
			role="group"
			:aria-label="ts('guild_settings.joinguard.queue.filter_aria')"
		>
			<button
				v-for="option in filters"
				:key="option.value"
				type="button"
				class="jg-filter"
				:aria-pressed="option.value === filter"
				@click="filter = option.value"
			>
				{{ option.label }}
				<span class="font-mono text-[0.6875rem] text-muted">{{ option.count }}</span>
			</button>
		</div>

		<!-- What becomes of a request is read out, wherever the focus is. -->
		<p class="sr-only" role="status">{{ announcement }}</p>

		<div v-if="isLoading" class="mt-3 flex flex-col gap-3">
			<USkeleton v-for="n in 2" :key="n" class="h-20 w-full rounded-lg" />
		</div>

		<div v-else-if="hasFailed" class="mt-3 flex flex-col items-start gap-2" role="alert">
			<p class="text-[0.8125rem] text-toned">
				{{ ts("guild_settings.joinguard.queue.load_failed") }}
			</p>
			<UButton color="neutral" variant="outline" size="sm" @click="queue.refresh()">
				{{ ts("guild_settings.joinguard.rules.retry") }}
			</UButton>
		</div>

		<p v-else-if="rows.length === 0" class="mt-2.5 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.joinguard.queue.empty") }}
		</p>

		<ul v-else :aria-label="ts('guild_settings.joinguard.queue.list_aria')">
			<li v-for="row in rows" :key="row.entry.id" class="jg-row">
				<div class="flex flex-wrap items-center gap-2.5">
					<UAvatar
						:src="row.entry.member.avatarUrl ?? undefined"
						:alt="row.name"
						size="sm"
						class="shrink-0"
						aria-hidden="true"
					/>
					<span class="text-sm font-semibold">{{ row.name }}</span>
					<GuildLogsPill v-if="row.trust" :tone="row.trust.tone">
						{{ row.trust.label }}
					</GuildLogsPill>
					<span class="text-xs text-muted">{{ row.created }}</span>
					<span class="hidden flex-1 sm:block"></span>
					<span class="flex items-center gap-2.5">
						<GuildLogsPill :tone="row.statusTone">{{ row.statusLabel }}</GuildLogsPill>
						<time
							class="font-mono text-xs whitespace-nowrap text-muted"
							:datetime="row.datetime"
							:title="row.fullDate"
						>
							{{ row.at }}
						</time>
					</span>
				</div>
				<p class="jg-row-indent text-[0.8125rem] leading-normal text-toned">
					{{ ts("guild_settings.joinguard.queue.stopped_by") }}
					<strong class="text-highlighted">{{ row.entry.ruleName }}</strong>
					· {{ row.signals }}
				</p>

				<div
					v-if="row.entry.status === 'Waiting'"
					class="jg-row-indent flex flex-col gap-1.5"
				>
					<p
						v-if="row.request?.state === 'sending'"
						class="flex items-center gap-2 text-[0.8125rem] text-muted"
					>
						<UIcon
							name="heroicons:arrow-path"
							class="size-4 animate-spin"
							aria-hidden="true"
						/>
						{{ ts("guild_settings.joinguard.queue.sending") }}
					</p>
					<template v-else>
						<div class="flex flex-col gap-2 sm:flex-row">
							<UButton
								color="success"
								size="sm"
								class="justify-center"
								:aria-label="
									ts('guild_settings.joinguard.queue.verify_aria', {
										name: row.name,
									})
								"
								@click="verify(row.entry)"
							>
								{{ ts("guild_settings.joinguard.queue.verify") }}
							</UButton>
							<UButton
								color="error"
								variant="outline"
								size="sm"
								class="justify-center"
								:aria-label="
									ts('guild_settings.joinguard.queue.kick_aria', {
										name: row.name,
									})
								"
								@click="openKick(row.entry)"
							>
								{{ ts("guild_settings.joinguard.queue.kick") }}
							</UButton>
						</div>
						<p v-if="row.requestMessage" class="text-[0.8125rem] text-error">
							{{ row.requestMessage }}
						</p>
					</template>
				</div>
				<p v-else class="jg-row-indent text-xs text-muted">{{ row.decision }}</p>
			</li>
		</ul>

		<div v-if="queue.hasMore.value && rows.length > 0" class="mt-3">
			<UButton
				color="neutral"
				variant="outline"
				size="sm"
				:loading="queue.loadingMore.value"
				@click="loadMore"
			>
				{{ ts("guild_settings.joinguard.queue.load_more") }}
			</UButton>
		</div>

		<UModal
			:open="kickTarget !== null"
			:title="ts('guild_settings.joinguard.queue.kick_title', { name: kickName })"
			:description="ts('guild_settings.joinguard.queue.kick_description')"
			@update:open="!$event && (kickTarget = null)"
		>
			<template #body>
				<form :id="kickFormId" novalidate @submit.prevent="confirmKick">
					<UFormField :label="ts('guild_settings.joinguard.queue.reason')">
						<UTextarea
							v-model="kickReason"
							:rows="3"
							autoresize
							class="w-full"
							:maxlength="JoinGuardLimits.reason"
							:placeholder="ts('guild_settings.joinguard.queue.reason_placeholder')"
						/>
						<template #hint>
							<span class="font-mono text-xs text-muted">
								{{
									ts("guild_settings.joinguard.notices.count", {
										count: kickReason.length,
										max: JoinGuardLimits.reason,
									})
								}}
							</span>
						</template>
					</UFormField>
				</form>
			</template>
			<template #footer>
				<div class="flex w-full justify-end gap-2">
					<UButton
						color="neutral"
						variant="outline"
						class="dialog-cancel"
						@click="kickTarget = null"
					>
						{{ ts("guild_settings.joinguard.editor.cancel") }}
					</UButton>
					<UButton type="submit" :form="kickFormId" color="error">
						{{ ts("guild_settings.joinguard.queue.kick_confirm") }}
					</UButton>
				</div>
			</template>
		</UModal>
	</section>
</template>

<script setup lang="ts">
import type { JoinGuardQueueEntry, JoinGuardQueueFilter } from "#shared/utils/join-guard";
import type {
	JoinGuardActionResult,
	JoinGuardRowRequest,
	useJoinGuardQueue,
} from "~/composables/useJoinGuardQueue";
import { JoinGuardLimits, JoinGuardQueueFilters } from "#shared/utils/join-guard";

/**
 * The members the guard stopped this week, by where they are now, with Verify
 * and Kick for the ones who wait. Neither is done here: each writes a request
 * the bot acts on, and the row says "Sending…" until it has.
 */
const { queue } = defineProps<{
	queue: ReturnType<typeof useJoinGuardQueue>;
}>();

const filter = defineModel<JoinGuardQueueFilter>("filter", { required: true });

const i18n = useI18n();
const { ts } = i18n;
const { timeLocale } = useAppLocale();
const toast = useToast();

const headingId = useId();
const kickFormId = useId();

const FILTER_KEYS: Record<JoinGuardQueueFilter, string> = {
	all: "guild_settings.joinguard.queue.filters.all",
	Banned: "guild_settings.joinguard.queue.filters.banned",
	Kicked: "guild_settings.joinguard.queue.filters.kicked",
	Verified: "guild_settings.joinguard.queue.filters.verified",
	Waiting: "guild_settings.joinguard.queue.filters.waiting",
};

const filters = computed(() =>
	JoinGuardQueueFilters.map((value) => ({
		count: queue.counts.value[value],
		label: ts(FILTER_KEYS[value]),
		value,
	})),
);

const isLoading = computed(
	() =>
		(queue.status.value === "idle" || queue.status.value === "pending") &&
		queue.entries.value.length === 0,
);
const hasFailed = computed(
	() => queue.status.value === "error" && queue.entries.value.length === 0,
);

function memberName(entry: JoinGuardQueueEntry): string {
	return `@${entry.member.username}`;
}

const REFUSAL_KEYS = {
	generic: "guild_settings.joinguard.requests.generic",
	invalid: "guild_settings.joinguard.requests.invalid",
	notWaiting: "guild_settings.joinguard.requests.not_waiting",
	unknown: "guild_settings.joinguard.requests.unknown",
} as const;

/** What a request that did not go through says on its row. */
function requestMessage(request: JoinGuardRowRequest | undefined): string | null {
	switch (request?.state) {
		case "failed":
			return ts("guild_settings.joinguard.requests.failed", {
				reason: ts(joinGuardFailureKey(request.error.code)),
			});
		case "timeout":
			return ts("guild_settings.joinguard.requests.timeout");
		case "unreachable":
			return ts("guild_settings.joinguard.requests.unreachable");
		case "refused":
			return ts(REFUSAL_KEYS[request.code]);
		default:
			return null;
	}
}

const rows = computed(() => {
	const now = Date.now();
	return queue.entries.value.map((entry) => {
		const request = queue.rowRequests.value[entry.id];
		const created = new Date(entry.createdAt);
		return {
			at: formatActivityTime(created, new Date(now), timeLocale.value),
			created: ts("guild_settings.joinguard.queue.created", {
				ago: formatJoinGuardAgo(entry.accountCreatedAt, now, timeLocale.value),
			}),
			datetime: created.toISOString(),
			decision: joinGuardDecision(entry, i18n),
			entry,
			fullDate: created.toLocaleString(timeLocale.value),
			name: memberName(entry),
			request,
			requestMessage: requestMessage(request),
			signals: joinGuardSignals(entry, i18n),
			statusLabel: ts(JOIN_GUARD_STATUS_KEYS[entry.status]),
			statusTone: JOIN_GUARD_STATUS_TONES[entry.status],
			trust:
				entry.trust === null
					? null
					: {
							label: ts(JOIN_GUARD_TRUST_KEYS[entry.trust]),
							tone: JOIN_GUARD_TRUST_TONES[entry.trust],
						},
		};
	});
});

const announcement = ref("");

function report(
	entry: JoinGuardQueueEntry,
	kind: "Verify" | "Kick",
	result: JoinGuardActionResult,
) {
	const name = memberName(entry);
	if (result.state === "done") {
		const title =
			kind === "Verify"
				? ts("guild_settings.joinguard.queue.verified_title", { name })
				: ts("guild_settings.joinguard.queue.kicked_title", { name });
		const description =
			kind === "Verify"
				? ts("guild_settings.joinguard.queue.verified_description")
				: ts("guild_settings.joinguard.queue.kicked_description");
		announcement.value = title;
		toast.add({ color: "success", description, icon: "heroicons:check-circle", title });
		return;
	}
	const message = requestMessage({ ...result, kind }) ?? "";
	announcement.value = message;
	toast.add({
		color: result.state === "timeout" ? "warning" : "error",
		description: message,
		icon: "heroicons:x-circle",
		title: ts("guild_settings.joinguard.requests.title", { name }),
	});
}

async function verify(entry: JoinGuardQueueEntry) {
	announcement.value = ts("guild_settings.joinguard.queue.sending");
	report(entry, "Verify", await queue.act(entry.id, "Verify"));
}

const kickTarget = ref<JoinGuardQueueEntry | null>(null);
const kickReason = ref("");
const kickName = computed(() => (kickTarget.value ? memberName(kickTarget.value) : ""));

function openKick(entry: JoinGuardQueueEntry) {
	kickReason.value = "";
	kickTarget.value = entry;
}

async function confirmKick() {
	const entry = kickTarget.value;
	if (!entry) return;
	const reason = kickReason.value;
	kickTarget.value = null;
	announcement.value = ts("guild_settings.joinguard.queue.sending");
	report(entry, "Kick", await queue.act(entry.id, "Kick", reason));
}

async function loadMore() {
	try {
		await queue.loadMore();
	} catch {
		toast.add({
			color: "error",
			description: ts("guild_settings.joinguard.queue.load_failed"),
			icon: "heroicons:x-circle",
			title: ts("guild_settings.joinguard.queue.load_more_failed"),
		});
	}
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

/* The design's pill filters: a quiet outline, and the picked one tinted. */
.jg-filter {
	@apply inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full bg-transparent px-3 text-[0.8125rem] font-semibold text-toned;
	border: 1px solid var(--console-border);
	transition: background-color 150ms ease;
}

.jg-filter:hover {
	background-color: var(--console-hover);
}

.jg-filter[aria-pressed="true"] {
	@apply text-highlighted;
	background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
	border-color: var(--color-primary);
}

.jg-filter:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.jg-row {
	@apply flex flex-col gap-2 py-3.5;
	border-top: 1px solid var(--home-border-subtle);
}

/* Lined up under the name, past the avatar; flush on a phone. */
.jg-row-indent {
	@apply sm:pl-9.5;
}
</style>
