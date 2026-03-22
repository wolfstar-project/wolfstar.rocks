<template>
	<div class="container mx-auto px-4 py-8">
		<h1 class="sr-only">OAuth Callback</h1>
		<h2 class="sr-only">Authentication Status</h2>
		<template v-if="!code">
			<UAlert variant="solid" color="warning" title="Login Required" icon="twemoji:warning">
				<template #description>
					This page can't be accessed directly. Please
					<ULink to="/login" class="font-medium underline">log in</ULink>
					to continue.
				</template>
				<template #actions>
					<UButton color="neutral" variant="ghost" to="/login" size="sm">
						Go to Login
					</UButton>
				</template>
			</UAlert>
		</template>
		<ClientOnly v-else>
			<template v-if="isPending">
				<UAlert color="info" icon="emojione:hourglass-done" title="Signing You In">
					<template #description> Connecting to Discord... </template>
				</UAlert>
			</template>
			<template v-else-if="isError">
				<UAlert color="error" title="Sign-In Failed" icon="twemoji:cross-mark">
					<template #description>
						{{ errorMessage }}
					</template>
					<template #actions>
						<UButton color="neutral" variant="ghost" to="/login" size="sm">
							Try Again
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
					<template #description> Redirecting you to the dashboard... </template>
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


	// Stop if the token exchange failed — the error UI will be shown
	if (error.value) {
		return;
	}


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


	// Full page navigation ensures SSR reads the fresh session cookie,
	// so the target page renders with the correct authenticated state.
	await navigateTo(redirectUrl, {
		external: true,
		replace: true,
	});
}


const errorMessage = computed(() => {
	if (route.query.error) {
		return route.query.error;
	}

	return error.value
		? (error.value.message ?? error.value.cause)
		: "Something went wrong while signing you in. Please try again.";
});


const isPending = computed(() => status.value === "pending");
const isError = computed(() => status.value === "error");
const isSuccess = computed(() => status.value === "success");


useRobotsRule(robotBlockingPageProps);
useSeoMeta({
	ogDescription: "A landing page for the OAuth2.0 callback flow, use the Login button instead.",
	ogTitle: "OAuth Callback",
	robots: { none: true },
	title: "Auth Callback",
});
</script>
