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
/**
 * Legacy route. The dashboard lives at `/app` and keeps the guild in state, so
 * this page only records which guild and section the old link pointed at and
 * moves on. It renders a spinner on the server: the state can only be set in
 * the browser.
 */
definePageMeta({
	auth: "user",
	layout: false,
	path: "/guilds/:id/manage/:slug(.*)*",
	viewTransition: false,
});

const { ts } = useI18n();
const route = useRoute();
const { selectGuild, setSection } = useActiveGuild();

if (import.meta.client) {
	const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
	const slug = Array.isArray(route.params.slug) ? route.params.slug.join("/") : route.params.slug;
	selectGuild(id ?? null);
	setSection(slug ?? "");
	await navigateTo({ path: "/app", query: route.query }, { replace: true });
}
</script>
