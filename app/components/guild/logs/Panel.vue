<template>
	<DashboardPageHeader
		:title="ts('guild_logs.page_title')"
		:description="ts('guild_logs.page_subtitle')"
	/>

	<UTabs
		v-model="logsTab"
		:items="tabs"
		variant="link"
		:unmount-on-hide="false"
		class="w-full gap-0"
		:aria-label="ts('guild_logs.tabs_aria')"
		:ui="{
			list: 'justify-start gap-1 overflow-x-auto border-b border-(--home-border-subtle) p-0',
			trigger:
				'min-h-11 shrink-0 gap-2 px-3.5 text-[0.9375rem] font-normal data-[state=active]:font-bold data-[state=active]:text-highlighted',
			content: 'pt-4',
		}"
	>
		<template #trailing="{ item }">
			<span v-if="counts[item.value] !== null" class="font-mono text-[0.6875rem] text-muted">
				{{ counts[item.value] }}
			</span>
		</template>
		<template #content="{ item }">
			<GuildLogsModerationLogTable v-if="item.value === 'moderation'" />
			<GuildLogsModerationLogTable v-else-if="item.value === 'warnings'" warnings-only />
			<GuildLogsCommandLogTable v-else-if="item.value === 'commands'" />
			<GuildLogsDashboardActivityTable v-else-if="item.value === 'activity'" />
		</template>
	</UTabs>
</template>

<script setup lang="ts">
type LogsTab = "moderation" | "warnings" | "commands" | "activity";

const { ts } = useI18n();
const { logsTab } = useActiveGuild();
const { guildData } = useGuildData();

const tabs = computed<{ value: LogsTab; label: string }[]>(() => [
	{ value: "moderation", label: ts("guild_logs.tab_moderation") },
	{ value: "warnings", label: ts("guild_logs.tab_warnings") },
	{ value: "commands", label: ts("guild_logs.tab_commands") },
	{ value: "activity", label: ts("guild_logs.tab_activity") },
]);

// One entry is enough to learn how many each log holds: the count rides on
// every answer, and the tab that is open shares this request's cache key
// family with its own table.
const guildId = computed(() => guildData.value?.id);
const moderation = useModerationLog({ guildId, limit: 1 });
const warnings = useModerationLog({ guildId, limit: 1, filters: { typeCode: 1 } });
const commands = useCommandLog({ guildId, limit: 1 });
const activity = useAuditLog({ guildId, limit: 1 });

function settled(source: { status: Ref<string>; total: Ref<number> }): number | null {
	return source.status.value === "success" ? source.total.value : null;
}

const counts = computed<Record<LogsTab, number | null>>(() => ({
	activity: settled(activity),
	commands: settled(commands),
	moderation: settled(moderation),
	warnings: settled(warnings),
}));
</script>
