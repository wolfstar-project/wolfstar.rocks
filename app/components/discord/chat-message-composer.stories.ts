import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordChatMessageComposer from "./chat-message-composer.vue";

const meta = {
	component: DiscordChatMessageComposer,
	title: "Components/Discord/ChatMessageComposer",
	decorators: [discordDecorator],
	args: {
		channelName: "mod-commands",
		modelValue: "",
	},
} satisfies Meta<typeof DiscordChatMessageComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithSlash: Story = {
	args: {
		modelValue: "/warn",
	},
};
