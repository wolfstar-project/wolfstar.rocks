<template>
  <SkewNotification v-slot="{ isCurrentChunksOutdated, dismiss, reload }" force-open>
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="isCurrentChunksOutdated" class="fixed bottom-4 left-4 z-50">
        <div class="flex items-center gap-3 bg-base-100 rounded-full shadow-lg ring-1 ring-base-200 px-4 py-3">
          <span class="text-lg">✨</span>
          <div class="text-sm font-medium">
            Update available
          </div>
          <UButton color="primary" size="xs" label="Refresh" @click="reload" />
          <UButton color="neutral" variant="ghost" size="xs" icon="i-heroicons-x-mark-20-solid" @click="dismiss" />
        </div>
      </div>
    </Transition>
  </SkewNotification>
</template>
