import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordChatInputCommand from "./index.vue";

const meta = {
	component: DiscordChatInputCommand,
	title: "Components/Discord/ChatInputCommand",
	decorators: [discordDecorator],
	args: {
		name: "warn",
		options: [
			{ name: "user", value: "@baddie" },
			{ name: "reason", value: "spam", focused: true },
		],
	},
} satisfies Meta<typeof DiscordChatInputCommand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warn: Story = {};

export const WithSubcommand: Story = {
	args: {
		name: "conf",
		subcommand: "menu",
		options: [],
	},
};

export const WithSubcommandGroup: Story = {
	args: {
		name: "moderation",
		subcommandGroup: "case",
		subcommand: "view",
		options: [{ name: "case", value: "3", focused: true }],
	},
};
