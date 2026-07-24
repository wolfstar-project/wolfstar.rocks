import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordReaction from "./reaction.vue";

const meta = {
	component: DiscordReaction,
	title: "Components/Discord/Reaction",
	decorators: [discordDecorator],
	args: {
		count: 5,
		self: false,
	},
} satisfies Meta<typeof DiscordReaction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { DiscordReaction },
		setup: () => ({ args }),
		template: `<DiscordReaction v-bind="args">👍</DiscordReaction>`,
	}),
};

export const SelfReacted: Story = {
	args: {
		count: 12,
		self: true,
	},
	render: (args) => ({
		components: { DiscordReaction },
		setup: () => ({ args }),
		template: `<DiscordReaction v-bind="args">🔥</DiscordReaction>`,
	}),
};
