import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordAvatar from "./avatar.vue";

const meta = {
	component: DiscordAvatar,
	title: "Components/Discord/Avatar",
	decorators: [discordDecorator],
	args: {
		user: "wolfstar",
		size: "medium",
	},
	argTypes: {
		user: {
			control: "select",
			options: ["baddie", "louduser", "redstar", "stella", "wolfstar"],
		},
		size: {
			control: "inline-radio",
			options: ["medium", "tiny"],
		},
	},
} satisfies Meta<typeof DiscordAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Medium: Story = {};

export const Tiny: Story = {
	args: {
		size: "tiny",
		user: "stella",
	},
};
