<template>
  <UFooter :ui="{ root: 'mt-24 p-10', top: 'border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns class="p-10" :columns="columns" />
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
          <span class="text-sm text-base-content/80">
            Commit: {{ buildInfo.shortCommit }}
          </span>
          <span class="text-sm text-base-content/80">
            Build Date: {{ useDateFormat(buildInfo.time, 'YYYY-MM-DD') }}
          </span>
        </div>
      </aside>
    </template>
    <template #right>
      <UColorModeButton />

      <UButton
        to="https://github.com/wolfstar-project/wolfstar"
        target="_blank"
        icon="i-simple-icons-github"
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
</script>
