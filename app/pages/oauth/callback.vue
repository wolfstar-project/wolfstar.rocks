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
          icon="emojione:cross-mark"
        >
          <template #description>
            {{ error?.cause ?? error?.message ?? "An error occurred during authentication" }}
          </template>
          <template #actions>
            <UButton color="neutral" variant="ghost" to="/login" size="sm">
              Try again clicking here
            </UButton>
          </template>
        </UAlert>
      </template>
      <template v-else-if="user">
        <UAlert
          color="success"
          icon="lucide:check"
          :title="`Welcome ${user.username}!`"
        >
          <template #description>
            You will be redirected to the main page in a moment.
            <div
              class="mt-2 rounded-lg bg-base-200 p-1"
              aria-label="Progress"
              role="progressbar"
            >
              <div class="mt-2 rounded-lg bg-gray-200 p-1 dark:bg-stone-900" aria-label="Progress" role="progressbar">
                <div class="progress h-4 rounded-md bg-rose-500"></div>
              </div>
            </div>
          </template>
        </UAlert>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { promiseTimeout } from "@vueuse/core";

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
  void performCall().catch(console.error);
}

async function performCall() {
  await execute();
  if (!user.value)
    return;

  await promiseTimeout(1000);
  await router.replace(redirectTo.value);
}

const isPending = computed(() => status.value === "pending");
const isError = computed(() => status.value === "error" && error.value !== undefined);

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
