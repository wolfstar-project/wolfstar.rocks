import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import Separator from "./Separator.vue";

const meta: Meta<typeof Separator> = {
	component: Separator,
	title: "Components/Separator",
	args: {
		orientation: "horizontal",
	},
	argTypes: {
		orientation: {
			control: "select",
			options: ["horizontal", "vertical"],
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
	args: {
		orientation: "horizontal",
	},
	decorators: [
		() => ({
			template: `<div class="w-full p-8"><story /></div>`,
		}),
	],
};

export const Vertical: Story = {
	args: {
		orientation: "vertical",
	},
	decorators: [
		() => ({
			template: `<div class="flex h-32 items-center p-8"><story /></div>`,
		}),
	],
};
