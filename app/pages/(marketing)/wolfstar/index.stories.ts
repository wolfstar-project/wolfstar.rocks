import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { pageDecorator } from "../../../../.storybook/decorators";
import WolfStarPage from "./index.vue";

const meta: Meta<typeof WolfStarPage> = {
	component: WolfStarPage,
	title: "Pages/Marketing/WolfStar",
	decorators: [pageDecorator],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
