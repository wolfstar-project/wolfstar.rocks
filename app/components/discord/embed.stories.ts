import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { caseEmbedColor } from "~/storybook/discord-fixtures";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordEmbed from "./embed.vue";
import DiscordMention from "./mention.vue";

const meta = {
	component: DiscordEmbed,
	title: "Components/Discord/Embed",
	decorators: [discordDecorator],
	args: {
		title: "Moderation case",
		color: caseEmbedColor,
		theme: "dark",
		footer: {
			icon: "/avatars/wolfstar.png",
			text: "Case 3",
		},
		timestamp: 1_721_145_000_000,
	},
} satisfies Meta<typeof DiscordEmbed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Case: Story = {
	render: (args) => ({
		components: { DiscordEmbed, DiscordMention },
		setup: () => ({ args }),
		template: `
			<DiscordEmbed v-bind="args">
				<span><strong>❯ Type:</strong>{{ " " }}Warning</span><br />
				<span>
					<strong>❯ User:</strong>{{ " " }}
					<DiscordMention kind="mention">baddie</DiscordMention>
				</span><br />
				<span><strong>❯ Reason:</strong>{{ " " }}spam</span><br />
				<span>
					<strong>❯ Moderator:</strong>{{ " " }}
					<DiscordMention kind="mention">stella</DiscordMention>
				</span>
			</DiscordEmbed>
		`,
	}),
};

export const WithAuthor: Story = {
	args: {
		title: undefined,
		author: {
			icon: "/avatars/wolfstar.png",
			name: "WolfStar",
		},
		footer: undefined,
		timestamp: undefined,
	},
	render: (args) => ({
		components: { DiscordEmbed },
		setup: () => ({ args }),
		template: `<DiscordEmbed v-bind="args">Configuration saved successfully.</DiscordEmbed>`,
	}),
};
