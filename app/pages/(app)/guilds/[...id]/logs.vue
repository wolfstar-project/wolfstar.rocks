<template>
	<UDashboardPanel id="home">
		<template #header>
			<UDashboardNavbar :title="ts('guild_logs.title')" :ui="{ right: 'gap-3' }">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<UTabs
				v-model="activeTab"
				:items="tabs"
				:unmount-on-hide="false"
				class="w-full"
				:ui="{ list: 'px-4' }"
			>
				<template #content="{ item }">
					<div class="mt-4">
						<GuildLogsModerationLogTable v-if="item.value === 'moderation'" />
						<GuildLogsModerationLogTable
							v-else-if="item.value === 'warnings'"
							warnings-only
						/>
						<GuildLogsCommandLogTable v-else-if="item.value === 'commands'" />
						<GuildLogsDashboardActivityTable v-else-if="item.value === 'activity'" />
					</div>
				</template>
			</UTabs>
		</template>
	</UDashboardPanel>
</template>

<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import { useRouteParams } from "@vueuse/router";

definePageMeta({
	auth: "user",
	layout: "dashboard",
	path: "/guilds/:id/logs/:tab(moderation|warnings|commands|activity)?",
});

const { ts } = useI18n();
const router = useRouter();

const tab = useRouteParams("tab", "moderation", { transform: String });
const guildId = useRouteParams("id", undefined, { transform: String });

const tabs = computed<TabsItem[]>(() => [
	{ value: "moderation", label: ts("guild_logs.tab_moderation") },
	{ value: "warnings", label: ts("guild_logs.tab_warnings") },
	{ value: "commands", label: ts("guild_logs.tab_commands") },
	{ value: "activity", label: ts("guild_logs.tab_activity") },
]);

const activeTab = computed({
	get() {
		if (tabs.value.some((t) => t.value === tab.value)) {
			return tab.value;
		}
		return "moderation";
	},
	set(value: string | number) {
		router.replace(`/guilds/${guildId.value}/logs/${value}`);
	},
});

useSeoMetadata({
	title: () => ts("guild_logs.title"),
});
</script>
