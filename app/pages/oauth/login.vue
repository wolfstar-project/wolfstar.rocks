<script setup lang="ts">
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
	void login(nextUrl.value);
});
</script>
