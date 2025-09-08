<template>
  <div class="container mx-auto px-4 py-8">
    <template v-if="!guildId">
      <UAlert variant="solid" color="error" title="Missing Guild ID" icon="emojione:warning">
        <template #description>
          Please use the <code>Login</code> button instead or click <NuxtLink to="/login" class="font-medium underline">here</NuxtLink>.
        </template>
      </UAlert>
    </template>
    <template v-else-if="error">
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
  </div>
</template>

<script setup lang="ts">
import { promiseTimeout } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";

const guildId = useRouteParams("guild_id");
const error = ref<string | null>(null);

const { start, finish } = useLoadingIndicator({
  duration: 2000,
});

if (import.meta.client && guildId.value && !error.value) {
  navigateToGuild();
}

async function navigateToGuild() {
  if (!guildId.value) {
    finish({
      error: true,
    });
    throw createError({
      statusCode: 400,
      statusMessage: "No guild ID provided",
    });
  }
  start();

  await promiseTimeout(1500);

  finish();
  await navigateTo(`/guilds/${guildId.value}`);
}

useSeoMeta({
  title: "Auth Guild Callback",
  robots: { none: true },
  ogTitle: "OAuth Guild Callback",
  ogDescription: "A landing page for the OAuth2.0 guild callback flow.",
});
</script>
