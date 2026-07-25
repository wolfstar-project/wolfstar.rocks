<template>
	<div class="container mx-auto px-4 py-8">
		<h1 class="sr-only">Guild OAuth Callback</h1>
		<h2 class="sr-only">Guild Setup Status</h2>
		<template v-if="!guildId">
			<StarAlert
				variant="solid"
				color="error"
				title="Server Not Found"
				icon="emojione:warning"
			>
				<template #description>
					We couldn't determine which server to set up. Please
					<NuxtLink to="/login" class="font-medium underline">sign in</NuxtLink>
					and select a server from your dashboard.
				</template>
			</StarAlert>
		</template>
		<ClientOnly v-else>
			<template v-if="error">
				<StarAlert
					variant="solid"
					color="error"
					title="Setup Failed"
					icon="emojione:cross-mark"
				>
					<template #description>
						{{ error }}
					</template>
					<template #actions>
						<StarButton to="/login" size="sm" variant="outline">
							Return to Login
						</StarButton>
					</template>
				</StarAlert>
			</template>
			<template v-else>
				<StarAlert color="info" icon="emojione:hourglass-done" title="Redirecting">
					<template #description> Taking you to the server dashboard... </template>
				</StarAlert>
			</template>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import { promiseTimeout } from "@vueuse/core";
import { normalizeGuildIdQuery } from "~/utils/normalize-guild-id-query";

definePageMeta({
	viewTransition: false,
});

const guildId = useRouteQuery("guild_id", undefined, { transform: normalizeGuildIdQuery });
const error = ref<string | null>(null);
const log = useLogger("oauth:guild");

if (import.meta.client && guildId.value && !error.value) {
	navigateToGuild().catch(log.error);
}

async function navigateToGuild() {
	if (!guildId.value) {
		throw createError({ status: 400, statusText: "Guild ID is required." });
	}

	await promiseTimeout(1500);

	await navigateTo(`/guilds/${guildId.value}/manage?refresh=true`);
}

useRobotsRule(robotBlockingPageProps);
useSeoMeta({
	ogDescription: "A landing page for the OAuth2.0 guild callback flow.",
	ogTitle: "OAuth Guild Callback",
	robots: { none: true },
	title: "Auth Guild Callback",
});
</script>
