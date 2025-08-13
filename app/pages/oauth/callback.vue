<template>
  <div class="container mx-auto px-4 py-8">
    <template v-if="!code">
      <ShadAlert variant="solid" color="error" title="Missing Code" icon="emojione:warning">
        <template #description>
          Please use the <code>Login</code> button instead or click <NuxtLink to="/login" class="font-medium underline">here</NuxtLink>.
        </template>
        <template #actions>
          <ShadButton to="/login" size="sm" variant="outline"> Return to Login </ShadButton>
        </template>
      </ShadAlert>
    </template>
    <client-only v-else>
      <template v-if="status === 'pending'">
        <ShadAlert color="info" icon="emojione:hourglass-done" title="Loading">
          <template #description>
            Completing authentication flow...
          </template>
        </ShadAlert>
      </template>
      <template v-else-if="error">
        <ShadAlert variant="solid" color="error" title="Authentication Error" icon="emojione:cross-mark">
          <template #description>
            {{ error }}
          </template>
          <template #actions>
            <ShadButton to="/login" size="sm" variant="outline"> Try Again </ShadButton>
          </template>
        </ShadAlert>
      </template>
      <template v-else-if="data">
        <ShadAlert color="success" icon="emojione:check-mark" title="Welcome {{ data.username }}">
          <template #description>
            You will be redirected to the main page in a second.
            <div class="mt-2 rounded-lg bg-gray-200 p-1 dark:bg-stone-900" aria-label="Progress" role="progressbar">
              <div class="progress h-4 rounded-md bg-rose-500"></div>
            </div>
          </template>
        </ShadAlert>
      </template>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { promiseTimeout } from "@vueuse/core";

const { code } = useRoute().query;

const title = ref("OAuth Callback");

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
useSeoMeta({
  title: title.value,
  ogTitle: title.value,
  ogDescription: "A landing page for the OAuth2.0 callback flow, use the Login button instead.",
});
defineOgImageComponent("Default", {
  title: title.value,
  description: "A landing page for the OAuth2.0 callback flow",
  theme: Colors.Red,
});
</script>

<style scoped>
.progress {
	animation: progressAnimation 1s;
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
