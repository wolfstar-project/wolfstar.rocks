import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { confAccentColor, confSelectOptions } from "~/storybook/discord-fixtures";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordV2ActionRow from "./action-row.vue";
import DiscordV2Button from "./button.vue";
import DiscordV2Container from "./container.vue";
import DiscordV2Separator from "./separator.vue";
import DiscordV2StringSelectMenu from "./string-select-menu.vue";
import DiscordV2TextDisplay from "./text-display.vue";

const meta = {
	component: DiscordV2Container,
	title: "Components/Discord/V2/Container",
	decorators: [discordDecorator],
	args: {
		accentColor: confAccentColor,
	},
} satisfies Meta<typeof DiscordV2Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfMenu: Story = {
	render: (args) => ({
		components: {
			DiscordV2Container,
			DiscordV2TextDisplay,
			DiscordV2Separator,
			DiscordV2ActionRow,
			DiscordV2StringSelectMenu,
			DiscordV2Button,
		},
		setup: () => ({ args, confSelectOptions }),
		template: `
			<DiscordV2Container v-bind="args">
				<DiscordV2TextDisplay>
Currently at: 📁 Root
Use the menu below to navigate:

📁 permissions
📁 channels
⚙️ prefix
				</DiscordV2TextDisplay>
				<DiscordV2Separator />
				<DiscordV2ActionRow>
					<DiscordV2StringSelectMenu
						:options="confSelectOptions"
						placeholder="Choose an option..."
					/>
				</DiscordV2ActionRow>
				<DiscordV2ActionRow>
					<DiscordV2Button label="Stop" variant="danger" icon="ph:stop-fill" />
				</DiscordV2ActionRow>
			</DiscordV2Container>
		`,
	}),
};
