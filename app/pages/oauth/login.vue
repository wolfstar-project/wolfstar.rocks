<template>
	<div>
		<h1 class="sr-only">Login</h1>
		<h2 class="sr-only">Redirecting to Discord</h2>
	</div>
</template>

<script setup lang="ts">
import { isSafeRedirectPath } from "#shared/utils/redirect";

definePageMeta({ alias: ["/login"] });

useSeoMetadata({
	description: "A landing page for the OAuth2.0 login flow",
	ogImage: {
		theme: Colors.Red,
	},
	shouldOgImage: true,
	title: "Login",
});

const { login } = useAuth();

onMounted(() => {
	const nextUrl = useRouteQuery("next", "/", { transform: String });
	const safeNext = isSafeRedirectPath(nextUrl.value) ? nextUrl.value : "/";
	void login(safeNext);
});
</script>
