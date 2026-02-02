<template>
  <div>
    <GuildSettingsSection title="Commands" description="On this page you can disable commands on your server">
      <!-- Unified Form wrapper to match skeleton and content -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="space-y-2">
          <!-- Simulated accordion trigger skeleton -->
          <USkeleton class="h-12 w-full" />

          <!-- Commands grid skeleton -->
          <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div v-for="j in 8" :key="j" class="flex items-center justify-between rounded-lg border border-base-200 p-3">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-5 w-32" />
                <USkeleton class="h-4 w-48" />
              </div>
              <USkeleton class="h-6 w-11 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- Commands Form Content -->
      <GuildSettingsForm
        v-else
        :state="state"
        :schema="schema"
        :map-to-guild-data="mapToGuildData"
        class="space-y-4"
        aria-label="Disabled commands settings form"
        :aria-busy="loading"
        :aria-disabled="loading"
        @error="onError"
      >
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
                  <p class="text-sm text-base-content/60 truncate">{{ command.description }}</p>
                </div>
                <USwitch
                  v-if="state[command.name]"
                  v-model="state[command.name]!.isEnabled"
                  :value="state[command.name]!.name"
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
            </div>
          </template>
        </UAccordion>
      </GuildSettingsForm>
    </GuildSettingsSection>
  </div>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { DisableCommands } from "#shared/types/configurableData";
import type { FlattenedCommand } from "#shared/types/discord";
import type { FormErrorEvent } from "@nuxt/ui";
import { objectValues } from "@sapphire/utilities/objectValues";
import * as y from "yup";

const { commands } = defineProps<{
  commands: FlattenedCommand[];
}>();

const schema = y.mixed<Record<string, DisableCommands.Command>>().required();

type Schema = y.InferType<typeof schema>;

const toast = useToast();
const { guildSettings } = useGuildSettings();

// Track the currently expanded accordion category
const expandedCategory = ref<string | undefined>(undefined);

// Local state for commands - reactive record of command states
const state = reactive<Schema>({});

// Initialize local commands state from props and guild settings
function initializeLocalCommands() {
  if (!commands.length || !guildSettings.value)
    return;

  const newLocalCommands: Record<string, DisableCommands.Command> = {};

  for (const command of commands) {
    if (command.guarded)
      continue;

    newLocalCommands[command.name] = {
      name: command.name,
      description: command.description,
      isEnabled: !guildSettings.value?.disabledCommands?.includes(command.name),
      category: command.category || "General",
    };
  }

  Object.assign(state, newLocalCommands);
}

// Map form state to GuildData changes
function mapToGuildData(formState: Schema): Partial<GuildData> {
  const disabledCommands: string[] = [];

  for (const key in formState) {
    const cmd = formState[key];
    if (cmd && !cmd.isEnabled) {
      disabledCommands.push(cmd.name);
    }
  }

  return { disabledCommands };
}

function getCommandsByCategory(category: string): FlattenedCommand[] {
  return commands.filter(
    cmd => (cmd.category || "General") === category && !cmd.guarded,
  );
}

// Enable all commands in a category
function enableAllInCategory(category: string) {
  const commands = getCommandsByCategory(category);
  for (const command of commands) {
    const cmd = state[command.name];
    if (cmd) {
      state[command.name] = {
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
    const cmd = state[command.name];
    if (cmd) {
      state[command.name] = {
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
    const cmd = state[command.name];
    if (cmd) {
      state[command.name] = {
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

// Form error handler
async function onError(event: FormErrorEvent) {
  const element = event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
  const errorMessage = event.errors[0]?.message;
  toast.add({
    color: "error",
    title: "Error",
    description: `Failed to update disabled commands settings. ${errorMessage ?? "Unknown error"}`,
    icon: "heroicons:x-circle",
  });
}

// Computed categories from available commands
const categories = computed(() => {
  const uniqueCategories = new Set<string>();
  for (const command of commands) {
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

// Track loading state
const loading = computed(() => !commands.length || objectValues(state).length === 0);

// Initialize on mount
onMounted(initializeLocalCommands);

// Re-initialize when guild settings load
watch(guildSettings, (newSettings) => {
  if (newSettings) {
    initializeLocalCommands();
  }
});
</script>
