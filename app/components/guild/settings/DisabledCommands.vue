<template>
  <div>
    <GuildSettingsSection title="Commands" description="On this page you can disable commands on your server">
      <!-- Commands Form -->
      <UForm :state="localCommands" :schema="schema" class="space-y-4">
        <UAccordion
          v-model="expandedCategory"
          :items="accordionItems"
          :unmount-on-hide="false"
        >
          <template #default="{ item, open }">
            <UButton color="neutral" variant="ghost" class="w-full justify-between border-b border-base-200">
              <span class="truncate text-xl font-medium">{{ item.label }}</span>

              <template #trailing>
                <UIcon
                  name="i-heroicons-chevron-down-20-solid"
                  class="ms-auto size-5 transform transition-transform duration-200"
                  :class="[open && 'rotate-180']"
                />
              </template>
            </UButton>
          </template>

          <template #body="{ item }">
            <!-- Commands Grid -->
            <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div
                v-for="command in getCommandsByCategory(item.label)"
                :key="command.name"
                class="flex items-center justify-between rounded-lg border border-base-200 p-3"
              >
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-base-content truncate">{{ command.name }}</p>
                  <p class="text-sm text-base-content/60 truncate">{{ parseCommandDescription(command.description) }}</p>
                </div>
                <USwitch
                  v-if="localCommands[command.name]"
                  v-model="localCommands[command.name]!.isEnabled"
                />
              </div>
            </div>

            <!-- Category Actions -->
            <Separator />
            <div class="flex flex-wrap items-center justify-end gap-2 p-4">
              <UButton
                color="success"
                variant="solid"
                size="sm"
                @click="enableAllInCategory(item.label)"
              >
                Enable all
              </UButton>
              <UButton
                color="warning"
                variant="solid"
                size="sm"
                @click="disableAllInCategory(item.label)"
              >
                Disable all
              </UButton>
              <UButton
                color="neutral"
                variant="outline"
                size="sm"
                @click="resetCategory(item.label)"
              >
                Reset
              </UButton>
              <UButton
                color="primary"
                variant="solid"
                size="sm"
                @click="saveCategory(item.label)"
              >
                Save
              </UButton>
            </div>
          </template>
        </UAccordion>
      </UForm>
    </GuildSettingsSection>
  </div>
</template>

<script setup lang="ts">
import type { DisableCommands } from "#shared/types/ConfigurableData";
import type { FlattenedCommand } from "#shared/types/discord";
import * as z from "zod";

const props = defineProps<{
  commands: FlattenedCommand[];
}>();

const schema = z.record(
  z.string(),
  z.object({
    name: z.string(),
    description: z.string(),
    isEnabled: z.boolean(),
    category: z.string(),
  }),
);

const toast = useToast();
const { guildSettings } = useGuildSettings();
const { setGuildSettingsChanges } = useGuildSettingsChanges();

// Track the currently expanded accordion category
const expandedCategory = ref<string | undefined>(undefined);

// Local state for commands - reactive record of command states
const localCommands = reactive<Record<string, DisableCommands.Command>>({});

// Initialize local commands state from props and guild settings
function initializeLocalCommands() {
  const newLocalCommands: Record<string, DisableCommands.Command> = {};

  for (const command of props.commands) {
    if (command.guarded)
      continue;

    newLocalCommands[command.name] = {
      name: command.name,
      description: command.description,
      isEnabled: !guildSettings.value?.disabledCommands?.includes(command.name),
      category: command.category || "General",
    };
  }

  Object.assign(localCommands, newLocalCommands);
}

// Computed categories from available commands
const categories = computed(() => {
  const uniqueCategories = new Set<string>();
  for (const command of props.commands) {
    if (!command.guarded) {
      uniqueCategories.add(command.category || "General");
    }
  }
  return [...uniqueCategories].sort();
});

// Accordion items configuration
const accordionItems = computed(() =>
  categories.value.map(category => ({
    label: category,
    value: category,
  })),
);

// Get commands for a specific category
function getCommandsByCategory(category: string): FlattenedCommand[] {
  return props.commands.filter(
    cmd => (cmd.category || "General") === category && !cmd.guarded,
  );
}

// Parse command description (can be extended for markdown parsing)
function parseCommandDescription(description: string): string {
  return description;
}

// Enable all commands in a category
function enableAllInCategory(category: string) {
  const commands = getCommandsByCategory(category);
  for (const command of commands) {
    const cmd = localCommands[command.name];
    if (cmd) {
      localCommands[command.name] = {
        ...cmd,
        isEnabled: true,
      };
    }
  }
}

// Disable all commands in a category
function disableAllInCategory(category: string) {
  const commands = getCommandsByCategory(category);
  for (const command of commands) {
    const cmd = localCommands[command.name];
    if (cmd) {
      localCommands[command.name] = {
        ...cmd,
        isEnabled: false,
      };
    }
  }
}

// Reset a category to its original saved values
function resetCategory(category: string) {
  const commands = getCommandsByCategory(category);
  const originalDisabledCommands = guildSettings.value?.disabledCommands || [];

  for (const command of commands) {
    const cmd = localCommands[command.name];
    if (cmd) {
      localCommands[command.name] = {
        ...cmd,
        isEnabled: !originalDisabledCommands.includes(command.name),
      };
    }
  }

  toast.add({
    color: "info",
    icon: "i-heroicons-arrow-path",
    title: "Category Reset",
    description: `${category} commands have been reset to saved values`,
  });
}

// Save changes for a specific category (stages changes)
function saveCategory(_category: string) {
  // Collect all disabled commands from local state
  const disabledCommands = Object.values(localCommands)
    .filter(cmd => !cmd.isEnabled)
    .map(cmd => cmd.name);

  setGuildSettingsChanges({
    disabledCommands,
  });

  toast.add({
    color: "info",
    icon: "i-heroicons-information-circle",
    title: "Changes Staged",
    description: "Click 'Save Changes' to apply your command settings",
  });
}

// Watch for changes in commands prop or guild settings
watch(
  () => [props.commands, guildSettings.value?.disabledCommands],
  () => {
    initializeLocalCommands();
  },
  { immediate: true, deep: true },
);

// Initialize on mount
onMounted(initializeLocalCommands);
</script>
