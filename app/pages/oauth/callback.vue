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
	decodeBotOauthState,
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

// Better Auth already set the session cookie unless this is the sapphire hop
// (`?code=` without Better Auth `state`).
const { user, ready, loggedIn, fetchSession } = useUserSession();

const oauthCode = computed(() => {
	const value = route.query.code;
	const code = Array.isArray(value) ? value[0] : value;
	return typeof code === "string" && code.length > 0 ? code : null;
});

const oauthState = computed(() => {
	const value = route.query.state;
	const state = Array.isArray(value) ? value[0] : value;
	return typeof state === "string" && state.length > 0 ? state : null;
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

function resolvePostLoginNext(): string {
	const fromState = decodeBotOauthState(oauthState.value);
	const fromQuery = isSafeRedirectPath(nextParam.value) ? nextParam.value : "/";
	return consumeBotOauthNext(fromState ?? fromQuery);
}

async function redirectToPostLoginNext(): Promise<void> {
	isSessionLoading.value = false;
	await promiseTimeout(seconds(2));
	await navigateTo(resolvePostLoginNext(), {
		external: true,
		replace: true,
	});
}

async function completeSignIn() {
	try {
		// Sapphire hop: exchange Discord code for `SAPPHIRE_AUTH` on the bot origin.
		// Best-effort — Better Auth already owns the dashboard session, so a bot
		// cookie failure must not strand the user on this page.
		if (oauthCode.value) {
			try {
				await completeBotOauthCallback(oauthCode.value);
			} catch (error) {
				log.error(error);
			}

			await fetchSession({ force: true });

			if (!loggedIn.value) {
				isSessionMissing.value = true;
				return;
			}

			await redirectToPostLoginNext();
			return;
		}

		const discordError = Array.isArray(route.query.error)
			? route.query.error[0]
			: route.query.error;
		if (typeof discordError === "string" && discordError.length > 0) {
			// Retry silent-auth failures with consent when a post-login redirect is pending.
			const pendingNext =
				peekBotOauthNext() ??
				decodeBotOauthState(oauthState.value) ??
				(isSafeRedirectPath(nextParam.value) ? nextParam.value : null);
			if (isBotOauthSilentAuthError(discordError) && pendingNext) {
				isRetryingSilentAuth.value = true;
				rememberBotOauthNext(pendingNext);
				await navigateTo(buildBotOauthAuthorizeUrl("consent", pendingNext), {
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

		const safeNext = isSafeRedirectPath(nextParam.value) ? nextParam.value : "/";

		// Bridge a Discord code to the bot API when `SAPPHIRE_AUTH` is missing.
		if (!(await hasBotOauthSession())) {
			rememberBotOauthNext(safeNext);
			await navigateTo(buildBotOauthAuthorizeUrl("none", safeNext), {
				external: true,
				replace: true,
			});
			return;
		}

		await redirectToPostLoginNext();
	} catch (error) {
		log.error(error);
		// Prefer landing the user over a dead-end Welcome banner when BA session exists.
		if (loggedIn.value) {
			try {
				await redirectToPostLoginNext();
				return;
			} catch (redirectError) {
				log.error(redirectError);
			}
		}
		isSessionMissing.value = true;
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
