<template>
  <div class="container mx-auto px-4 py-8">
    <ClientOnly>
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
          :title="`Welcome ${user?.name || 'back'}!`"
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

const { user } = useAuth();
const { start, finish } = useLoadingIndicator();

const route = useRoute();
const error = ref<Error | null>(null);
const status = ref<"idle" | "pending" | "success" | "error">("idle");

// Better auth handles the OAuth callback automatically
// We just need to wait for the session to be established and redirect
if (import.meta.client) {
  void handleCallback()
    .catch((err) => {
      logger.error("Callback error:", err);
      error.value = err;
      status.value = "error";
    });
}

async function handleCallback() {
  status.value = "pending";
  start();

  // Wait for authentication to complete
  await promiseTimeout(seconds(2));

  if (user.value) {
    status.value = "success";
    finish({ error: false });

    // Decode redirect URL from state parameter (if present)
    let redirectUrl = "/";
    const state = route.query.state as string | undefined;
    if (state) {
      try {
        redirectUrl = atob(state);
      }
      catch {
        // If decoding fails, use default
        redirectUrl = "/";
      }
    }

    await navigateTo(redirectUrl);
  }
  else {
    status.value = "error";
    finish({ error: true });
    error.value = new Error("Authentication failed");
  }
}

const errorMessage = computed(() => {
  if (route.query.error) {
    return route.query.error;
  }

  return error.value?.message ?? "An error occurred during authentication";
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
