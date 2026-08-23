import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordOfflineMembers, discordOnlineMembers } from "~/storybook/discord-fixtures";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordMemberList from "./member-list.vue";

const meta = {
	component: DiscordMemberList,
	title: "Components/Discord/MemberList",
	decorators: [discordDecorator],
	args: {
		online: discordOnlineMembers,
		offline: discordOfflineMembers,
		label: "Server members",
		showRoles: true,
	},
} satisfies Meta<typeof DiscordMemberList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { DiscordMemberList },
		setup: () => ({ args }),
		template: `
			<div class="h-[32rem] overflow-hidden rounded-md">
				<DiscordMemberList v-bind="args" class="h-full" />
			</div>
		`,
	}),
};
