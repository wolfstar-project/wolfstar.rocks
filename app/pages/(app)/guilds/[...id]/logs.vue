<template>
	<UDashboardPanel grow>
		<UDashboardNavbar title="Logs" />

		<div class="flex h-full flex-col p-4">
			<UTabs
				:items="tabs"
				:model-value="currentTabId"
				:unmount-on-hide="false"
				class="w-full"
				@update:model-value="onTabChange"
			>
				<template #moderation>
					<div class="mt-4">
						<LogsModerationLogTable :guild-id="guildId" />
					</div>
				</template>
				<template #warnings>
					<div class="mt-4">
						<LogsModerationLogTable :guild-id="guildId" warnings-only />
					</div>
				</template>
				<template #commands>
					<div class="mt-4">
						<LogsCommandLogTable :guild-id="guildId" />
					</div>
				</template>
				<template #activity>
					<div class="mt-4">
						<LogsDashboardActivityTable :guild-id="guildId" />
					</div>
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
	{ value: "moderation", label: "Moderation", slot: "moderation" },
	{ value: "warnings", label: "Warnings", slot: "warnings" },
	{ value: "commands", label: "Commands", slot: "commands" },
	{ value: "activity", label: "Dashboard Activity", slot: "activity" },
];

const currentTabId = computed(() => {
	const tab = route.params.tab;
	const raw = Array.isArray(tab) ? (tab[0] ?? "moderation") : tab || "moderation";
	return tabs.some((t) => t.value === raw) ? raw : "moderation";
});

function onTabChange(value: string | number) {
	router.replace(`/guilds/${guildId.value}/logs/${value}`);
}

useSeoMetadata({
	title: "Logs",
});
</script>
