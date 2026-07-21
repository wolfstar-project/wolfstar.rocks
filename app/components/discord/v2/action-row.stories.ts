import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordV2ActionRow from "./action-row.vue";
import DiscordV2Button from "./button.vue";

const meta = {
	component: DiscordV2ActionRow,
	title: "Components/Discord/V2/ActionRow",
	decorators: [discordDecorator],
} satisfies Meta<typeof DiscordV2ActionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
	render: () => ({
		components: { DiscordV2ActionRow, DiscordV2Button },
		template: `
			<DiscordV2ActionRow>
				<DiscordV2Button label="Confirm" variant="success" />
				<DiscordV2Button label="Cancel" variant="secondary" />
				<DiscordV2Button label="Stop" variant="danger" icon="ph:stop-fill" />
			</DiscordV2ActionRow>
		`,
	}),
};
