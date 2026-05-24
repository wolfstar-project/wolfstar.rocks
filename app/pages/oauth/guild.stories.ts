import type { Meta, StoryObj } from "@storybook-vue/nuxt";

/**
 * The guild OAuth page reads the guild_id query parameter and redirects.
 * Stories use inline render functions to display each visual state statically,
 * without mounting the full page and triggering navigation.
 */
const meta: Meta = {
	title: "Pages/OAuth/Guild",
	parameters: {
		layout: "padded",
		chromatic: { disableSnapshot: true },
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NoGuildId: Story = {
	render: () => ({
		template: `
			<div class="container mx-auto px-4 py-8">
				<h1 class="sr-only">Guild OAuth Callback</h1>
				<UAlert variant="solid" color="error" title="Server Not Found" icon="emojione:warning">
					<template #description>
						We couldn't determine which server to set up. Please
						<NuxtLink to="/login" class="font-medium underline">sign in</NuxtLink>
						and select a server from your dashboard.
					</template>
				</UAlert>
			</div>
		`,
	}),
};

export const SetupError: Story = {
	render: () => ({
		template: `
			<div class="container mx-auto px-4 py-8">
				<UAlert variant="solid" color="error" title="Setup Failed" icon="emojione:cross-mark">
					<template #description>
						Failed to add WolfStar to the server. The bot may already be present, or you may not have the required permissions.
					</template>
					<template #actions>
						<UButton to="/login" size="sm" variant="outline">Return to Login</UButton>
					</template>
				</UAlert>
			</div>
		`,
	}),
};

export const Redirecting: Story = {
	render: () => ({
		template: `
			<div class="container mx-auto px-4 py-8">
				<UAlert color="info" icon="emojione:hourglass-done" title="Redirecting">
					<template #description>Taking you to the server dashboard...</template>
				</UAlert>
			</div>
		`,
	}),
};
