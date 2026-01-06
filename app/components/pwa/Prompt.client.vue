<template>
  <UAlert
    v-if="$pwa?.needRefresh"
    color="primary"
    variant="soft"
    title="Update Available"
    icon="i-ri-arrow-down-circle-line"
    class="m-2"
  >
    <template #description>
      <div class="mt-2 flex gap-2">
        <UButton
          size="sm"
          @click="$pwa?.updateServiceWorker()"
        >
          Update
        </UButton>
        <UButton
          size="sm"
          color="error"
          variant="ghost"
          @click="$pwa?.cancelPrompt()"
        >
          Dismiss
        </UButton>
      </div>
    </template>
  </UAlert>
</template>
