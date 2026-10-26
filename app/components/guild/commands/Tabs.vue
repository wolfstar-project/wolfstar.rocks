<template>
	<UTabs
		v-model="tab"
		:items="tabs"
		variant="link"
		:unmount-on-hide="false"
		class="w-full gap-0"
		:aria-label="ts('guild_settings.command_tabs.aria')"
		:ui="{
			list: 'justify-start gap-1 overflow-x-auto border-b border-(--home-border-subtle) p-0',
			trigger:
				'min-h-11 shrink-0 gap-2 px-3.5 text-[0.9375rem] font-normal data-[state=active]:font-bold data-[state=active]:text-highlighted',
			content: 'pt-4',
		}"
	>
		<template #content="{ item }">
			<GuildSettingsDisabledCommands v-if="item.value === 'disabled'" :commands />
			<GuildCommandsRules v-else-if="item.value === 'rules'" :commands />
			<slot v-else-if="item.value === 'discord'" name="discord" />
		</template>
	</UTabs>
</template>

<script setup lang="ts">
import type { FlattenedCommand } from "#shared/types/discord";

type CommandsTab = "disabled" | "rules" | "discord";

const { commands, discord = false } = defineProps<{
	commands: FlattenedCommand[];
	/** Whether the Discord permissions tab is offered. */
	discord?: boolean;
}>();

const { ts } = useI18n();
const tab = ref<CommandsTab>("disabled");

const tabs = computed<{ value: CommandsTab; label: string }[]>(() => [
	{ value: "disabled", label: ts("guild_settings.command_tabs.disabled") },
	{ value: "rules", label: ts("guild_settings.command_tabs.rules") },
	...(discord
		? [{ value: "discord" as const, label: ts("guild_settings.command_tabs.discord") }]
		: []),
]);
</script>
