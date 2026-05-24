import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ManagePage from "./manage.vue";

const meta: Meta<typeof ManagePage> = {
	component: ManagePage,
	title: "Pages/Dashboard/Manage",
	decorators: [
		() => ({
			template: `
				<UDashboardGroup>
					<story />
				</UDashboardGroup>
			`,
		}),
	],
	parameters: {
		layout: "fullscreen",
		// Route must supply the guild ID path parameter
		nuxt: {
			route: { params: { id: ["123456789012345678", "manage"] } },
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
