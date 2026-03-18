<template>
	<div class="container mx-auto px-4 py-8">
		<h1 class="sr-only">Guild OAuth Callback</h1>
		<h2 class="sr-only">Guild Setup Status</h2>
		<template v-if="!guildId">
			<UAlert variant="solid" color="error" title="Server Not Found" icon="emojione:warning">
				<template #description>
					We couldn't determine which server to set up. Please
					<NuxtLink to="/login" class="font-medium underline">log in</NuxtLink>
					and select a server from your dashboard.
				</template>
			</UAlert>
		</template>
		<ClientOnly v-else>
			<template v-if="error">
				<UAlert
					variant="solid"
					color="error"
					title="Setup Failed"
					icon="emojione:cross-mark"
				>
					<template #description>
						{{ error }}
					</template>
					<template #actions>
						<UButton to="/login" size="sm" variant="outline"> Return to Login </UButton>
					</template>
				</UAlert>
			</template>
			<template v-else>
				<UAlert color="info" icon="emojione:hourglass-done" title="Redirecting">
					<template #description> Taking you to the server dashboard... </template>
				</UAlert>
			</template>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import { isNullOrUndefined } from "@sapphire/utilities/isNullOrUndefined";
import { promiseTimeout } from "@vueuse/core";

const guildId = useRouteParams("id", null, { transform: String });
const error = ref<string | null>(null);

if (import.meta.client && guildId.value && !error.value) {
	navigateToGuild().catch(logger.error);
}

async function navigateToGuild() {
	if (isNullOrUndefined(guildId.value)) {
		throw createError({ status: 400, statusText: "Guild ID is required." });
	}

	await promiseTimeout(1500);

	await navigateTo(`/guilds/${guildId.value}/manage`);
}

useRobotsRule(robotBlockingPageProps);
useSeoMeta({
	ogDescription: "A landing page for the OAuth2.0 guild callback flow.",
	ogTitle: "OAuth Guild Callback",
	robots: { none: true },
	title: "Auth Guild Callback",
});
</script>
