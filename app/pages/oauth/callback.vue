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
			<template v-if="isError && !isRetryingSilentAuth">
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
			<template v-else-if="isSessionLoading || !ready">
				<UAlert color="info" icon="emojione:hourglass-done" title="Signing You In">
					<template #description> Connecting to Discord... </template>
				</UAlert>
			</template>
			<template v-else-if="user">
				<UAlert color="success" icon="twemoji:check-mark" :title="`Welcome ${user.name}!`">
					<template #description> Redirecting you to the dashboard... </template>
				</UAlert>
			</template>
			<template v-else-if="isSessionMissing">
				<UAlert color="error" title="Session Not Found" icon="twemoji:cross-mark">
					<template #description>
						Your login session could not be loaded. Please sign in again.
					</template>
					<template #actions>
						<UButton color="neutral" variant="ghost" to="/login" size="sm">
							Try Again
						</UButton>
					</template>
				</UAlert>
			</template>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import {
	consumeBotOauthNext,
	isBotOauthSilentAuthError,
	peekBotOauthNext,
	rememberBotOauthNext,
} from "#shared/utils/bot-oauth";
import { promiseTimeout } from "@vueuse/core";

definePageMeta({
	viewTransition: false,
});

const route = useRoute();
const nextParam = useRouteQuery("next", "/", { transform: String });
const log = useLogger("oauth:callback");
const isSessionMissing = ref(false);
const isRetryingSilentAuth = ref(false);

// Better Auth has already completed the Discord code exchange and set the
// session cookie server-side before redirecting the browser here — unless this
// visit is the sapphire bridge hop (`?code=` without Better Auth `state`).
const { user, ready, loggedIn, fetchSession } = useUserSession();

const oauthCode = computed(() => {
	const value = route.query.code;
	const code = Array.isArray(value) ? value[0] : value;
	return typeof code === "string" && code.length > 0 ? code : null;
});

const hasCallbackParams = computed(() =>
	Boolean(route.query.next || route.query.error || oauthCode.value),
);
const isError = computed(() => Boolean(route.query.error) && !oauthCode.value);
const isSessionLoading = ref(!isError.value);
const errorMessage = computed(
	() => route.query.error ?? "Something went wrong while signing you in. Please try again.",
);

onMounted(() => {
	void completeSignIn();
});

async function completeSignIn() {
	try {
		// Legacy sapphire hop: Discord returned a code without Better Auth state.
		// POST it to the bot API so `SAPPHIRE_AUTH` is set on that origin.
		if (oauthCode.value) {
			await completeBotOauthCallback(oauthCode.value);
			await fetchSession({ force: true });

			if (!loggedIn.value) {
				isSessionMissing.value = true;
				return;
			}

			isSessionLoading.value = false;
			await promiseTimeout(seconds(2));

			const safeNext = consumeBotOauthNext(
				isSafeRedirectPath(nextParam.value) ? nextParam.value : "/",
			);
			await navigateTo(safeNext, {
				external: true,
				replace: true,
			});
			return;
		}

		const discordError = Array.isArray(route.query.error)
			? route.query.error[0]
			: route.query.error;
		if (typeof discordError === "string" && discordError.length > 0) {
			// Silent `prompt=none` often fails once; retry with a consent screen
			// when we still have a pending post-login redirect.
			if (isBotOauthSilentAuthError(discordError) && peekBotOauthNext()) {
				isRetryingSilentAuth.value = true;
				await navigateTo(buildBotOauthAuthorizeUrl("consent"), {
					external: true,
					replace: true,
				});
				return;
			}
			return;
		}

		await fetchSession({ force: true });

		if (!loggedIn.value) {
			isSessionMissing.value = true;
			return;
		}

		// Session is ready: stop showing the loading state now so the welcome
		// banner is visible during the delay below, instead of only appearing
		// after navigation has already started.
		isSessionLoading.value = false;

		const safeNext = isSafeRedirectPath(nextParam.value) ? nextParam.value : "/";

		// Better Auth owns the dashboard session; sapphire owns API auth.
		// If the browser does not yet have `SAPPHIRE_AUTH` on the bot origin,
		// run a silent Discord authorize and POST the code to
		// `${apiBaseUrl}/oauth/callback` (legacy Skyra flow).
		if (!(await hasBotOauthSession())) {
			rememberBotOauthNext(safeNext);
			await navigateTo(buildBotOauthAuthorizeUrl("none"), {
				external: true,
				replace: true,
			});
			return;
		}

		await promiseTimeout(seconds(2));

		// Full page navigation ensures SSR reads the fresh session cookie, so the
		// target page renders with the correct authenticated state.
		await navigateTo(safeNext, {
			external: true,
			replace: true,
		});
	} catch (error) {
		isSessionMissing.value = true;
		log.error(error);
	} finally {
		isSessionLoading.value = false;
	}
}

useRobotsRule(robotBlockingPageProps);
useSeoMeta({
	ogDescription: "A landing page for the OAuth callback flow, use the Login button instead.",
	ogTitle: "OAuth Callback",
	robots: { none: true },
	title: "Auth Callback",
});
</script>
