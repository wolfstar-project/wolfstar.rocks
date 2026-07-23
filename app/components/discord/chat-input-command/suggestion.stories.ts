import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordChatInputCommandSuggestion from "./suggestion.vue";

const meta = {
	component: DiscordChatInputCommandSuggestion,
	title: "Components/Discord/ChatInputCommandSuggestion",
	decorators: [discordDecorator],
	args: {
		name: "warn",
		description: "Warn a member in the server",
		app: "wolfstar",
		active: true,
		disabled: false,
	},
} satisfies Meta<typeof DiscordChatInputCommandSuggestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
	render: (args) => ({
		components: { DiscordChatInputCommandSuggestion },
		setup: () => ({ args }),
		template: `
			<div role="listbox" aria-label="Slash command suggestions" class="max-w-xl">
				<DiscordChatInputCommandSuggestion v-bind="args" />
			</div>
		`,
	}),
};

export const Inactive: Story = {
	args: {
		active: false,
		name: "ban",
		description: "Ban a member from the server",
	},
	render: (args) => ({
		components: { DiscordChatInputCommandSuggestion },
		setup: () => ({ args }),
		template: `
			<div role="listbox" aria-label="Slash command suggestions" class="max-w-xl">
				<DiscordChatInputCommandSuggestion v-bind="args" />
			</div>
		`,
	}),
};

export const Disabled: Story = {
	args: {
		active: false,
		disabled: true,
		app: "dyno",
		name: "ban",
		description: "Third-party command (not selectable in this mock)",
	},
	render: (args) => ({
		components: { DiscordChatInputCommandSuggestion },
		setup: () => ({ args }),
		template: `
			<div role="listbox" aria-label="Slash command suggestions" class="max-w-xl">
				<DiscordChatInputCommandSuggestion v-bind="args" />
			</div>
		`,
	}),
};
