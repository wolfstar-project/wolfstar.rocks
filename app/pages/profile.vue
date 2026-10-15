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
 * @deprecated `/profile` (and its `/account` alias) no longer exists as a page.
 * The server list is the picker of `/app`, and the local preferences it used
 * to host are the dialog `usePreferencesDialog()` opens from the header.
 *
 * The route rules in `nuxt.config.ts` answer a document request with a
 * redirect before this renders. The page stays so the paths still resolve for
 * a client-side navigation from a cached or external link.
 */
definePageMeta({
	alias: ["/account"],
	layout: false,
	viewTransition: false,
});

const { ts } = useI18n();

await navigateTo("/app", { replace: true });
</script>
