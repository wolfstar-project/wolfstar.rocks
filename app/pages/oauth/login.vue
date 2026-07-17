<template>
	<div>
		<h1 class="sr-only">Login</h1>
		<h2 class="sr-only">Redirecting to Discord</h2>
	</div>
</template>

<script setup lang="ts">
const log = useLogger("oauth:login");

definePageMeta({
	alias: ["/login"],
	viewTransition: false,
});

// Better Auth's `signIn.social` performs a client-side redirect and its client is
// null during SSR, so start sign-in on mount (client-only). Running it in route
// middleware would no-op on a direct visit and leave the user on a blank shell.
const route = useRoute();

onMounted(async () => {
	const queryNext = route.query.next;
	const nextUrl = (Array.isArray(queryNext) ? queryNext[0] : queryNext) || "/";
	const safeNext = isSafeRedirectPath(nextUrl) ? nextUrl : "/";
	log.info({ action: "login_redirect", next: safeNext });
	await useAuthClient()?.signIn.social({
		provider: "discord",
		callbackURL: `/oauth/callback?next=${encodeURIComponent(safeNext)}`,
		errorCallbackURL: "/oauth/callback",
	});
});

useSeoMetadata({
	description: "A landing page for the OAuth2.0 login flow",
	ogImage: {
		theme: Colors.Red,
	},
	shouldOgImage: true,
	title: "Login",
});
</script>
