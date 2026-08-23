import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordChatMessages } from "~/storybook/discord-fixtures";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordChat from "./chat.vue";

const meta = {
	component: DiscordChat,
	title: "Components/Discord/Chat",
	decorators: [discordDecorator],
	args: {
		channelName: "mod-commands",
		date: "July 16, 2026",
		dateTime: "2026-07-16",
		messages: discordChatMessages,
	},
} satisfies Meta<typeof DiscordChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { DiscordChat },
		setup: () => ({ args }),
		template: `
			<div class="h-[28rem] overflow-hidden rounded-md">
				<DiscordChat v-bind="args" class="h-full" />
			</div>
		`,
	}),
};
