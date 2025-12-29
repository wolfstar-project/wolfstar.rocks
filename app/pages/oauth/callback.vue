<template>
  <div class="container mx-auto px-4 py-8">
    <template v-if="!code">
      <UAlert
        variant="solid"
        color="warning"
        title="Missing Code"
        icon="twemoji:warning"
      >
        <template #description>
          Please use the <code>Login</code> button instead or click
          <ULink to="/login" class="font-medium underline">here</ULink>.
        </template>
        <template #actions>
          <UButton color="neutral" variant="ghost" to="/login" size="sm">
            Return to Login
          </UButton>
        </template>
      </UAlert>
    </template>
    <ClientOnly v-else>
      <template v-if="isPending">
        <UAlert color="info" icon="emojione:hourglass-done" title="Loading">
          <template #description> Completing authentication flow... </template>
        </UAlert>
      </template>
      <template v-else-if="isError">
        <UAlert
          color="error"
          title="Authentication Error"
          icon="twemoji:cross-mark"
        >
          <template #description>
            {{ error ? error.message ?? error.cause : "An error occurred during authentication" }}
          </template>
          <template #actions>
            <UButton color="neutral" variant="ghost" to="/login" size="sm">
              Try again clicking here
            </UButton>
          </template>
        </UAlert>
      </template>
      <template v-else-if="isSuccess">
        <UAlert
          color="success"
          icon="twemoji:check-mark"
          :title="`Welcome ${user!.username}!`"
        >
          <template #description>
            You will be redirected to the main page in a moment.
          </template>
        </UAlert>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { promiseTimeout } from "@vueuse/core";

const code = useRouteQuery("code", null, { transform: String });
const { user, redirectTo, fetch: refreshSession } = useAuth();
const { start, finish } = useLoadingIndicator();

const { error, status, execute } = useFetch("/api/auth/discord", {
  query: {
    code,
  },
  method: "GET",
  key: "callback",
  server: false,
  immediate: false,
});

if (import.meta.client && code) {
  void performCall()
    .catch(logger.error);
}

async function performCall() {
  start();
  await execute();

  await refreshSession();

  await promiseTimeout(seconds(5));

  finish({
    error: !user.value,
  });

  if (user.value) {
    redirectTo.value = "/";
    await navigateTo(redirectTo.value);
  }
}

const isPending = computed(() => status.value === "pending");
const isError = computed(() => status.value === "error");
const isSuccess = computed(() => status.value === "success");

useRobotsRule(robotBlockingPageProps);
useSeoMetadata({
  title: "OAuth Callback",
  description:
    "A landing page for the OAuth2.0 callback flow, use the Login button instead.",
  seoImage: {
    description: "A landing page for the OAuth2.0 callback flow",
    theme: Colors.Blue,
  },
});
</script>
