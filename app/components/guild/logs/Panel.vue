<template>
	<UTabs
		v-model="logsTab"
		:items="tabs"
		:unmount-on-hide="false"
		class="w-full"
		:ui="{ list: 'px-4' }"
	>
		<template #content="{ item }">
			<div class="mt-4">
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
