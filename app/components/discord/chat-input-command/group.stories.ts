import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordChatInputCommandGroup from "./group.vue";
import DiscordChatInputCommandSuggestion from "./suggestion.vue";

const meta = {
	component: DiscordChatInputCommandGroup,
	title: "Components/Discord/ChatInputCommandGroup",
	decorators: [discordDecorator],
	args: {
		app: "wolfstar",
		label: "WolfStar",
	},
} satisfies Meta<typeof DiscordChatInputCommandGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { DiscordChatInputCommandGroup, DiscordChatInputCommandSuggestion },
		setup: () => ({ args }),
		template: `
			<div role="listbox" aria-label="Slash command groups" class="max-w-xl">
				<DiscordChatInputCommandGroup v-bind="args">
					<DiscordChatInputCommandSuggestion
						name="warn"
						description="Warn a member in the server"
						:active="true"
					/>
					<DiscordChatInputCommandSuggestion
						name="ban"
						description="Ban a member from the server"
					/>
				</DiscordChatInputCommandGroup>
			</div>
		`,
	}),
};
