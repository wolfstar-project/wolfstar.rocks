<template>
  <div class="flex h-screen">
 
    <div
      class="flex-grow bg-secondary text-secondary-contrast p-4 mt-16 md:mt-16 flex flex-col overflow-y-auto"
    >
      <template v-if="readyToRender">
        <slot></slot>
      </template>
      <div
        v-if="hasChanges"
        class="fixed bottom-[30px] right-[30px] transition-transform duration-300 ease-in-out"
        :class="{
          'transform-none': hasChanges,
          'translate-x-full': !hasChanges,
        }"
      >
        <SubmitResetButtons :is-loading="isLoading" @submit-changes="submitChanges" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GuildData } from "~~/server/database";
import type { ValuesType } from "~/types/utils";
import { useRouteParams } from "@vueuse/router";
import SettingsNavBar from "~/components/guild/settings/SettingsNavBar.vue";
import { useGuildData } from "~/composables/useGuildData";
import { useGuildStore } from "~/stores/guild";

const guildIdParam = useRouteParams("id");
const guildData = useGuildData();
const guildId = computed(() => (Array.isArray(guildIdParam.value) ? guildIdParam.value[0] : guildIdParam.value));
const guildStore = useGuildStore();

const isLoading = ref(false);
const mobileOpen = ref(false);
const hasError = ref(false);

const { hasChanges, mergedSettings: guildSettingsChanges } = storeToRefs(guildStore);

onMounted(async () => {
  isLoading.value = true;
  try {
    const [data, settings] = await Promise.all([
      $fetch<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>(`/api/guilds/${guildId.value}`),
      $fetch<GuildData>(`/api/guilds/${guildId.value}/settings`),
    ]);

    guildData.value = data;
    guildStore.setSettings(settings);
  }
  catch (err) {
    // TODO: Handle errors properly
    console.error(err);
    hasError.value = true;
    // router.push('/404');
  }
  finally {
    isLoading.value = false;
  }
});

const submitChanges = async () => {
  try {
    isLoading.value = true;

    const response = await $fetch<GuildData>(`/api/guilds/${guildId.value}/settings`, {
      method: "PATCH",
      body: {
        guild_id: guildId.value,
        data: guildSettingsChanges.value,
      },
    });

    if (response) {
      guildStore.setSettings(response);
      guildStore.resetAllChanges();
    }
    else {
      hasError.value = true;
    }
  }
  catch (error) {
    hasError.value = true;
    toast.add({
      title: "Error",
      message: "Failed to submit changes",
      type: "error",
    });
  }
  finally {
    isLoading.value = false;
  }
};

const toggleSidebar = () => {
  mobileOpen.value = !mobileOpen.value;
};

const readyToRender = computed(() => {
  return !isLoading.value && guildData.value && guildStore.settings;
});
</script>
