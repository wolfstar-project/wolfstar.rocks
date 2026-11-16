import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { confSelectOptions } from "~/storybook/discord-fixtures";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordStringSelectMenu from "./string-select-menu.vue";

const meta = {
	component: DiscordStringSelectMenu,
	title: "Components/Discord/StringSelectMenu",
	decorators: [discordDecorator],
	args: {
		options: confSelectOptions,
		placeholder: "Choose an option...",
		disabled: false,
		ariaLabel: "Select an option",
	},
} satisfies Meta<typeof DiscordStringSelectMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { DiscordStringSelectMenu },
		setup: () => ({ args }),
		template: `
			<div class="max-w-md">
				<DiscordStringSelectMenu v-bind="args" />
			</div>
		`,
	}),
};

/** Near the composer the listbox opens upwards, as Discord's does. Near the top it flips down. */
export const NearComposer: Story = {
	render: (args) => ({
		components: { DiscordStringSelectMenu },
		setup: () => ({ args }),
		template: `
			<div class="relative flex h-[28rem] max-w-md flex-col justify-end overflow-hidden rounded border border-default p-4">
				<DiscordStringSelectMenu v-bind="args" />
				<p class="mt-3 text-sm text-muted">Message #mod_commands</p>
			</div>
		`,
	}),
};

/** Unicode emoji, which newt/ui draws itself in the row and on the trigger. */
export const UnicodeEmoji: Story = {
	args: {
		options: [
			{ value: "news", label: "Announcements", emoji: "📣" },
			{ value: "events", label: "Events", emoji: "🎉" },
			{ value: "patches", label: "Patch notes", emoji: "🛠️" },
		],
		placeholder: "Choose what to hear about",
	},
	render: (args) => ({
		components: { DiscordStringSelectMenu },
		setup: () => ({ args }),
		template: `
			<div class="flex h-[20rem] max-w-md flex-col justify-end">
				<DiscordStringSelectMenu v-bind="args" />
			</div>
		`,
	}),
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
	render: (args) => ({
		components: { DiscordStringSelectMenu },
		setup: () => ({ args }),
		template: `
			<div class="max-w-md">
				<DiscordStringSelectMenu v-bind="args" />
			</div>
		`,
	}),
};
