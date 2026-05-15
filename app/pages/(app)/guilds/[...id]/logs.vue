<template>
	<UDashboardPanel grow>
		<UDashboardNavbar title="Logs" />

		<div class="flex h-full flex-col p-4">
			<UTabs
				:items="tabs"
				:default-index="defaultTabIndex"
				@change="onTabChange"
				class="w-full"
			>
				<template #item="{ item }">
					<KeepAlive>
						<div class="mt-4">
							<LogsModerationLogTable
								v-if="item.id === 'moderation'"
								:guild-id="guildId"
							/>
							<LogsModerationLogTable
								v-else-if="item.id === 'warnings'"
								:guild-id="guildId"
								warnings-only
							/>
							<LogsCommandLogTable
								v-else-if="item.id === 'commands'"
								:guild-id="guildId"
							/>
							<LogsDashboardActivityTable
								v-else-if="item.id === 'activity'"
								:guild-id="guildId"
							/>
						</div>
					</KeepAlive>
				</template>
			</UTabs>
		</div>
	</UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
	auth: { required: true },
	layout: "dashboard",
	path: "/guilds/:id/logs/:tab(moderation|warnings|commands|activity)?",
});

const route = useRoute();
const router = useRouter();

const guildId = computed(() => {
	const id = route.params.id;
	return Array.isArray(id) ? id[0] : id;
});

const tabs = [
	{ id: "moderation", label: "Moderation" },
	{ id: "warnings", label: "Warnings" },
	{ id: "commands", label: "Commands" },
	{ id: "activity", label: "Dashboard Activity" },
];

const currentTabId = computed(() => {
	const tab = route.params.tab;
	return Array.isArray(tab) ? tab[0] : tab || "moderation";
});

const defaultTabIndex = computed(() => {
	const index = tabs.findIndex((t) => t.id === currentTabId.value);
	return index !== -1 ? index : 0;
});

function onTabChange(index: number) {
	const tab = tabs[index];
	if (tab) {
		router.replace(`/guilds/${guildId.value}/logs/${tab.id}`);
	}
}

useSeoMetadata({
	title: "Logs",
});
</script>
