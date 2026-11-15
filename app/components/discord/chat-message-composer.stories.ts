import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import { discordDecorator } from "../../../.storybook/decorators";
import DiscordChatInputCommand from "./chat-input-command/index.vue";
import DiscordChatMessageComposer from "./chat-message-composer.vue";

const meta = {
	component: DiscordChatMessageComposer,
	title: "Components/Discord/ChatMessageComposer",
	decorators: [discordDecorator],
	args: {
		channelName: "mod-commands",
		modelValue: "",
		layout: "default",
	},
	argTypes: {
		layout: {
			control: "inline-radio",
			options: ["default", "narrow"],
		},
	},
} satisfies Meta<typeof DiscordChatMessageComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithSlash: Story = {
	args: {
		modelValue: "/warn",
	},
};

/** A field of its own: the command as a chip, then an input for its last option. */
export const WithCommand: Story = {
	args: {
		placeholder: "Reason for the warning",
	},
	render: (args) => ({
		components: { DiscordChatInputCommand, DiscordChatMessageComposer },
		setup: () => ({ args }),
		template: `
			<DiscordChatMessageComposer v-bind="args">
				<template #input="{ value, setValue, inputProps }">
					<DiscordChatInputCommand
						name="warn"
						class="shrink-0"
						:options="[{ name: 'user', value: '@baddie' }]"
					/>
					<input
						v-bind="inputProps"
						:value="value"
						class="w-full min-w-0 border-0 bg-transparent text-[15px] text-newt-text-primary outline-none placeholder:text-newt-text-muted"
						@input="setValue($event.target.value)"
					/>
				</template>
			</DiscordChatMessageComposer>
		`,
	}),
};

/** The phone bar: apps and gift beside the pill, a microphone until there is text. */
export const Narrow: Story = {
	args: {
		layout: "narrow",
	},
	render: (args) => ({
		components: { DiscordChatMessageComposer },
		setup: () => ({ args }),
		template: `
			<div class="max-w-[360px]">
				<DiscordChatMessageComposer v-bind="args" />
			</div>
		`,
	}),
};

export const NarrowWithSlash: Story = {
	...Narrow,
	args: {
		layout: "narrow",
		modelValue: "/warn",
	},
};
