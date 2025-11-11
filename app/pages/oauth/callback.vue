<template>
  <div class="container mx-auto px-4 py-8">
    <template v-if="!code">
      <UAlert
        variant="solid"
        color="warning"
        title="Missing Code"
        icon="emojione:warning"
      >
        <template #description>
          Please use the <code>Login</code> button instead or click
          <ULink to="/login" class="font-medium underline">here</ULink>.
        </template>
        <template #actions>
          <UButton to="/login" size="sm" variant="outline">
            Return to Login
          </UButton>
        </template>
      </UAlert>
    </template>
    <ClientOnly v-else>
      <template v-if="status === 'pending' || status === 'idle'">
        <UAlert color="info" icon="emojione:hourglass-done" title="Loading">
          <template #description> Completing authentication flow... </template>
        </UAlert>
      </template>
      <template v-else-if="status === 'error' && error">
        <UAlert
          color="error"
          title="Authentication Error"
          icon="emojione:cross-mark"
        >
          <template #description>
            {{ error.cause }}
          </template>
          <template #actions>
            <UButton color="secondary" to="/login" size="sm">
              Try Again
            </UButton>
          </template>
        </UAlert>
      </template>
      <template v-else-if="user">
        <UAlert
          color="success"
          icon="lucide:check"
          :title="`Welcome ${user.username}`"
        >
          <template #description>
            You will be redirected to the main page in a second.
            <div
              class="mt-2 rounded-lg bg-base-200 p-1"
              aria-label="Progress"
              role="progressbar"
            >
              <div class="oauth-progress h-4 rounded-md bg-rose-500"></div>
            </div>
          </template>
        </UAlert>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const code = useRouteQuery("code", null, { transform: String });
const router = useRouter();

const { error, status, execute } = useFetch("/api/auth/discord", {
  query: { code },
  method: "GET",
  key: "callback",
  server: false,
  immediate: false,
});

const { user, redirectTo } = useAuth();

if (import.meta.client && code) {
  void performCall().catch(logger.error);
}

async function performCall() {
  await execute();
  if (error.value)
    throw error.value;
  // wait until data is populated instead of a fixed timeout
  await until(user).toBeTruthy({ timeout: 5000, throwOnTimeout: true });
  // perform a client‐side redirect (replace history entry) without a full reload
  await router.replace(redirectTo.value);
}

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

<style scoped>
.oauth-progress {
	animation: progressAnimation 1s ease-out;
}

@keyframes progressAnimation {
	from {
		width: 0;
	}
	to {
		width: 100%;
	}
}
</style>
