<template>
	<UDrawer
		v-if="lines.length > 1"
		v-model:open="open"
		direction="bottom"
		:handle="false"
		:title="title"
		:description="`@${username} · ${when}`"
		:ui="{
			overlay: 'bg-black/66',
			content:
				'mx-auto max-h-[72%] w-150 max-w-full rounded-t-[14px] bg-(--popover-surface) shadow-(--popover-shadow) ring-0',
		}"
	>
		<button
			type="button"
			class="audit-changes-open"
			aria-haspopup="dialog"
			:aria-label="ts('guild_logs.changes.show_all', { count: lines.length })"
		>
			<UIcon name="ic:round-expand-less" class="size-4" aria-hidden="true" />
		</button>

		<template #content>
			<div
				class="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-(--field-border)"
				aria-hidden="true"
			></div>
			<header class="audit-changes-header">
				<UAvatar v-bind="avatar" size="md" class="shrink-0" />
				<div class="min-w-0 grow">
					<p class="truncate text-[0.9375rem] font-bold">{{ title }}</p>
					<p class="truncate text-xs text-muted">@{{ username }} · {{ when }}</p>
				</div>
				<UButton
					color="neutral"
					variant="ghost"
					icon="ic:round-close"
					class="size-8 justify-center rounded-[5px] text-muted"
					:aria-label="ts('guild_logs.changes.close')"
					@click="open = false"
				/>
			</header>
			<ul class="min-h-0 flex-auto overflow-auto px-4 pt-1 pb-4">
				<li
					v-for="line in lines"
					:key="`${line.kind}:${line.key}`"
					class="audit-changes-row"
				>
					<p class="mb-2 console-label">{{ line.label }}</p>
					<div class="flex flex-wrap items-center gap-2">
						<span class="audit-changes-from">{{
							line.fromText ?? ts("guild_logs.changes.none")
						}}</span>
						<span class="text-sm text-muted" aria-hidden="true">→</span>
						<span class="sr-only">{{ ts("guild_logs.changes.to") }}</span>
						<span class="audit-changes-to">{{
							line.toText ?? ts("guild_logs.changes.none")
						}}</span>
					</div>
				</li>
			</ul>
		</template>
	</UDrawer>
</template>

<script setup lang="ts">
import type { DashboardAuditEntry } from "#shared/types/audit-log";

/**
 * The button beside an activity row that changed several settings at once,
 * and the sheet it opens with every one of them, from the old value to the new.
 * An entry with a single change shows nothing: its row already says it all.
 */
const { entry, resolver } = defineProps<{
	entry: DashboardAuditEntry;
	/** Reads channel and role ids as their names. */
	resolver?: AuditChangeResolver;
}>();

const { ts } = useI18n();
const { locale } = useAppLocale();

const open = ref(false);

const lines = computed(() =>
	auditLogChangeLines(entry, resolver ?? { channels: new Map(), roles: new Map() }),
);
const title = computed(() => ts("guild_logs.changes.title", { count: lines.value.length }));
const avatar = computed(() => auditLogMemberAvatar(entry.member));
const username = computed(() => entry.member.user?.username ?? auditLogMemberName(entry.member));
const when = computed(() => formatActivityTime(entry.timestamp, new Date(), locale.value));
</script>

<style scoped>
@reference "@/assets/css/main.css";

.audit-changes-open {
	@apply inline-flex size-7.5 shrink-0 cursor-pointer items-center justify-center rounded-[6px] bg-transparent text-toned;
	border: 1px solid var(--field-border);
	transition: background-color 150ms ease;
}

.audit-changes-open:hover {
	background-color: var(--console-hover);
}

.audit-changes-open:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.audit-changes-header {
	@apply flex shrink-0 items-center gap-2.5 px-4 pt-2.5 pb-3;
	border-bottom: 1px solid var(--home-border-subtle);
}

.audit-changes-row {
	@apply py-3;
	border-bottom: 1px solid var(--home-border-subtle);
}

.audit-changes-from,
.audit-changes-to {
	@apply inline-block max-w-full rounded-[6px] px-2.25 py-0.75 text-[0.8125rem] leading-[1.4] wrap-anywhere;
}

.audit-changes-from {
	@apply text-toned;
	/* The sheet is portaled out of the dashboard, so it cannot read its tokens. */
	background-color: color-mix(in oklab, var(--color-base-content) 8%, transparent);
}

.audit-changes-to {
	@apply font-semibold text-highlighted;
	background-color: color-mix(in srgb, var(--color-primary) 16%, transparent);
	border: 1px solid color-mix(in srgb, var(--color-primary) 45%, transparent);
}
</style>
