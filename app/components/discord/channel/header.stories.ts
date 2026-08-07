import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordChannelHeader from "./header.vue";

const meta = {
	component: DiscordChannelHeader,
	title: "Components/Discord/ChannelHeader",
	decorators: [discordDecorator],
	args: {
		name: "mod-commands",
		type: "text",
		topic: "Try WolfStar slash commands in this channel",
		searchPlaceholder: "Search",
		onlineCount: 19,
		notificationCount: 48,
		membersOpen: true,
	},
} satisfies Meta<typeof DiscordChannelHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
