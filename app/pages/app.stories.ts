import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { useActiveGuild } from "~/composables/useActiveGuild";
import { useGuildData } from "~/composables/useGuildData";
import { useGuildSettings } from "~/composables/useGuildSettings";
import { mockGuild } from "~/storybook/mocks/fixtures";
import { createMockGuildData } from "~~/test/mocks/guildData";
import AppPage from "./app.vue";

const MOCK_GUILD_ID = "123456789012345678";

const meta: Meta<typeof AppPage> = {
	component: AppPage,
	title: "Pages/Dashboard/App",
	decorators: [
		() => ({
			setup() {
				// The dashboard layout normally fetches and seeds the guild data
				// and settings before rendering. This story renders the page in
				// isolation, so pick the guild and seed the shared state the page
				// (and its sections, e.g. General.vue) read from.
				const { selectGuild } = useActiveGuild();
				const { setGuildData } = useGuildData();
				const { setGuildSettings } = useGuildSettings();
				selectGuild(MOCK_GUILD_ID);
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
		nuxt: {
			route: { path: "/app" },
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
