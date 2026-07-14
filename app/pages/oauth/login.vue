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
	middleware: async (to) => {
		const queryNext = to.query.next;
		const nextUrl = (Array.isArray(queryNext) ? queryNext[0] : queryNext) || "/";
		const safeNext = isSafeRedirectPath(nextUrl) ? nextUrl : "/";
		log.info({ action: "login_redirect", next: safeNext });
		await useAuthClient()?.signIn.social({
			provider: "discord",
			callbackURL: `/oauth/callback?next=${encodeURIComponent(safeNext)}`,
			errorCallbackURL: "/oauth/callback",
		});
	},
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
