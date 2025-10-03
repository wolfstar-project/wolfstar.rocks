<template>
  <USeparator icon="custom:wolfstar" class="white-text mt-24 p-10" />
  <UFooter :ui="{ root: 'p-2', top: 'border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns class="p-10" :columns="columns">
          <template #right>
            <ULink target="_blank" to="https://www.netlify.com">
              <NuxtImg :src="netlify" height="250px" width="250px" alt="Deploys by Netlify" />
            </ULink>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <aside>
        <div class="flex items-center gap-4">
          <div class="w-10 rounded-full">
            <icons-wolfstar class="h-12 w-12" />
          </div>
          <div>
            <p class="font-semibold">
              WolfStar Project
            </p>
          </div>
          <div>
            <p class="text-sm text-base-content/80">
              Copyright © {{ new Date().getFullYear() }}. All rights reserved.
            </p>
          </div>
        </div>

        <div class="flex items-end gap-4 mt-4">
          <span class="text-sm text-base-content/80">
            Version: {{ buildInfo.version }}
          </span>
          <template v-if="buildInfo.commit && buildInfo.branch !== 'release'">
            <NuxtLink
              external
              :href="`https://github.com/elk-zone/elk/commit/${buildInfo.commit}`"
              target="_blank"
              class="text-sm text-base-content/80"
            >
              Commit: {{ buildInfo.shortCommit }}
            </NuxtLink>
          </template>
          <span class="text-sm text-base-content/80">
            Build Date: {{ useDateFormat(buildInfo.time, 'YYYY-MM-DD') }}
          </span>
        </div>
      </aside>
    </template>
    <template #right>
      <UColorModeButton />

      <Feedback />

      <UButton
        to="https://github.com/wolfstar-project/wolfstar"
        target="_blank"
        icon="lucide:github"
        aria-label="GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>

<script setup lang="ts">
const { buildInfo } = useAppConfig();
const { columns } = useFooter();

const colorMode = useColorMode();

const netlify = computed(() => {
  return colorMode.value === "dark"
    ? "/netlify-badge-dark.svg"
    : "/netlify-badge-light.svg";
});
</script>
