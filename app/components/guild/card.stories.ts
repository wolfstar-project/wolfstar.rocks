import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { mockGuild, mockGuildNotManaged } from "~/storybook/mocks/fixtures";
import GuildCard from "./card.vue";

const meta: Meta<typeof GuildCard> = {
	component: GuildCard,
	title: "Guild/Card",
	decorators: [
		() => ({
			template: `<div class="grid grid-cols-2 gap-4 p-8 max-w-2xl"><story /></div>`,
		}),
	],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Manageable: Story = {
	args: {
		guild: mockGuild,
	},
};

export const NotManageable: Story = {
	args: {
		guild: mockGuildNotManaged,
	},
};

export const Loading: Story = {
	args: {
		loading: true,
	},
};
