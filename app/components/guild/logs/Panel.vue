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
		:ui="{ list: 'justify-start border-b border-(--home-border-subtle)', content: 'pt-4' }"
	>
		<template #content="{ item }">
			<div class="logs-card console-card p-0!">
				<GuildLogsModerationLogTable v-if="item.value === 'moderation'" />
				<GuildLogsModerationLogTable v-else-if="item.value === 'warnings'" warnings-only />
				<GuildLogsCommandLogTable v-else-if="item.value === 'commands'" />
				<GuildLogsDashboardActivityTable v-else-if="item.value === 'activity'" />
			</div>
		</template>
	</UTabs>
</template>

<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const { ts } = useI18n();
const { logsTab } = useActiveGuild();

const tabs = computed<TabsItem[]>(() => [
	{ value: "moderation", label: ts("guild_logs.tab_moderation") },
	{ value: "warnings", label: ts("guild_logs.tab_warnings") },
	{ value: "commands", label: ts("guild_logs.tab_commands") },
	{ value: "activity", label: ts("guild_logs.tab_activity") },
]);
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The tables are generated, so their header cells are styled from here. */
.logs-card :deep(thead th) {
	@apply text-[0.6875rem] font-bold tracking-[0.06em] uppercase;
	color: var(--ui-text-muted);
}
</style>
