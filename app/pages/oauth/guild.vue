<template>
	<div class="container mx-auto px-4 py-8">
		<template v-if="!guildId">
			<Alert variant="solid" color="error" title="Missing Guild ID" icon="emojione:warning">
				<template #description>
					Please use the <code>Login</code> button instead or click <NuxtLink to="/login" class="font-medium underline">here</NuxtLink>.
				</template>
			</Alert>
		</template>
		<template v-else-if="error">
			<Alert variant="solid" color="error" title="Authentication Error" icon="emojione:cross-mark">
				<template #description>
					{{ error }}
				</template>
				<template #actions>
					<Button to="/login" size="sm" variant="outline"> Return to Login </Button>
				</template>
			</Alert>
		</template>
		<template v-else>
			<Alert color="info" icon="emojione:hourglass-done" title="Redirecting">
				<template #description> Redirecting you to the guild page... </template>
			</Alert>
		</template>
	</div>
</template>

<script setup lang="ts">
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';

const route = useRoute();
const guildId = computed(() => (route.query.guildid as string) || null);
const error = ref<string | null>(null);

const { start, finish } = useLoadingIndicator({
	duration: 1500
});

// Handle redirect on both client and server
if (import.meta.client && guildId.value) {
	start();
	navigateToGuild();
}

async function navigateToGuild() {
	try {
		if (!guildId.value) {
			error.value = 'No guild ID provided';
			finish();
			return;
		}

		// Add any validation or additional checks here

		await navigateTo(`/guilds/${guildId.value}`);
	} catch (err) {
		error.value = 'Failed to navigate to guild page, please try again later.';
		console.error('Guild navigation error:', err);
	} finally {
		finish();
	}
}

useSeoMeta({
	title: 'Auth Guild Callback',
	robots: { none: true },
	ogTitle: 'OAuth Guild Callback',
	ogDescription: 'A landing page for the OAuth2.0 guild callback flow.'
});
</script>
