<template>
	<div v-if="thread" class="dm-thread">
		<div
			ref="log"
			role="log"
			class="dm-log"
			:aria-label="ts('dashboard.dm.log_aria', { name: thread.name })"
		>
			<div class="dm-intro">
				<img
					:src="thread.avatar"
					alt=""
					width="72"
					height="72"
					class="size-18 rounded-full"
				/>
				<div class="mt-1.5 flex items-center gap-2">
					<h2 class="text-[1.625rem] leading-tight font-bold">{{ thread.name }}</h2>
					<DashboardBotTag />
				</div>
				<p class="max-w-130 text-sm leading-normal text-toned">
					{{ ts("dashboard.dm.intro", { name: thread.name }) }}
					{{ ts(thread.introKey) }}
				</p>
			</div>

			<template v-for="group of days" :key="group.day">
				<div role="separator" class="dm-day">
					<span class="dm-day-line"></span>
					<span class="dm-day-label">{{ formatDay(group.day) }}</span>
					<span class="dm-day-line"></span>
				</div>
				<article v-for="item of group.news" :key="item.id" class="dm-message">
					<img
						:src="thread.avatar"
						alt=""
						width="40"
						height="40"
						class="size-10 shrink-0 rounded-full"
					/>
					<div class="min-w-0 grow">
						<p class="flex flex-wrap items-center gap-2">
							<span class="text-[0.9375rem] font-semibold">{{ thread.name }}</span>
							<DashboardBotTag />
							<time :datetime="item.at" class="font-mono text-[0.6875rem] text-muted">
								{{ formatActivityTime(item.at, now, timeLocale) }}
							</time>
						</p>
						<p v-if="item.textKey" class="mt-0.5 text-sm leading-normal">
							{{ ts(item.textKey, { name: readerName }) }}
						</p>
						<div
							v-if="item.embed"
							class="dm-embed"
							:class="`dm-embed--${item.embed.tone}`"
						>
							<p class="text-[0.9375rem] font-bold">{{ ts(item.embed.titleKey) }}</p>
							<p class="mt-1.5 text-sm leading-normal text-toned">
								{{ ts(item.embed.bodyKey) }}
							</p>
							<UButton
								v-if="item.embed.action"
								class="mt-3"
								size="sm"
								color="primary"
								@click="run(item.embed.action.run)"
							>
								{{ ts(item.embed.action.labelKey) }}
							</UButton>
						</div>
						<div v-if="item.reactions.length > 0" class="mt-1.5 flex flex-wrap gap-1.5">
							<button
								v-for="emoji of item.reactions"
								:key="emoji"
								type="button"
								class="dm-reaction"
								:class="{ 'dm-reaction--on': hasReacted(thread, item.id, emoji) }"
								:aria-pressed="hasReacted(thread, item.id, emoji)"
								:aria-label="ts('dashboard.dm.react', { emoji })"
								@click="toggleReaction(thread, item.id, emoji)"
							>
								<span aria-hidden="true">{{ emoji }}</span>
								<span
									v-if="hasReacted(thread, item.id, emoji)"
									class="font-semibold"
									aria-hidden="true"
									>1</span
								>
							</button>
						</div>
					</div>
				</article>
			</template>
		</div>

		<div class="dm-footer">
			<slot name="notice"></slot>
			<p class="dm-no-reply">
				<UIcon name="ic:round-warning" class="size-4 shrink-0" aria-hidden="true" />
				<span>{{ ts("dashboard.dm.no_reply", { name: thread.name }) }}</span>
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { DirectMessageAction } from "~/utils/direct-messages";
import { formatActivityTime } from "~/utils/audit-log";
import { groupNewsByDay } from "~/utils/direct-messages";

/**
 * The open thread of the Home: a bot's messages, read-only. Opening it marks
 * its messages read.
 */
const { ts } = useI18n();
const { locale, timeLocale } = useAppLocale();
const { thread, markRead, hasReacted, toggleReaction } = useDirectMessages();
const { user: authUser } = useUserSession();
const { user: discordUser } = useUser(authUser);
const { open: openPreferences } = usePreferencesDialog();

const readerName = computed(
	() =>
		discordUser.value?.global_name ?? discordUser.value?.username ?? authUser.value?.name ?? "",
);
const now = useNow({ interval: 60_000 });
const days = computed(() => groupNewsByDay(thread.value?.news ?? []));

function formatDay(day: string): string {
	return new Date(day).toLocaleDateString(locale.value, { dateStyle: "long" });
}

const log = useTemplateRef<HTMLElement>("log");

// A thread opens on its newest message, as a conversation does, and is read.
function openNewest() {
	if (!thread.value) return;
	markRead(thread.value);
	if (log.value) log.value.scrollTop = log.value.scrollHeight;
}

onMounted(openNewest);
watch(thread, openNewest, { flush: "post" });

function run(action: DirectMessageAction) {
	if (action === "language-settings") openPreferences("language");
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.dm-thread {
	@apply flex min-h-0 flex-1 flex-col;
}

.dm-log {
	@apply min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6;
}

.dm-intro {
	@apply flex flex-col gap-1.5 pt-2 pb-5;
}

.dm-day {
	@apply mt-2.5 mb-3.5 flex items-center gap-3;
}

.dm-day-line {
	@apply h-px grow;
	background-color: var(--home-border-subtle);
}

.dm-day-label {
	@apply font-mono text-[0.6875rem] font-semibold;
	color: var(--ui-text-muted);
}

.dm-message {
	@apply flex gap-3.5 pt-1.5 pb-2.5;
}

.dm-embed {
	@apply mt-1.5 max-w-130 rounded-[4px] border border-l-4 px-3.5 py-3;
	background-color: var(--console-surface);
	border-color: var(--home-border-subtle);
}

.dm-embed--primary {
	border-left-color: var(--color-primary);
}

.dm-embed--success {
	border-left-color: var(--color-success);
}

.dm-embed--info {
	border-left-color: var(--color-info);
}

.dm-reaction {
	@apply inline-flex h-6 cursor-pointer items-center gap-1.5 rounded-[6px] border px-2 text-[0.8125rem];
	background-color: var(--console-surface);
	border-color: var(--home-border-subtle);
	color: var(--ui-text-highlighted);
}

.dm-reaction:hover {
	border-color: var(--console-border);
}

.dm-reaction--on,
.dm-reaction--on:hover {
	border-color: var(--color-primary);
	background-color: color-mix(in oklab, var(--color-primary) 16%, transparent);
}

.dm-reaction:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.dm-footer {
	@apply flex shrink-0 flex-col gap-2 px-4 pb-4;
}

.dm-no-reply {
	@apply flex min-h-11 cursor-not-allowed items-center gap-2.5 rounded-[8px] px-3.5 text-sm;
	background-color: var(--console-input);
	color: var(--ui-text-muted);
}
</style>
