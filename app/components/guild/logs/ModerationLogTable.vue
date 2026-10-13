<template>
	<GuildLogsShell
		v-model:search="query"
		v-model:page="page"
		:status="status"
		:total="total"
		:shown="rows.length"
		:page-size="limit"
		:refresh-label="ts('guild_logs.refresh_moderation')"
		empty-icon="ic:round-gavel"
		:empty-title="
			warningsOnly ? ts('guild_logs.no_warnings') : ts('guild_logs.no_moderation_cases')
		"
		:empty-description="isFiltered ? ts('guild_logs.no_filter_match') : undefined"
		@refresh="refresh()"
	>
		<template v-if="!warningsOnly" #filter>
			<USelect
				v-model="selectedTypeCode"
				:items="actionTypeItems"
				:aria-label="ts('guild_logs.filter_action')"
				:ui="LOGS_FILTER_UI"
			/>
		</template>

		<div
			class="logs-table hidden md:block"
			role="table"
			:aria-label="tableLabel"
			:style="tableStyle"
		>
			<div class="logs-grid" role="rowgroup">
				<div class="logs-head" role="row">
					<span role="columnheader">{{ ts("guild_logs.columns.case") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.user") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.moderator") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.action") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.reason") }}</span>
					<span v-if="!warningsOnly" role="columnheader">
						{{ ts("guild_logs.columns.duration") }}
					</span>
					<span role="columnheader">{{ ts("guild_logs.columns.date") }}</span>
				</div>
				<div v-for="row in rows" :key="row.caseId" class="logs-row" role="row">
					<span class="logs-case" role="cell">#{{ row.caseId }}</span>
					<div class="logs-member" role="cell">
						<UAvatar v-bind="row.targetAvatar" size="xs" class="shrink-0" />
						<span class="truncate text-sm font-semibold">{{ row.target }}</span>
					</div>
					<div class="logs-member" role="cell">
						<UAvatar v-bind="row.moderatorAvatar" size="xs" class="shrink-0" />
						<span class="truncate text-sm">{{ row.moderator }}</span>
					</div>
					<span role="cell">
						<GuildLogsPill :tone="row.tone">{{ row.action }}</GuildLogsPill>
					</span>
					<span
						class="truncate text-[0.8125rem] text-toned"
						role="cell"
						:title="row.reason"
					>
						{{ row.reason }}
					</span>
					<span v-if="!warningsOnly" class="logs-mono" role="cell">{{
						row.duration
					}}</span>
					<time
						class="logs-mono"
						role="cell"
						:datetime="row.datetime"
						:title="row.fullDate"
					>
						{{ row.at }}
					</time>
				</div>
			</div>
		</div>

		<ul class="logs-table md:hidden" :aria-label="tableLabel">
			<li v-for="row in rows" :key="row.caseId" class="logs-card">
				<div class="logs-line">
					<span class="logs-case">#{{ row.caseId }}</span>
					<div class="logs-member">
						<UAvatar v-bind="row.targetAvatar" size="xs" class="shrink-0" />
						<span class="truncate text-sm font-semibold">{{ row.target }}</span>
					</div>
					<span class="grow"></span>
					<GuildLogsPill :tone="row.tone">{{ row.action }}</GuildLogsPill>
				</div>
				<span class="block text-[0.8125rem] leading-[1.45] text-toned">{{
					row.reason
				}}</span>
				<div class="logs-line">
					<span class="truncate text-xs text-muted">
						{{ ts("guild_logs.by_moderator", { name: row.moderator }) }}
					</span>
					<span class="grow"></span>
					<span v-if="!warningsOnly" class="logs-mono">{{ row.duration }}</span>
					<time class="logs-mono" :datetime="row.datetime" :title="row.fullDate">
						{{ row.at }}
					</time>
				</div>
			</li>
		</ul>
	</GuildLogsShell>
</template>

<script setup lang="ts">
import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { LogsPillTone } from "./Pill.vue";
import { MODERATION_TYPE_FILTER_VALUES } from "#shared/types/moderation-types";

