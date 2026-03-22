<template>
	<div>
		<h1 class="sr-only">Login</h1>
		<h2 class="sr-only">Redirecting to Discord</h2>
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	alias: ["/login"],
	middleware: defineNuxtRouteMiddleware((to) => {
		const { login } = useAuth();
		const nextUrl = (to.query.next as string) || "/";
		const safeNext = isSafeRedirectPath(nextUrl) ? nextUrl : "/";
		return login(safeNext);
	}),
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
