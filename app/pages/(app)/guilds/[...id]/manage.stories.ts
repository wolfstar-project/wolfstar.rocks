import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { useGuildData } from "~/composables/useGuildData";
import { useGuildSettings } from "~/composables/useGuildSettings";
import { mockGuild } from "~/storybook/mocks/fixtures";
import { createMockGuildData } from "~~/test/mocks/guildData";
import ManagePage from "./manage.vue";

const MOCK_GUILD_ID = "123456789012345678";

const meta: Meta<typeof ManagePage> = {
	component: ManagePage,
	title: "Pages/Dashboard/Manage",
	decorators: [
		() => ({
			setup() {
				// The dashboard layout normally fetches and seeds the guild data
				// and settings before rendering. This story renders the page in
				// isolation, so seed the shared state the page (and its sections,
				// e.g. General.vue) read from to avoid undefined access.
				const { setGuildData } = useGuildData();
				const { setGuildSettings } = useGuildSettings();
				setGuildData(mockGuild);
				setGuildSettings(createMockGuildData(MOCK_GUILD_ID));
			},
			template: `
				<UDashboardGroup unit="rem">
					<UDashboardSidebar
						id="default"
						collapsible
						resizable
						:ui="{
							header: 'bg-muted/80',
							body: 'bg-muted/80 border-r border-muted',
							footer: 'bg-muted/80 border-t border-b border-muted',
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
			route: { params: { id: MOCK_GUILD_ID } },
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
