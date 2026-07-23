import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { pageDecorator } from "../../../.storybook/decorators";
import PrivacyPage from "./privacy.vue";

const meta: Meta<typeof PrivacyPage> = {
	component: PrivacyPage,
	title: "Pages/Marketing/Privacy",
	decorators: [pageDecorator],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
