import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordV2StringSelectMenuOption from "./string-select-menu-option.vue";
const meta = {
	component: DiscordV2StringSelectMenuOption,
	title: "Components/Discord/V2/StringSelectMenuOption",
	decorators: [discordDecorator],
	args: {
		option: {
			value: "permissions",
			label: "Root / Permissions",
			emoji: "ph:folder-fill",
			description: "Currently at: Root / Permissions",
		},
		optionId: "option-permissions",
		active: true,
		selected: false,
	},
} satisfies Meta<typeof DiscordV2StringSelectMenuOption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
	render: (args) => ({
		components: { DiscordV2StringSelectMenuOption },
		setup: () => ({ args }),
		template: `
			<div role="listbox" aria-label="Select menu options" class="max-w-md rounded-md bg-base-200 p-1">
				<DiscordV2StringSelectMenuOption v-bind="args" />
			</div>
		`,
	}),
};

export const Selected: Story = {
	args: {
		active: false,
		selected: true,
	},
	render: (args) => ({
		components: { DiscordV2StringSelectMenuOption },
		setup: () => ({ args }),
		template: `
			<div role="listbox" aria-label="Select menu options" class="max-w-md rounded-md bg-base-200 p-1">
				<DiscordV2StringSelectMenuOption v-bind="args" />
			</div>
		`,
	}),
};
