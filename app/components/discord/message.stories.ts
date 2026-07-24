import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { caseEmbedColor } from "~/storybook/discord-fixtures";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordEmbed from "./embed.vue";
import DiscordMention from "./mention.vue";
import DiscordMessage from "./message.vue";
import DiscordReaction from "./reaction.vue";
import DiscordReactions from "./reactions.vue";

const meta = {
	component: DiscordMessage,
	title: "Components/Discord/Message",
	decorators: [discordDecorator],
	args: {
		name: "wolfstar",
		timestamp: "Today at 15:49",
		ephemeral: false,
	},
	argTypes: {
		name: {
			control: "select",
			options: ["baddie", "louduser", "redstar", "stella", "wolfstar"],
		},
	},
} satisfies Meta<typeof DiscordMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { DiscordMessage },
		setup: () => ({ args }),
		template: `<DiscordMessage v-bind="args">Saved all changes.</DiscordMessage>`,
	}),
};

export const WithCommandReply: Story = {
	args: {
		reply: {
			kind: "command",
			user: "stella",
			commandName: "warn",
		},
	},
	render: (args) => ({
		components: { DiscordMessage, DiscordMention },
		setup: () => ({ args }),
		template: `
			<DiscordMessage v-bind="args">
				✅ Created case 3 |
				<DiscordMention kind="mention" avatar="/avatars/baddie.png">baddie</DiscordMention>
			</DiscordMessage>
		`,
	}),
};

export const WithMessageReply: Story = {
	args: {
		name: "redstar",
		reply: {
			kind: "message",
			user: "stella",
			content: "Can someone help?",
		},
	},
	render: (args) => ({
		components: { DiscordMessage },
		setup: () => ({ args }),
		template: `<DiscordMessage v-bind="args">On it — checking the audit log.</DiscordMessage>`,
	}),
};

export const Ephemeral: Story = {
	args: {
		ephemeral: true,
	},
	render: (args) => ({
		components: { DiscordMessage },
		setup: () => ({ args }),
		template: `<DiscordMessage v-bind="args">Only you can see this configuration menu.</DiscordMessage>`,
	}),
};

export const WithEmbedAndReactions: Story = {
	args: {
		reply: {
			kind: "command",
			user: "stella",
			commandName: "case",
		},
	},
	render: (args) => ({
		components: {
			DiscordMessage,
			DiscordEmbed,
			DiscordMention,
			DiscordReactions,
			DiscordReaction,
		},
		setup: () => ({ args, caseEmbedColor, caseTimestamp: 1_721_145_000_000 }),
		template: `
			<DiscordMessage v-bind="args">
				<DiscordEmbed
					:color="caseEmbedColor"
					:footer="{ icon: '/avatars/wolfstar.png', text: 'Case 3' }"
					:timestamp="caseTimestamp"
				>
					<span><strong>❯ Type:</strong>{{ " " }}Warning</span><br />
					<span>
						<strong>❯ User:</strong>{{ " " }}
						<DiscordMention kind="mention" avatar="/avatars/baddie.png"
							>baddie</DiscordMention
						>
						{{ " " }}(541738403230777351)
					</span><br />
					<span><strong>❯ Reason:</strong>{{ " " }}spam</span>
				</DiscordEmbed>
				<DiscordReactions>
					<DiscordReaction :count="3" :self="true">👍</DiscordReaction>
				</DiscordReactions>
			</DiscordMessage>
		`,
	}),
};
