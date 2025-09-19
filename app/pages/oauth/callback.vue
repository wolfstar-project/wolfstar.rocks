<template>
  <div class="container mx-auto px-4 py-8">
    <template v-if="!code">
      <UAlert variant="solid" color="error" title="Missing Code" icon="emojione:warning">
        <template #description>
          Please use the <code>Login</code> button instead or click <ULink to="/login" class="font-medium underline">here</ULink>.
        </template>
        <template #actions>
          <UButton to="/login" size="sm" variant="outline"> Return to Login </UButton>
        </template>
      </UAlert>
    </template>
    <client-only v-else>
      <template v-if="status === 'pending'">
        <UAlert color="neutral" icon="emojione:hourglass-done" title="Loading">
          <template #description>
            Completing authentication flow...
          </template>
        </UAlert>
      </template>
      <template v-else-if="status === 'error'">
        <UAlert variant="solid" color="error" title="Authentication Error" icon="emojione:cross-mark">
          <template #description>
            {{ error?.message ?? error?.statusMessage }}
          </template>
          <template #actions>
            <UButton to="/login" size="sm" variant="outline"> Try Again </UButton>
          </template>
        </UAlert>
      </template>
      <template v-else-if="data">
        <UAlert color="success" icon="lucide:check" :title="`Welcome ${data.username}`">
          <template #description>
            You will be redirected to the main page in a second.
            <div class="mt-2 rounded-lg bg-gray-200 p-1 dark:bg-stone-900" aria-label="Progress" role="progressbar">
              <Motion
                is="div"
                :initial="{ width: 0 }"
                :animate="{ width: 100 }"
                :transition="{ duration: 1 }"
                class="h-4 rounded-md bg-rose-500"
              />
            </div>
          </template>
        </UAlert>
      </template>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { promiseTimeout } from "@vueuse/core";

const { code } = useRoute().query;

const { error, status, execute } = useFetch("/api/auth/discord", {
  query: { code },
  method: "GET",
  key: "callback",
  server: false,
  immediate: false,
});

const { user: data } = useAuth();

if (import.meta.client && code) {
  void performCall().catch(console.error);
}

async function performCall() {
  await execute();
  if (!data)
    return;

  await promiseTimeout(1000);
  await useRouter().replace(useAuth().redirectTo.value);
  // reload the page
  window.location.reload();
}

useRobotsRule(robotBlockingPageProps);
useSeoMetadata({
  title: "OAuth Callback",
  description: "A landing page for the OAuth2.0 callback flow, use the Login button instead.",
});
defineOgImageComponent("Default", {
  title: "OAuth Callback",
  description: "A landing page for the OAuth2.0 callback flow",
  theme: Colors.Red,
});
</script>
