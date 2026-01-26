<template>
  <div class="container mx-auto px-4 py-8">
    <template v-if="!guildId">
      <UAlert variant="solid" color="error" title="Missing Guild ID" icon="emojione:warning">
        <template #description>
          Please use the <code>Login</code> button instead or click <NuxtLink to="/login" class="font-medium underline">here</NuxtLink>.
        </template>
      </UAlert>
    </template>
    <ClientOnly v-else>
      <template v-if="error">
        <UAlert variant="solid" color="error" title="Authentication Error" icon="emojione:cross-mark">
          <template #description>
            {{ error }}
          </template>
          <template #actions>
            <UButton to="/login" size="sm" variant="outline"> Return to Login </UButton>
          </template>
        </UAlert>
      </template>
      <template v-else>
        <UAlert color="info" icon="emojione:hourglass-done" title="Redirecting">
          <template #description> Redirecting you to the guild page... </template>
        </UAlert>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { isNullOrUndefined } from "@sapphire/utilities/isNullOrUndefined";
import { promiseTimeout } from "@vueuse/core";

const guildId = useRouteParams("id", null, { transform: String });
const error = ref<string | null>(null);

if (import.meta.client && guildId.value && !error.value) {
  navigateToGuild().catch(logger.error);
}

async function navigateToGuild() {
  if (isNullOrUndefined(guildId.value)) {
    throw createError({ status: 400, statusText: "Guild ID is required." });
  }

  await promiseTimeout(1500);

  await navigateTo(`/guilds/${guildId.value}/manage`);
}

useRobotsRule(robotBlockingPageProps);
useSeoMeta({
  title: "Auth Guild Callback",
  robots: { none: true },
  ogTitle: "OAuth Guild Callback",
  ogDescription: "A landing page for the OAuth2.0 guild callback flow.",
});
</script>
