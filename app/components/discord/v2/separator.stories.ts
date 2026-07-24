import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordV2Separator from "./separator.vue";

const meta = {
	component: DiscordV2Separator,
	title: "Components/Discord/V2/Separator",
	decorators: [discordDecorator],
	args: {
		spacing: "small",
		divider: true,
	},
} satisfies Meta<typeof DiscordV2Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {};

export const Large: Story = {
	args: {
		spacing: "large",
	},
};

export const WithoutDivider: Story = {
	args: {
		divider: false,
	},
};
