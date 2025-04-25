<template>
	<div class="my-2 max-w-none min-w-full flex-1 transition-all duration-200">
		<div class="bg-secondary-light card">
			<div class="card-body">
				<div class="card-title">
					<div v-if="!loading" class="flex flex-row items-center gap-4">
						<div class="w-full md:w-1/3">
							<span class="text-lg font-bold">s!{{ command.name }}</span>
						</div>
						<div class="w-full md:w-2/3">
							<span class="text-sm text-secondary">{{ command.description }}</span>
						</div>
					</div>
					<div v-else class="flex flex-row gap-4">
						<div class="h-8 w-32 skeleton"></div>
						<div class="h-6 w-64 skeleton"></div>
					</div>
				</div>

				<div v-if="loading" class="collapse-content">
					<div class="flex flex-col">
						<template v-if="command.extendedHelp.usages">
							<CommandsExtendedHelpSectionHeader icon="mdi-pencil" header="Command Usage" />
							<div v-for="(usage, index) in command.extendedHelp.usages" :key="index">
								<CommandsExtendedHelpBody :body="`\`WolfStar, ${command.name} ${usage}\``" />
							</div>
						</template>
						<template v-else-if="loading">
							<div class="flex flex-col gap-4 p-4">
								<div v-for="i in 3" :key="i" class="h-24 w-full skeleton"></div>
							</div>
						</template>

						<template v-if="cextendedHelp">
							<CommandsExtendedHelpSectionHeader icon="mdi-help-rhombus" header="Extended Help" />
							<CommandsExtendedHelpBody :body="resolvedExtendedHelp!" />
						</template>

						<template v-if="explainedUsage">
							<CommandsExtendedHelpSectionHeader icon="mdi-code-tags" header="Explained Usage" />
							<CommandsExtendedHelpBody :body="explainedUsage!" />
						</template>

						<template v-if="possibleFormats">
							<CommandsExtendedHelpSectionHeader icon="mdi-brush" header="Possible Formats" />
							<CommandsExtendedHelpBody :body="possibleFormats!" />
						</template>

						<template v-if="examples">
							<CommandsExtendedHelpSectionHeader icon="mdi-lightbulb-outline" header="Examples" />
							<CommandsExtendedHelpBody :body="examples" />
						</template>

						<template v-if="creminder">
							<CommandsExtendedHelpSectionHeader icon="mdi-bell-alert" header="Reminder" />
							<CommandsExtendedHelpBody :body="reminder" />
						</template>
					</div>
				</div>
				<div class="card-actions justify-end border-t border-gray-200 pt-4 dark:border-gray-800">
					<CommandsChips :command="command" :loading="loading" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
interface CommandProps {
	command: FlattenedCommand;
	loading?: boolean;
}

const props = withDefaults(defineProps<CommandProps>(), {
	loading: false
});

const resolveContent = (content: string | string[], multiline = false) => {
	if (!content) return null;
	try {
		return Array.isArray(content) ? content.join(multiline ? '\n\n' : ' ') : content.trim();
	} catch {
		return null;
	}
};

const resolvedExtendedHelp = computed(() => resolveContent(props.command.extendedHelp.extendedHelp, true));

const explainedUsage = computed(() =>
	resolveContent(
		props.command.extendedHelp.explainedUsage.map(([arg, desc]) => `- **${arg}**: ${resolveContent(desc)}`),
		true
	)
);

const possibleFormats = computed(() =>
	resolveContent(
		props.command.extendedHelp.possibleFormats.map(([type, example]) => `- **${type}**: ${example}`),
		true
	)
);

const examples = computed(() =>
	resolveContent(
		props.command.extendedHelp.examples.filter((example) => example !== null).map((example) => `- WolfStar, ${props.command.name}*${example}*`),
		true
	)
);

const reminder = computed(() => resolveContent(props.command.extendedHelp.reminder, true));
</script>

<style scoped>
.chips-container {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.chip {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-radius: 0.5rem;
	background-color: var(--primary-color);
	padding: 0.5rem 1rem;
	color: white;
}

.chip.secondary {
	background-color: var(--secondary-color);
}
</style>
