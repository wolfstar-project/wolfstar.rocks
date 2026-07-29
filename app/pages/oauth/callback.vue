<template>
	<div class="container mx-auto px-4 py-8">
		<h1 class="sr-only">{{ t("auth.oauth.callback_sr_title") }}</h1>
		<h2 class="sr-only">{{ t("auth.oauth.callback_sr_status") }}</h2>
		<template v-if="!hasCallbackParams">
			<UAlert
				variant="solid"
				color="warning"
				:title="t('auth.oauth.login_required_title')"
				icon="twemoji:warning"
			>
				<template #description>
					<i18n-t keypath="auth.oauth.login_required_description" tag="span">
						<template #link>
							<ULink to="/login" class="font-medium underline">{{
								t("auth.oauth.login_required_link")
							}}</ULink>
						</template>
					</i18n-t>
				</template>
				<template #actions>
					<UButton color="neutral" variant="ghost" to="/login" size="sm">
						{{ t("auth.oauth.go_to_login") }}
					</UButton>
				</template>
			</UAlert>
		</template>
		<ClientOnly v-else>
			<template v-if="isError && !isRetryingSilentAuth">
				<UAlert
					color="error"
					:title="t('auth.oauth.sign_in_failed_title')"
					icon="twemoji:cross-mark"
				>
					<template #description>
						{{ errorMessage }}
					</template>
					<template #actions>
						<UButton color="neutral" variant="ghost" to="/login" size="sm">
							{{ t("auth.oauth.try_again") }}
						</UButton>
					</template>
				</UAlert>
			</template>
			<template v-else-if="isSessionLoading || !ready">
				<UAlert
					color="info"
					icon="emojione:hourglass-done"
					:title="t('auth.oauth.signing_in_title')"
				>
					<template #description> {{ t("auth.oauth.connecting_discord") }} </template>
				</UAlert>
			</template>
			<template v-else-if="user">
				<UAlert
					color="success"
					icon="twemoji:check-mark"
					:title="t('auth.oauth.welcome_title', { name: user.name })"
				>
					<template #description> {{ t("auth.oauth.redirecting_dashboard") }} </template>
				</UAlert>
			</template>
			<template v-else-if="isSessionMissing">
				<UAlert
					color="error"
					:title="t('auth.oauth.session_not_found_title')"
					icon="twemoji:cross-mark"
				>
					<template #description>
						{{ t("auth.oauth.session_not_found_description") }}
					</template>
					<template #actions>
						<UButton color="neutral" variant="ghost" to="/login" size="sm">
							{{ t("auth.oauth.try_again") }}
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

const { t } = useI18n();
const { localizeAuthError } = useAuthErrorMessage();

const route = useRoute();
const nextParam = useRouteQuery("next", "/", { transform: String });
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
const errorMessage = computed(() => localizeAuthError(route.query.error as string | undefined));

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
				log.error({
					tag: "oauth:callback",
					error: error instanceof Error ? error.message : String(error),
				});
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
		log.error({
			tag: "oauth:callback",
			error: error instanceof Error ? error.message : String(error),
		});
		// Prefer landing the user over a dead-end Welcome banner when BA session exists.
		if (loggedIn.value) {
			try {
				await redirectToPostLoginNext();
				return;
			} catch (redirectError) {
				log.error({
					tag: "oauth:callback",
					error:
						redirectError instanceof Error
							? redirectError.message
							: String(redirectError),
				});
			}
		}
		isSessionMissing.value = true;
	} finally {
		isSessionLoading.value = false;
	}
}

useRobotsRule(robotBlockingPageProps);
useSeoMeta({
	ogDescription: t("auth.oauth.seo_og_description"),
	ogTitle: t("auth.oauth.seo_og_title"),
	robots: { none: true },
	title: t("auth.oauth.seo_title"),
});
</script>
