import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordMention from "./mention.vue";

const meta = {
	component: DiscordMention,
	title: "Components/Discord/Mention",
	decorators: [discordDecorator],
	args: {
		kind: "mention",
	},
} satisfies Meta<typeof DiscordMention>;

export default meta;
type Story = StoryObj<typeof meta>;

export const User: Story = {
	render: (args) => ({
		components: { DiscordMention },
		setup: () => ({ args }),
		template: `<DiscordMention v-bind="args">baddie</DiscordMention>`,
	}),
};

export const App: Story = {
	args: {
		kind: "app",
	},
	render: (args) => ({
		components: { DiscordMention },
		setup: () => ({ args }),
		template: `<DiscordMention v-bind="args">WolfStar</DiscordMention>`,
	}),
};
