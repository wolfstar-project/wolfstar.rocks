<template>
  <div>
    <layout-refresh-commands @fresh="(newCommands: FlattenedCommand[]) => emit('update:commands', newCommands)" />

    <ShadForm :model-value="localCommands" :schema="guildSettingsSchema" @submit="saveChanges">
      <SettingsSection title="Commands">
        <p class="mb-4 text-sm">On this page you can disable commands on your server</p>

        <div v-for="category in categories" :key="category" class="mb-4">
          <div class="collapse-arrow collapse bg-base-200">
            <input type="checkbox" @change="expandedCategory = expandedCategory === category ? null : category" />
            <div class="collapse-title text-xl font-medium">
              {{ category }}
            </div>
            <div class="collapse-content">
              <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <SelectBoolean
                  v-for="command in getCommandsByCategory(category)"
                  :key="command.name"
                  :title="command.name"
                  :model-value="command.isEnabled"
                  :description="parseCommandDescription(command.description)"
                  @update:model-value="toggleCommand(command.name)"
                />
              </div>
              <div class="join-item mt-4 flex justify-end space-x-2">
                <button class="btn join btn-sm btn-success" @click="toggleCategory(category, true)">Enable all</button>
                <button class="btn join btn-sm btn-warning" @click="toggleCategory(category, false)">Disable all</button>
                <button class="btn join btn-sm btn-error" @click="parseCommandsToLocalCommands">Reset</button>
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>
    </ShadForm>
  </div>
</template>

<script setup lang="ts">
import type { DisableCommands } from '~~/shared/types/ConfigurableData'
import type { FlattenedCommand } from '~~/shared/types/discord'
import { z } from 'zod'
import { useToast } from '~/composables/useToast'

const toast = useToast()

const props = defineProps<{
  commands: FlattenedCommand[]
}>()

const emit = defineEmits<{
  (e: 'update:commands', commands: FlattenedCommand[]): void
}>()

const { settings, changes } = useGuildSettings()

const loading = ref(true)
const localCommands = ref<Record<string, DisableCommands.Command>>({})
const expandedCategory = ref<string | null>(null)

const guildSettingsSchema = z.object({
  disabledCommands: z.array(z.custom<FlattenedCommand>()),
})
type FormData = z.infer<typeof guildSettingsSchema>

function parseCommandsToLocalCommands() {
  loading.value = true
  const commandsForState: Record<string, DisableCommands.Command> = {}
  for (const command of props.commands) {
    if (command.guarded)
      continue
    commandsForState[command.name] = {
      name: command.name,
      description: command.description,
      isEnabled: !settings.value.disabledCommands?.includes(command.name) || true,
      category: command.category,
    }
  }
  localCommands.value = commandsForState
  loading.value = false
}

onMounted(parseCommandsToLocalCommands)

const categories = computed(() => [...new Set(Object.values(localCommands.value).map(command => command.category))])

const getCommandsByCategory = (category: string) => Object.values(localCommands.value).filter(cmd => cmd.category === category)

const parseCommandDescription = (description: string) => description

function toggleCommand(commandName: string) {
  const command = localCommands.value[commandName]
  if (command) {
    command.isEnabled = !command.isEnabled
  }
}

function toggleCategory(category: string, enable: boolean) {
  for (const command of getCommandsByCategory(category)) {
    command.isEnabled = enable
  }
}


async function saveChanges() {
  try {
    changes({
      disabledCommands: Object.entries(localCommands.value)
        .filter(([_, command]) => !command.isEnabled)
        .map(([name]) => name),
    })
    toast.add({
      color: 'success',
      description: 'Commands settings saved successfully',
      icon: 'check-circle',
    })
  }
  catch (error) {
    toast.add({
      color: 'error',
      title: 'Failed to save commands settings',
      description: 'Please try again later',
    })
    console.error('Failed to save commands settings:', error)
  }
}
</script>
