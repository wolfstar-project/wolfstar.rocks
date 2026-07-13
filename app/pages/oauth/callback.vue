<template>
	<div class="container mx-auto px-4 py-8">
		<h1 class="sr-only">OAuth Callback</h1>
		<h2 class="sr-only">Authentication Status</h2>
		<template v-if="!hasCallbackParams">
			<UAlert variant="solid" color="warning" title="Login Required" icon="twemoji:warning">
				<template #description>
					This page can't be accessed directly. Please
					<ULink to="/login" class="font-medium underline">sign in</ULink>
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
			<template v-if="isError">
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
			<template v-else-if="!ready">
				<UAlert color="info" icon="emojione:hourglass-done" title="Signing You In">
					<template #description> Connecting to Discord... </template>
				</UAlert>
			</template>
			<template v-else-if="user">
				<UAlert color="success" icon="twemoji:check-mark" :title="`Welcome ${user.name}!`">
					<template #description> Redirecting you to the dashboard... </template>
				</UAlert>
			</template>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import { promiseTimeout } from "@vueuse/core";

definePageMeta({
	viewTransition: false,
});

const route = useRoute();
const nextParam = useRouteQuery("next", "/", { transform: String });
const log = useLogger("oauth:callback");

// Better Auth already completed the Discord code exchange and set the
// session cookie server-side before redirecting the browser here — this page
// only has to wait for the session to hydrate, then continue on to `next`.
const { user, ready, loggedIn, fetch: fetchSession } = useAuth();

const hasCallbackParams = computed(() => Boolean(route.query.next || route.query.error));

if (import.meta.client && !route.query.error) {
	void performCall().catch(log.error);
}

async function performCall() {
	if (!ready.value) {
		await fetchSession();
	}

	if (!loggedIn.value) {
		return;
	}

	await promiseTimeout(seconds(2));

	const safeNext = isSafeRedirectPath(nextParam.value) ? nextParam.value : "/";

	// Full page navigation ensures SSR reads the fresh session cookie, so the
	// target page renders with the correct authenticated state.
	await navigateTo(safeNext, {
		external: true,
		replace: true,
	});
}

const errorMessage = computed(
	() => route.query.error ?? "Something went wrong while signing you in. Please try again.",
);

const isError = computed(() => Boolean(route.query.error));

useRobotsRule(robotBlockingPageProps);
useSeoMeta({
	ogDescription: "A landing page for the OAuth2.0 callback flow, use the Login button instead.",
	ogTitle: "OAuth Callback",
	robots: { none: true },
	title: "Auth Callback",
});
</script>
