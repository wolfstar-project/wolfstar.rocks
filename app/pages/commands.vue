<template>
  <div>
    <commands-palette :commands="commands" :selected-command="selectedCommand" />

    <div v-if="commands.length === 0" class="hero min-h-[200px]">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h2 class="text-lg font-bold">No commands found.</h2>
          <p class="py-2 text-sm opacity-75">Please try again later.</p>
        </div>
      </div>
    </div>

    <div v-else-if="!loading">
      <div class="container mx-auto flex flex-col gap-6 p-6 md:p-4">
        <div class="flex flex-col">
          <commands-category
            v-for="category in categories"
            :key="category"
            :category-name="category"
            :commands="commands"
            :search-commmand="selectedCommand"
            :loading="loading"
          />
        </div>
      </div>
    </div>
    <layout-refresh-commands :commands="commands" :is-loading="loading" :on-refresh="refresh" />
  </div>
</template>

<script setup lang="ts">
import { useCommandsStore } from '~/stores/commands'

const commandsStore = useCommandsStore()
const commands = computed(() => commandsStore.commands)
const loading = ref(false)
const selectedCommand = ref<FlattenedCommand | null>(null)

// Computed properties
const categories = computed<string[]>(() => [...new Set(commands.value.map(cmd => cmd.category))])

async function refresh() {
  loading.value = true
  try {
    await commandsStore.fetchCommands()
  }
  finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  refresh()
})
</script>

<style scoped>
@reference "../assets/css/main.css";
.modal {
  @apply backdrop-blur-xs;
}

.modal-box {
  @apply max-h-[80vh];
}
</style>
