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
		const { login } = useAuth();
		const queryNext = to.query.next;
		const nextUrl = (Array.isArray(queryNext) ? queryNext[0] : queryNext) || "/";
		const safeNext = isSafeRedirectPath(nextUrl) ? nextUrl : "/";
		log.info({ action: "login_redirect", next: safeNext });
		return login(safeNext);
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
