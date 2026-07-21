import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordScrollbar from "./scrollbar.vue";

const meta = {
	component: DiscordScrollbar,
	title: "Components/Discord/Scrollbar",
	decorators: [discordDecorator],
	args: {
		alwaysShowTrack: true,
		showArrows: false,
		minThumbHeight: 24,
	},
} satisfies Meta<typeof DiscordScrollbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { DiscordScrollbar },
		setup: () => ({ args }),
		template: `
			<div class="h-48 w-72 overflow-hidden rounded-md border border-default">
				<DiscordScrollbar v-bind="args" class="h-full">
					<p v-for="n in 24" :key="n" class="px-3 py-1">Scrollable row {{ n }}</p>
				</DiscordScrollbar>
			</div>
		`,
	}),
};
