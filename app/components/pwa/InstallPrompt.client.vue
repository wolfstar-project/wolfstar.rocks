<template>
  <UAlert
    v-if="$pwa?.showInstallPrompt && !$pwa?.needRefresh"
    color="primary"
    variant="soft"
    title="Install App"
    icon="i-material-symbols-install-desktop-rounded"
    class="m-2"
    v-bind="$attrs"
  >
    <template #actions>
      <div class="mt-2 flex gap-2">
        <UButton
          size="sm"
          @click="$pwa?.install()"
        >
          Install
        </UButton>
        <UButton
          size="sm"
          color="error"
          variant="ghost"
          @click="$pwa?.cancelInstall()"
        >
          Dismiss
        </UButton>
      </div>
    </template>
  </UAlert>
</template>
