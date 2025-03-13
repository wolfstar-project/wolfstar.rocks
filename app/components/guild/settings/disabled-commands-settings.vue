<template>
	<div>
		<layout-refresh-commands :set-commands="setGuildSettingsChanges" @fresh="(newCommands) => emit('update:commands', newCommands)" />

		<form-auto-save :model-value="formData" :schema="guildSettingsSchema" @submit="saveChanges">
			<layout-settings-section title="Commands">
				<p class="mb-4 text-sm">On this page you can disable commands on your server</p>

				<div v-for="category in categories" :key="category" class="mb-4">
					<div class="collapse-arrow bg-base-200 collapse">
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
								<button class="join btn btn-success btn-sm" @click="toggleCategory(category, true)">Enable all</button>
								<button class="join btn btn-warning btn-sm" @click="toggleCategory(category, false)">Disable all</button>
								<button class="join btn btn-error btn-sm" @click="parseCommandsToLocalCommands">Reset</button>
								<button class="join btn btn-primary btn-sm" @click="saveChanges">Save</button>
							</div>
						</div>
					</div>
				</div>
			</layout-settings-section>
		</form-auto-save>
	</div>
</template>

<script setup lang="ts">
import type { FlattenedCommand } from '~~/shared/types';
import type { DisableCommands } from '~~/lib/types/types/ConfigurableData';
import { z } from 'zod';

const props = defineProps<{
	commands: FlattenedCommand[];
}>();

const emit = defineEmits<{
	(e: 'update:commands', commands: FlattenedCommand[]): void;
}>();

const { settings, changes } = useGuildSettings();

const loading = ref(true);
const localCommands = ref<Record<string, DisableCommands.Command>>({});
const expandedCategory = ref<string | null>(null);

const guildSettingsSchema = z.object({
	disabledCommands: z.array(z.custom<FlattenedCommand>())
});
type FormData = z.infer<typeof guildSettingsSchema>;

const parseCommandsToLocalCommands = () => {
	loading.value = true;
	const commandsForState: Record<string, DisableCommands.Command> = {};
	for (const command of props.commands) {
		if (command.guarded) continue;
		commandsForState[command.name] = {
			name: command.name,
			description: command.description,
			isEnabled: !settings.value.disabledCommands?.includes(command.name) || true,
			category: command.category
		};
	}
	localCommands.value = commandsForState;
	loading.value = false;
};

onMounted(parseCommandsToLocalCommands);

const categories = computed(() => [...new Set(Object.values(localCommands.value).map((command) => command.category))]);

const getCommandsByCategory = (category: string) => Object.values(localCommands.value).filter((cmd) => cmd.category === category);

const parseCommandDescription = (description: string) => description;

const toggleCommand = (commandName: string) => {
	const command = localCommands.value[commandName];
	if (command) {
		command.isEnabled = !command.isEnabled;
	}
};

const formData = computed(() => ({
	disabledCommands: Object.entries(localCommands.value)
		.filter(([_, command]) => !command.isEnabled)
		.map(([name]) => name)
}));

const saveChanges = async (event: FormData) => {
	try {
		const disabledCommands = event.data.disabledCommands;
		changes({
			disabledCommands
		});
		toast.success('Commands settings saved successfully');
	} catch (error) {
		toast.error('Failed to save commands settings');
		console.error('Failed to save commands settings:', error);
	}
};
</script>
