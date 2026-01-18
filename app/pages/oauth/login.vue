<script setup lang="ts">
definePageMeta({ alias: ["/login"] });

useSeoMetadata({
  title: "Login",
  description: "A landing page for the OAuth2.0 login flow",
  shouldSeoImage: true,
  seoImage: {
    theme: Colors.Red,
  },
});

const { login } = useAuth();

onMounted(() => {
  const nextUrl = useRouteQuery("next", "/", { transform: String });
  void login(nextUrl.value);
});
</script>
