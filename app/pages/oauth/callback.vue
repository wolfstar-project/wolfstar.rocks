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
            {{ errorMessage }}
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
const state = useRouteQuery("state", undefined, { transform: String });
const { user } = useAuth();

const route = useRoute();

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
  await execute();

  await promiseTimeout(seconds(2));

  // Decode redirect URL from state parameter (if present)
  let redirectUrl = "/";
  if (state.value) {
    try {
      redirectUrl = atob(state.value);
    }
    catch {
      // If decoding fails, use default
      redirectUrl = "/";
    }
  }

  await navigateTo(redirectUrl);
}

const errorMessage = computed(() => {
  if (route.query.error) {
    return route.query.error;
  }

  return error.value ? error.value.message ?? error.value.cause : "An error occurred during authentication";
});

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
