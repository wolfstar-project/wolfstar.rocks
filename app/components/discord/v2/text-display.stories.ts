import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordV2TextDisplay from "./text-display.vue";

const meta = {
	component: DiscordV2TextDisplay,
	title: "Components/Discord/V2/TextDisplay",
	decorators: [discordDecorator],
} satisfies Meta<typeof DiscordV2TextDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => ({
		components: { DiscordV2TextDisplay },
		template: `
			<DiscordV2TextDisplay>
Currently at: 📁 Root
Use the menu below to navigate.
			</DiscordV2TextDisplay>
		`,
	}),
};
