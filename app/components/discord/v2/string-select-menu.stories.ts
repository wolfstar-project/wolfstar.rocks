import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { confSelectOptions } from "~/storybook/discord-fixtures";
import { discordDecorator } from "../../../../.storybook/decorators";
import DiscordV2StringSelectMenu from "./string-select-menu.vue";

const meta = {
	component: DiscordV2StringSelectMenu,
	title: "Components/Discord/V2/StringSelectMenu",
	decorators: [discordDecorator],
	args: {
		options: confSelectOptions,
		placeholder: "Choose an option...",
		disabled: false,
		ariaLabel: "Select an option",
	},
} satisfies Meta<typeof DiscordV2StringSelectMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { DiscordV2StringSelectMenu },
		setup: () => ({ args }),
		template: `
			<div class="max-w-md">
				<DiscordV2StringSelectMenu v-bind="args" />
			</div>
		`,
	}),
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
	render: (args) => ({
		components: { DiscordV2StringSelectMenu },
		setup: () => ({ args }),
		template: `
			<div class="max-w-md">
				<DiscordV2StringSelectMenu v-bind="args" />
			</div>
		`,
	}),
};
