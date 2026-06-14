import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ManagePage from "./manage.vue";

const meta: Meta<typeof ManagePage> = {
	component: ManagePage,
	title: "Pages/Dashboard/Manage",
	decorators: [
		() => ({
			template: `
				<UDashboardGroup unit="rem">
					<UDashboardSidebar
						id="default"
						collapsible
						resizable
						:ui="{
							header: 'bg-base-200/80',
							body: 'bg-base-200/80 border-r border-base-200',
							footer: 'bg-base-200/80 border-t border-b border-base-200',
						}"
					/>
					<story />
				</UDashboardGroup>
			`,
		}),
	],
	parameters: {
		layout: "fullscreen",
		// Route must supply the guild snowflake; "manage" is a static path segment, not part of :id
		nuxt: {
			route: { params: { id: "123456789012345678" } },
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
