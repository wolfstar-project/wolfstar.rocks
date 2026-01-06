<script setup lang="ts">
const { login } = useAuth();
const route = useRoute();
addRouteMiddleware(() => {
  const nextUrl = (route.query.next as string) || "/";
  void login(nextUrl);
});

defineOgImageComponent("Default", {
  title: "Login",
  description: "A landing page for the OAuth2.0 login flow",
  theme: Colors.Red,
});
</script>
