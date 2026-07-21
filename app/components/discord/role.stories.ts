import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordRole from "./role.vue";

const meta = {
	component: DiscordRole,
	title: "Components/Discord/Role",
	decorators: [discordDecorator],
	args: {
		color: "#5865F2",
	},
} satisfies Meta<typeof DiscordRole>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { DiscordRole },
		setup: () => ({ args }),
		template: `<DiscordRole v-bind="args">Moderator</DiscordRole>`,
	}),
};

export const CustomColor: Story = {
	args: {
		color: "#EB459E",
	},
	render: (args) => ({
		components: { DiscordRole },
		setup: () => ({ args }),
		template: `<DiscordRole v-bind="args">Developers</DiscordRole>`,
	}),
};
