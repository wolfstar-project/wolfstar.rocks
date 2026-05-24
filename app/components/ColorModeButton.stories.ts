import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ColorModeButton from "./ColorModeButton.vue";

const meta: Meta<typeof ColorModeButton> = {
	component: ColorModeButton,
	title: "Components/ColorModeButton",
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	decorators: [
		() => ({
			template: `<div class="flex items-center justify-center p-8"><story /></div>`,
		}),
	],
};
