import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordOfflineMembers, discordOnlineMembers } from "~/storybook/discord-fixtures";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordChannelInfo from "./info.vue";

const meta = {
	component: DiscordChannelInfo,
	title: "Components/Discord/ChannelInfo",
	decorators: [discordDecorator],
	args: {
		name: "mod-commands",
		online: discordOnlineMembers,
		offline: discordOfflineMembers,
	},
	parameters: {
		layout: "fullscreen",
	},
	render: (args) => ({
		components: { DiscordChannelInfo },
		setup: () => ({ args }),
		template: `
			<div class="relative mx-auto h-160 w-full max-w-md overflow-hidden">
				<DiscordChannelInfo v-bind="args" />
			</div>
		`,
	}),
} satisfies Meta<typeof DiscordChannelInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Members: Story = {};

export const ThreadsEmpty: Story = {
	args: {
		initialTab: "threads",
	},
};

export const MediaEmpty: Story = {
	args: {
		initialTab: "media",
	},
};