const { warningsOnly } = defineProps<{
	warningsOnly?: boolean;
}>();

const { guildData } = useGuildData();
const { ts } = useI18n();
const { locale } = useAppLocale();

const page = ref(1);
const limit = ref(LOGS_PAGE_SIZE);
const offset = computed(() => (page.value - 1) * limit.value);

const filters = ref<{ q?: string; typeCode?: number }>({});
if (warningsOnly) {
	filters.value.typeCode = 1;
}

const selectedTypeCode = ref<number | null>(null);
const actionTypeItems = computed(() => [
	{ label: ts("guild_logs.all_actions"), value: null },
	...MODERATION_TYPE_FILTER_VALUES,
]);

watch(selectedTypeCode, (value) => {
	filters.value.typeCode = value ?? undefined;
	page.value = 1;
});

const query = ref("");
const debouncedQuery = refDebounced(query, 300);
watch(debouncedQuery, (value) => {
	filters.value.q = value || undefined;
	page.value = 1;
});

const isFiltered = computed(() => Boolean(debouncedQuery.value) || selectedTypeCode.value !== null);

const guildId = computed(() => guildData.value?.id);
const { entries, total, status, refresh } = useModerationLog({
	guildId,
	limit,
	offset,
	filters,
});

const tableLabel = computed(() =>
	warningsOnly ? ts("guild_logs.tab_warnings") : ts("guild_logs.tab_moderation"),
);

const tableStyle = computed(() =>
	warningsOnly
		? {
				"--logs-columns":
					"3.25rem minmax(0, 1.1fr) minmax(0, 1fr) 8rem minmax(0, 1.8fr) 7.5rem",
				"--logs-min-width": "51.25rem",
			}
		: {
				"--logs-columns":
					"3.25rem minmax(0, 1.1fr) minmax(0, 1fr) 7.5rem minmax(0, 1.6fr) 5.75rem 7.5rem",
				"--logs-min-width": "56.25rem",
			},
);

// Punishments that hold until someone lifts them when no duration was given.
const OPEN_ENDED_TYPES = new Set<string>([
	"Ban",
	"Mute",
	"VoiceMute",
	"RestrictedReaction",
	"RestrictedEmbed",
	"RestrictedAttachment",
	"RestrictedVoice",
	"RestrictedEmoji",
]);

function durationLabel(entry: ModerationLogEntry): string {
	// The table stores seconds, and `0` for a case that is not temporary.
	if (entry.duration > 0) return formatCompactDuration(entry.duration * 1000);
	return !entry.metadata.undo && OPEN_ENDED_TYPES.has(entry.typeName)
		? ts("guild_logs.permanent")
		: "\u2013";
}

const now = new Date();

const rows = computed(() =>
	entries.value.map((entry) => {
		const { metadata, typeName } = entry;
		const created = entry.createdAt ? new Date(entry.createdAt) : null;
		const target = entry.targetMember?.user?.username;
		return {
			// A case that reverses another one (an unban, an unmute) carries the
			// same type with the undo flag, so it is told apart here.
			action: metadata.undo ? ts("guild_logs.undo_action", { action: typeName }) : typeName,
			at: created ? formatActivityTime(created, now, locale.value) : "\u2013",
			caseId: entry.caseId,
			datetime: entry.createdAt ?? undefined,
			duration: durationLabel(entry),
			fullDate: created?.toLocaleString(locale.value),
			moderator: entry.moderatorMember
				? auditLogMemberName(entry.moderatorMember)
				: ts("guild_logs.unknown"),
			moderatorAvatar: auditLogMemberAvatar(entry.moderatorMember),
			reason: entry.reason ?? ts("guild_logs.no_reason"),
			target: target ? `@${target}` : ts("guild_logs.unknown"),
			targetAvatar: auditLogMemberAvatar(entry.targetMember),
			tone: (metadata.undo ? "success" : moderationActionVariant(typeName)) as LogsPillTone,
		};
	}),
);
</script>
