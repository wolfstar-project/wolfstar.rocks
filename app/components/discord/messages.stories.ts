import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordMessage from "./message.vue";
import DiscordMessages from "./messages.vue";

const meta = {
	component: DiscordMessages,
	title: "Components/Discord/Messages",
	decorators: [discordDecorator],
} satisfies Meta<typeof DiscordMessages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => ({
		components: { DiscordMessages, DiscordMessage },
		template: `
			<DiscordMessages>
				<DiscordMessage name="stella" timestamp="Today at 15:47">
					Can someone mute Baddie?
				</DiscordMessage>
				<DiscordMessage name="wolfstar" timestamp="Today at 15:49">
					✅ Created case 3 | @baddie
				</DiscordMessage>
			</DiscordMessages>
		`,
	}),
};
