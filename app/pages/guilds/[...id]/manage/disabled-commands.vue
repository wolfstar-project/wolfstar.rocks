<template>
  <div>
    <LayoutRefreshCommands @fresh="(newCommands: FlattenedCommand[]) => emit('update:commands', newCommands)" />
    <GuildSettingsSection title="Commands" description="On this page you can disable commands on your server">
      <UForm ref="form" :state="state" :schema="schema" class="space-y-4" @submit="onSubmit" @error="onError">
        <UAccordion :items="accordionItems" multiple>
          <template #default="{ item, open }">
            <UButton color="neutral" variant="ghost" class="border-b border-gray-200 dark:border-gray-700">
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
          <template #content="{ item }">
            <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <UFormGroup v-for="command in getCommandsByCategory(item.label)" :key="command.name" :name="command.name" :label="command.name" :description="parseCommandDescription(command.description)">
                <UToggle
                  v-model="state[command.name]"
                />
              </UFormGroup>
            </div>
            <div class="flex justify-end space-x-2 p-4">
              <UButton color="success" @click="toggleCategory(item.label, true)">
                Enable all
              </UButton>
              <UButton color="warning" @click="toggleCategory(item.label, false)">
                Disable all
              </UButton>
              <UButton color="error" @click="parseCommandsToState">
                Reset
              </UButton>
            </div>
          </template>
        </UAccordion>

        <UButton type="submit" color="primary">
          Save Changes
        </UButton>
      </UForm>
    </GuildSettingsSection>
  </div>
</template>

<script setup lang="ts">
import type { FlattenedCommand } from "#shared/types/discord";
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import * as yup from "yup";

const emit = defineEmits<{
  (e: "update:commands", commands: FlattenedCommand[]): void;
}>();

const { commands } = useCommands();

const toast = useToast();
const { settings, changes } = useGuildSettings();

const schema = computed(() => {
  const shape: Record<string, yup.BooleanSchema> = {};
  for (const command of commands.value) {
    if (!command.guarded) {
      shape[command.name] = yup.boolean();
    }
  }
  return yup.object(shape);
});

type Schema = yup.InferType<typeof schema.value>;

const state = reactive<Schema>({});

const categories = computed(() => [...new Set(commands.value.filter(c => !c.guarded).map(command => command.category || "General"))]);

const accordionItems = computed(() => categories.value.map(category => ({
  label: category,
  content: `Commands in the ${category} category`,
})));

const getCommandsByCategory = (category: string) => {
  return commands.value.filter(cmd => (cmd.category || "General") === category && !cmd.guarded);
};

const parseCommandDescription = (description: string) => description;

function toggleCategory(category: string, enable: boolean) {
  for (const command of getCommandsByCategory(category)) {
    state[command.name] = enable;
  }
}

function parseCommandsToState() {
  const commandsForState: Schema = {};
  for (const command of commands.value) {
    if (command.guarded)
      continue;
    commandsForState[command.name] = !settings.value.disabledCommands?.includes(command.name);
  }
  Object.assign(state, commandsForState);
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const disabledCommands = Object.entries(event.data)
    .filter(([_, isEnabled]) => !isEnabled)
    .map(([name]) => name);

  changes({
    disabledCommands,
  });

  toast.add({
    color: "success",
    title: "Success",
    description: "Commands settings saved successfully",
    icon: "i-heroicons-check-circle",
  });
}

async function onError(event: FormErrorEvent) {
  const errorMessage = event.errors[0]?.message;
  toast.add({
    color: "error",
    title: "Error",
    description: `Failed to save commands settings. Please try again later.\n${errorMessage ?? "Unknown error"}`,
    icon: "i-heroicons-x-circle",
  });
}

onMounted(parseCommandsToState);
</script>
