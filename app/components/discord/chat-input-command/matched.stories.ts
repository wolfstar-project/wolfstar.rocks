import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordChatInputCommandMatched from "./matched.vue";

const meta = {
	component: DiscordChatInputCommandMatched,
	title: "Components/Discord/ChatInputCommandMatched",
	decorators: [discordDecorator],
	args: {
		name: "ban",
		active: true,
		options: [
			{ name: "user", value: "@baddie" },
			{ name: "reason", description: "Reason for the ban", focused: true },
		],
	},
} satisfies Meta<typeof DiscordChatInputCommandMatched>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { DiscordChatInputCommandMatched },
		setup: () => ({ args }),
		template: `
			<div role="listbox" aria-label="Matched slash commands" class="max-w-xl">
				<DiscordChatInputCommandMatched v-bind="args" />
			</div>
		`,
	}),
};
