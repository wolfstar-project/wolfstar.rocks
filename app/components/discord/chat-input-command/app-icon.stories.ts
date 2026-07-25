import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordChatInputCommandAppIcon from "./app-icon.vue";

const meta = {
	component: DiscordChatInputCommandAppIcon,
	title: "Components/Discord/ChatInputCommandAppIcon",
	decorators: [discordDecorator],
	args: {
		app: "wolfstar",
		size: "row",
	},
	argTypes: {
		app: {
			control: "select",
			options: ["wolfstar", "staryl", "ring", "fmbot", "utilsbot", "catbot", "dyno"],
		},
		size: {
			control: "inline-radio",
			options: ["header", "rail", "row"],
		},
	},
} satisfies Meta<typeof DiscordChatInputCommandAppIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {};

export const Rail: Story = {
	args: {
		size: "rail",
	},
};

export const Header: Story = {
	args: {
		size: "header",
	},
};
