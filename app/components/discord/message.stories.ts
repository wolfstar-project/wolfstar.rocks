import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import DiscordMessage from "./message.vue";

const meta: Meta<typeof DiscordMessage> = {
	component: DiscordMessage,
	title: "Discord/Message",
	args: {
		name: "wolfstar",
		ephemeral: false,
	},
	argTypes: {
		name: {
			control: "select",
			options: ["wolfstar", "stella", "baddie"],
		},
		ephemeral: {
			control: "boolean",
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BotMessage: Story = {
	args: {
		name: "wolfstar",
	},
	render: (args) => ({
		components: { DiscordMessage },
		setup() {
			return { args };
		},
		template: `<DiscordMessage v-bind="args">Moderation action logged successfully.</DiscordMessage>`,
	}),
	decorators: [
		() => ({
			template: `<div class="p-8 max-w-2xl"><story /></div>`,
		}),
	],
};

export const EphemeralMessage: Story = {
	args: {
		name: "wolfstar",
		ephemeral: true,
	},
	render: (args) => ({
		components: { DiscordMessage },
		setup() {
			return { args };
		},
		template: `<DiscordMessage v-bind="args">This message is only visible to you.</DiscordMessage>`,
	}),
	decorators: [
		() => ({
			template: `<div class="p-8 max-w-2xl"><story /></div>`,
		}),
	],
};

export const WithCommand: Story = {
	args: {
		name: "wolfstar",
		command: { user: "stella", name: "ban" },
	},
	render: (args) => ({
		components: { DiscordMessage },
		setup() {
			return { args };
		},
		template: `<DiscordMessage v-bind="args">User has been banned for 7 days.</DiscordMessage>`,
	}),
	decorators: [
		() => ({
			template: `<div class="p-8 max-w-2xl"><story /></div>`,
		}),
	],
};
