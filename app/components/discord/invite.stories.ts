import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordInvite from "./invite.vue";

const meta = {
	component: DiscordInvite,
	title: "Components/Discord/Invite",
	decorators: [discordDecorator],
	args: {
		link: "/join",
		online: 150,
		members: 3000,
	},
} satisfies Meta<typeof DiscordInvite>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
