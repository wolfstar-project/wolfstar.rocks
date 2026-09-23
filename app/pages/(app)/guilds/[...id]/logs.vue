<template>
	<div
		class="flex min-h-screen items-center justify-center"
		role="status"
		:aria-label="ts('dashboard.loading_aria')"
	>
		<UIcon name="heroicons:arrow-path" class="size-8 animate-spin text-primary" />
	</div>
</template>

<script setup lang="ts">
/** Legacy route: the logs now live in the Logs section of `/app`. */
definePageMeta({
	auth: "user",
	layout: false,
	path: "/guilds/:id/logs/:tab(moderation|warnings|commands|activity)?",
	viewTransition: false,
});

const { ts } = useI18n();
const route = useRoute();
const { logsTab, selectGuild, setSection } = useActiveGuild();

if (import.meta.client) {
	const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
	const tab = Array.isArray(route.params.tab) ? route.params.tab[0] : route.params.tab;
	selectGuild(id ?? null);
	setSection("logs");
	if (tab) {
		logsTab.value = tab;
	}
	await navigateTo({ path: "/app", query: route.query }, { replace: true });
}
</script>
