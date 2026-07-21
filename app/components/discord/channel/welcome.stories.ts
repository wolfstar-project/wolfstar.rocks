import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordChannelWelcome from "./welcome.vue";

const meta = {
	component: DiscordChannelWelcome,
	title: "Components/Discord/ChannelWelcome",
	decorators: [discordDecorator],
	args: {
		channelName: "mod-commands",
		date: "July 16, 2026",
		dateTime: "2026-07-16",
	},
} satisfies Meta<typeof DiscordChannelWelcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
