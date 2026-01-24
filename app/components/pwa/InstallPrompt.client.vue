<template>
  <UAlert
    v-if="$pwa?.showInstallPrompt && !$pwa?.needRefresh"
    color="primary"
    variant="soft"
    title="Install App"
    class="m-2 pr-28 sm:pr-36 relative overflow-hidden"
    v-bind="$attrs"
  >
    <!-- Decorative background icon (presentational) -->
    <div
      class="absolute inset-y-0 right-4 hidden sm:flex items-center pointer-events-none select-none"
      aria-hidden="true"
      role="presentation"
    >
      <UIcon name="material-symbols-install-desktop-rounded" class=" text-[5.5rem] sm:text-[7.5rem] opacity-10 dark:opacity-8 text-slate-700 dark:text-slate-400" />
    </div>

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
