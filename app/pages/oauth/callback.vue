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
			<template v-if="isError">
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
import { promiseTimeout } from "@vueuse/core";

definePageMeta({
	viewTransition: false,
});

const { t } = useI18n();
const { localizeAuthError } = useAuthErrorMessage();

const route = useRoute();
const nextParam = useRouteQuery("next", "/", { transform: String });
const isSessionMissing = ref(false);

// Better Auth has already completed the Discord code exchange and set the
// session cookie server-side before redirecting the browser here.
const { user, ready, loggedIn, fetchSession } = useUserSession();

const hasCallbackParams = computed(() => Boolean(route.query.next || route.query.error));
const isError = computed(() => Boolean(route.query.error));
const isSessionLoading = ref(!isError.value);
const errorMessage = computed(() => localizeAuthError(route.query.error as string | undefined));

onMounted(() => {
	if (!isError.value) {
		void completeSignIn();
	}
});

async function completeSignIn() {
	try {
		await fetchSession({ force: true });

		if (!loggedIn.value) {
			isSessionMissing.value = true;
			return;
		}

		// Session is ready: stop showing the loading state now so the welcome
		// banner is visible during the delay below, instead of only appearing
		// after navigation has already started.
		isSessionLoading.value = false;

		await promiseTimeout(seconds(2));

		const safeNext = isSafeRedirectPath(nextParam.value) ? nextParam.value : "/";

		// Full page navigation ensures SSR reads the fresh session cookie, so the
		// target page renders with the correct authenticated state.
		await navigateTo(safeNext, {
			external: true,
			replace: true,
		});
	} catch (error) {
		isSessionMissing.value = true;
		log.error({
			tag: "oauth:callback",
			error: error instanceof Error ? error.message : String(error),
		});
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
