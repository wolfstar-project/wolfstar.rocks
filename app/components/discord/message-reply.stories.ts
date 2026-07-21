import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordMessageReply from "./message-reply.vue";

const meta = {
	component: DiscordMessageReply,
	title: "Components/Discord/MessageReply",
	decorators: [discordDecorator],
	args: {
		kind: "command",
		user: "stella",
		commandName: "warn",
	},
} satisfies Meta<typeof DiscordMessageReply>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Command: Story = {
	render: (args) => ({
		components: { DiscordMessageReply },
		setup: () => ({ args }),
		template: `
			<div class="discord-message-with-reply" style="--message-reply-avatar-size: 1rem; --message-reply-gutter: 1rem;">
				<DiscordMessageReply v-bind="args" />
			</div>
		`,
	}),
};

export const Message: Story = {
	args: {
		kind: "message",
		user: "stella",
		content: "Can someone help with mutes?",
		commandName: undefined,
	},
	render: (args) => ({
		components: { DiscordMessageReply },
		setup: () => ({ args }),
		template: `
			<div class="discord-message-with-reply" style="--message-reply-avatar-size: 1rem; --message-reply-gutter: 1rem;">
				<DiscordMessageReply v-bind="args" />
			</div>
		`,
	}),
};
