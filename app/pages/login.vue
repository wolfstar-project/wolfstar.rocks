<script setup lang="ts">
definePageMeta({
  middleware: () =>
    navigateTo(getLoginURL(), {
      external: true,
      redirectCode: 301,
      replace: true,
    }),
});
defineOgImageComponent("NuxtSeo", {
  title: "Login",
  description: "A landing page for the OAuth2.0 login flow",
  theme: Colors.Red,
});
</script>
