<template>
	<div>
		<h1 class="sr-only">{{ ts("auth.oauth.login_seo_title") }}</h1>
		<OauthStatusPanel
			v-if="signInDiscord.status.value === 'error'"
			tone="error"
			:title="ts('auth.oauth.sign_in_failed_title')"
			icon="heroicons:x-circle"
		>
			<template #description>
				{{ errorMessage }}
			</template>
			<template #actions>
				<UButton color="primary" size="sm" class="w-full sm:w-auto" @click="startSignIn">
					{{ ts("auth.oauth.try_again") }}
				</UButton>
			</template>
		</OauthStatusPanel>
		<OauthStatusPanel
			v-else
			tone="info"
			loading
			:title="ts('auth.oauth.login_redirecting')"
			icon="ph:discord-logo-fill"
		>
			<template #description>
				{{ ts("auth.oauth.redirecting_discord_description") }}
			</template>
		</OauthStatusPanel>
	</div>
</template>

<script setup lang="ts">
const { ts } = useI18n();
const { localizeAuthError } = useAuthErrorMessage();

definePageMeta({
	alias: ["/login"],
	viewTransition: false,
});

// Better Auth performs a browser redirect to Discord, and its client is null
// during SSR, so sign-in starts on mount (client-only). Running it in route
// middleware would no-op on a direct visit and leave the user on a blank shell.
const route = useRoute();
const signInDiscord = useSignIn("social");

const errorMessage = computed(() => localizeAuthError(signInDiscord.error.value));

onMounted(() => {
	void startSignIn();
});

async function startSignIn() {
	const queryNext = route.query.next;
	const nextUrl = (Array.isArray(queryNext) ? queryNext[0] : queryNext) || "/";
	const safeNext = isSafeRedirectPath(nextUrl) ? nextUrl : "/";
	log.info({ tag: "oauth:login", action: "login_redirect", next: safeNext });

	// `execute` never throws: a failed hand-off lands in `signInDiscord.error`
	// and renders the retry panel instead of leaving a spinner up forever.
	await signInDiscord.execute({
		provider: "discord",
		callbackURL: `/oauth/callback?next=${encodeURIComponent(safeNext)}`,
		errorCallbackURL: "/oauth/callback",
	});
}

useSeoMetadata({
	description: ts("auth.oauth.login_seo_og_description"),
	ogImage: {
		theme: Colors.Red,
	},
	shouldOgImage: true,
	title: ts("auth.oauth.login_seo_title"),
});
</script>
