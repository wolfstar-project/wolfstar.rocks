<script setup lang="ts">
definePageMeta({
  middleware: () =>
    navigateTo(`${getOrigin()}/api/auth/discord`, {

      external: true,
      redirectCode: 301,
      replace: true,
    }),
});
defineOgImageComponent("Default", {
  title: "Login",
  description: "A landing page for the OAuth2.0 login flow",
  theme: Colors.Red,
});
</script>
