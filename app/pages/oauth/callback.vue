<template>
	<div class="container mx-auto px-4 py-8">
		<template v-if="!code">
			<UAlert variant="solid" color="warning" title="Missing Code" icon="twemoji:warning">
				<template #description>
					Please use the <code>Login</code> button instead or click
					<ULink to="/login" class="font-medium underline">here</ULink>.
				</template>
				<template #actions>
					<UButton color="neutral" variant="ghost" to="/login" size="sm">
						Return to Login
					</UButton>
				</template>
			</UAlert>
		</template>
		<ClientOnly v-else>
			<template v-if="isPending">
				<UAlert color="info" icon="emojione:hourglass-done" title="Loading">
					<template #description> Completing authentication flow... </template>
				</UAlert>
			</template>
			<template v-else-if="isError">
				<UAlert color="error" title="Authentication Error" icon="twemoji:cross-mark">
					<template #description>
						{{ errorMessage }}
					</template>
					<template #actions>
						<UButton color="neutral" variant="ghost" to="/login" size="sm">
							Try again clicking here
						</UButton>
					</template>
				</UAlert>
			</template>
			<template v-else-if="isSuccess">
				<UAlert
					color="success"
					icon="twemoji:check-mark"
					:title="`Welcome ${user!.username}!`"
				>
					<template #description>
						You will be redirected to the main page in a moment.
					</template>
				</UAlert>
			</template>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import { promiseTimeout } from "@vueuse/core";

const code = useRouteQuery("code", null, { transform: String });
const state = useRouteQuery("state", undefined, { transform: String });
const { user, refreshSession } = useAuth();

const route = useRoute();

const { error, status, execute } = useFetch("/api/auth/discord", {
	immediate: false,
	key: "callback",
	method: "GET",
	query: {
		code,
	},
	server: false,
});

if (import.meta.client && code) {
	void performCall().catch(logger.error);
}

async function performCall() {
	await execute();

	// Refresh client-side session state so the user data is reactive immediately
	await refreshSession();

	await promiseTimeout(seconds(2));

	// Verify the OAuth state server-side and retrieve the stored redirect URL.
	// The server reads the nonce + oauth_redirect cookies set during initiation,
	// verifies the HMAC signature, and returns the safe destination URL.
	let redirectUrl = "/";
	if (state.value) {
		try {
			const data = await $fetch<{ redirectUrl: string }>("/api/auth/verify-state", {
				query: { state: state.value },
			});
			redirectUrl = data.redirectUrl ?? "/";
		} catch {
			redirectUrl = "/";
		}
	}

	await navigateTo(redirectUrl, {
		redirectCode: 302,
		replace: true,
	});
}

const errorMessage = computed(() => {
	if (route.query.error) {
		return route.query.error;
	}

	return error.value
		? (error.value.message ?? error.value.cause)
		: "An error occurred during authentication";
});

const isPending = computed(() => status.value === "pending");
const isError = computed(() => status.value === "error");
const isSuccess = computed(() => status.value === "success");

useSeoMetadata({
	description: "A landing page for the OAuth2.0 callback flow, use the Login button instead.",
	ogImage: {
		description: "A landing page for the OAuth2.0 callback flow",
		theme: Colors.Blue,
	},
	title: "OAuth Callback",
});
</script>
