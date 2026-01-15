<script setup lang="ts">
const { login } = useAuth();
const route = useRoute();

useSeoMetadata({
  title: "Login",
  description: "A landing page for the OAuth2.0 login flow",
  shouldSeoImage: true,
  seoImage: {
    theme: Colors.Red,
  },
});

onMounted(() => {
  const nextUrl = (route.query.next as string) || "/";
  void login(nextUrl);
});
</script>
