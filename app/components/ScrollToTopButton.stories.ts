import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ScrollToTopButton from "./ScrollToTopButton.vue";

const meta: Meta<typeof ScrollToTopButton> = {
	component: ScrollToTopButton,
	title: "Components/ScrollToTopButton",
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	decorators: [
		() => ({
			template: `<div class="flex h-32 items-center justify-center p-8"><story /></div>`,
		}),
	],
};
