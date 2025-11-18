<template>
  <USeparator icon="custom:wolfstar" class="white-text mt-24 p-10" />
  <UFooter :ui="{ root: 'p-2', top: 'border-default' }" role="contentinfo" aria-label="Site footer">
    <template #top>
      <UContainer>
        <UFooterColumns class="p-10" :columns="columns">
          <template #right>
            <UButton
              label="Powered by Netlify"
              to="https://www.netlify.com"
              target="_blank"
              rel="noopener noreferrer"
              icon="simple-icons:netlify"
              color="neutral"
              variant="soft"
              :ui="{ leadingIcon: 'bg-green-500' }"
              aria-label="Powered by Netlify - opens in new tab"
            />
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <aside>
        <div class="flex items-center gap-4">
          <div class="w-10 rounded-full" role="img" aria-label="WolfStar logo">
            <icons-wolfstar class="h-12 w-12" aria-hidden="true" />
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
              :href="`https://github.com/wolfstar-project/wolfstar.rocks/commit/${buildInfo.commit}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-base-content/80"
              :aria-label="`View commit ${buildInfo.shortCommit} on GitHub - opens in new tab`"
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
      <ColorModeButton />

      <UButton
        to="https://github.com/wolfstar-project/wolfstar"
        target="_blank"
        rel="noopener noreferrer"
        icon="lucide:github"
        aria-label="Visit WolfStar on GitHub - opens in new tab"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>

<script setup lang="ts">
const { buildInfo } = useAppConfig();
const { columns } = useFooter();
</script>
