import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordReaction from "./reaction.vue";
import DiscordReactions from "./reactions.vue";

const meta = {
	component: DiscordReactions,
	title: "Components/Discord/Reactions",
	decorators: [discordDecorator],
} satisfies Meta<typeof DiscordReactions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => ({
		components: { DiscordReactions, DiscordReaction },
		template: `
			<DiscordReactions>
				<DiscordReaction :count="5" :self="true">👍</DiscordReaction>
				<DiscordReaction :count="2">🔥</DiscordReaction>
				<DiscordReaction :count="1">✅</DiscordReaction>
			</DiscordReactions>
		`,
	}),
};
