import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordActionRow from "./action-row.vue";
import DiscordButton from "./button.vue";

const meta = {
	component: DiscordActionRow,
	title: "Components/Discord/ActionRow",
	decorators: [discordDecorator],
} satisfies Meta<typeof DiscordActionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
	render: () => ({
		components: { DiscordActionRow, DiscordButton },
		template: `
			<DiscordActionRow>
				<DiscordButton label="Confirm" variant="success" />
				<DiscordButton label="Cancel" variant="secondary" />
				<DiscordButton label="Stop" variant="danger" icon="ph:stop-fill" />
			</DiscordActionRow>
		`,
	}),
};
