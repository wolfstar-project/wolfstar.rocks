import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { pageDecorator } from "../../../../.storybook/decorators";
import StarylPage from "./index.vue";

const meta: Meta<typeof StarylPage> = {
	component: StarylPage,
	title: "Pages/Marketing/Staryl",
	decorators: [pageDecorator],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
