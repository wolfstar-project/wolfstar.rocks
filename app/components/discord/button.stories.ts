import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordButton from "./button.vue";

const meta = {
	component: DiscordButton,
	title: "Components/Discord/Button",
	decorators: [discordDecorator],
	args: {
		label: "Primary",
		variant: "primary",
		disabled: true,
	},
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary", "success", "danger", "link"],
		},
	},
} satisfies Meta<typeof DiscordButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
	args: {
		label: "Cancel",
		variant: "secondary",
	},
};

export const Success: Story = {
	args: {
		label: "Confirm",
		variant: "success",
	},
};

export const Danger: Story = {
	args: {
		label: "Stop",
		variant: "danger",
		icon: "ph:stop-fill",
	},
};

export const Link: Story = {
	args: {
		label: "Learn more",
		variant: "link",
	},
};
