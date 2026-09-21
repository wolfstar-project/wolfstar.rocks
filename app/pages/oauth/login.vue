<template>
	<div>
		<h1 class="sr-only">{{ t("auth.oauth.login_seo_title") }}</h1>
		<OauthStatusPanel
			v-if="hasSignInFailed"
			tone="error"
			:title="t('auth.oauth.sign_in_failed_title')"
			icon="heroicons:x-circle"
		>
			<template #description>
				{{ errorMessage }}
			</template>
			<template #actions>
				<UButton color="primary" size="sm" class="w-full sm:w-auto" @click="startSignIn">
					{{ t("auth.oauth.try_again") }}
				</UButton>
			</template>
		</OauthStatusPanel>
		<OauthStatusPanel
			v-else
			tone="info"
			loading
			:title="t('auth.oauth.login_redirecting')"
			icon="ph:discord-logo-fill"
		>
			<template #description>
				{{ t("auth.oauth.redirecting_discord_description") }}
			</template>
		</OauthStatusPanel>
	</div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { localizeAuthError } = useAuthErrorMessage();

definePageMeta({
	alias: ["/login"],
	// Route-rule `auth` keys are untyped in clientOnly mode, so the guest guard
	// lives here; the `/login` alias shares this route record and is covered too.
	auth: { only: "guest", redirectTo: "/profile" },
	viewTransition: false,
});

// Better Auth performs a browser redirect to Discord, and its client is null
// during SSR, so sign-in starts on mount (client-only). Running it in route
// middleware would no-op on a direct visit and leave the user on a blank shell.
const route = useRoute();

// `useSignIn("social")` types its `provider` as `never` in clientOnly mode: the
// provider union is inferred from a local server auth config, and this app has
// none. The raw client takes the provider id, so failure state is tracked here.
const signInError = ref<{ code?: string; message?: string } | null>(null);
const hasSignInFailed = computed(() => signInError.value !== null);
const errorMessage = computed(() => localizeAuthError(signInError.value));

onMounted(() => {
	void startSignIn();
});

async function startSignIn() {
	signInError.value = null;

	const queryNext = route.query.next;
	const nextUrl = (Array.isArray(queryNext) ? queryNext[0] : queryNext) || "/";
	const safeNext = isSafeRedirectPath(nextUrl) ? nextUrl : "/";
	log.info({ tag: "oauth:login", action: "login_redirect", next: safeNext });

	// Cross-origin auth backend: callback URLs must be absolute frontend URLs,
	// otherwise Better Auth resolves them against the bot API origin.
	const origin = window.location.origin;

	// A failed hand-off is reported in the result rather than thrown, and renders
	// the retry panel instead of leaving a spinner up forever.
	try {
		const result = await useAuthClient()?.signIn.social({
			provider: "discord",
			callbackURL: `${origin}/oauth/callback?next=${encodeURIComponent(safeNext)}`,
			errorCallbackURL: `${origin}/oauth/callback`,
		});
		signInError.value = result?.error ?? null;
	} catch (error) {
		signInError.value = {
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

useSeoMetadata({
	description: t("auth.oauth.login_seo_og_description"),
	ogImage: {
		theme: Colors.Red,
	},
	shouldOgImage: true,
	title: t("auth.oauth.login_seo_title"),
});
</script>
