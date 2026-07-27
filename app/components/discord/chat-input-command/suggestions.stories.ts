import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { frequentlyUsedShowcaseCommands } from "~/storybook/discord-fixtures";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordChatInputCommandGroup from "./group.vue";
import DiscordChatInputCommandMatched from "./matched.vue";
import DiscordChatInputCommandSuggestion from "./suggestion.vue";
import DiscordChatInputCommandSuggestions from "./suggestions.vue";

const meta = {
	component: DiscordChatInputCommandSuggestions,
	title: "Components/Discord/ChatInputCommandSuggestions",
	decorators: [discordDecorator],
	args: {
		prefix: "/war",
		selectedApp: null,
	},
} satisfies Meta<typeof DiscordChatInputCommandSuggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FrequentlyUsed: Story = {
	render: (args) => ({
		components: {
			DiscordChatInputCommandSuggestions,
			DiscordChatInputCommandSuggestion,
			DiscordChatInputCommandGroup,
			DiscordChatInputCommandMatched,
		},
		setup: () => ({ args, frequentlyUsedShowcaseCommands }),
		template: `
			<div class="h-[28rem] max-w-2xl overflow-hidden rounded-md">
				<DiscordChatInputCommandSuggestions v-bind="args" class="h-full">
					<template #frequently-used>
						<DiscordChatInputCommandSuggestion
							v-for="(command, index) in frequentlyUsedShowcaseCommands"
							:key="command.name + (command.subcommand ?? '')"
							:name="command.subcommand ? command.name + ' ' + command.subcommand : command.name"
							:description="command.description"
							:active="index === 0"
						/>
					</template>
					<template #matched>
						<DiscordChatInputCommandMatched
							name="warn"
							:active="false"
							:options="[
								{ name: 'user', value: '@baddie' },
								{ name: 'reason', description: 'Reason for the warning', focused: true },
							]"
						/>
					</template>
					<DiscordChatInputCommandGroup app="wolfstar" label="WolfStar">
						<DiscordChatInputCommandSuggestion
							name="warn"
							description="Warn a member in the server"
						/>
						<DiscordChatInputCommandSuggestion
							name="mute"
							description="Mute a member in the server"
						/>
					</DiscordChatInputCommandGroup>
				</DiscordChatInputCommandSuggestions>
			</div>
		`,
	}),
};

export const AppFilter: Story = {
	args: {
		selectedApp: "wolfstar",
		prefix: "/",
	},
	render: (args) => ({
		components: {
			DiscordChatInputCommandSuggestions,
			DiscordChatInputCommandSuggestion,
			DiscordChatInputCommandGroup,
		},
		setup: () => ({ args }),
		template: `
			<div class="h-[28rem] max-w-2xl overflow-hidden rounded-md">
				<DiscordChatInputCommandSuggestions v-bind="args" class="h-full">
					<DiscordChatInputCommandGroup app="wolfstar" label="WolfStar">
						<DiscordChatInputCommandSuggestion
							name="warn"
							description="Warn a member in the server"
							:active="true"
						/>
						<DiscordChatInputCommandSuggestion
							name="ban"
							description="Ban a member from the server"
						/>
						<DiscordChatInputCommandSuggestion
							name="kick"
							description="Kick a member from the server"
						/>
					</DiscordChatInputCommandGroup>
				</DiscordChatInputCommandSuggestions>
			</div>
		`,
	}),
};
