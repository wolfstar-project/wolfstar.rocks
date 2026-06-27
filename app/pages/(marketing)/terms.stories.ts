import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { pageDecorator } from "../../../.storybook/decorators";
import TermsPage from "./terms.vue";

const meta: Meta<typeof TermsPage> = {
	component: TermsPage,
	title: "Pages/Marketing/Terms",
	decorators: [pageDecorator],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
