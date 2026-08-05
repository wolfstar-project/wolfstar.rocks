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
			<div>
				<h1 class="sr-only">Guild OAuth Callback</h1>
				<OauthStatusPanel
					tone="error"
					title="Server Not Found"
					icon="heroicons:exclamation-triangle"
				>
					<template #description>
						We couldn't determine which server to set up. Please
						<NuxtLink to="/login" class="font-medium underline">sign in</NuxtLink>
						and select a server from your dashboard.
					</template>
				</OauthStatusPanel>
			</div>
		`,
	}),
};

export const SetupError: Story = {
	render: () => ({
		template: `
			<div>
				<OauthStatusPanel
					tone="error"
					title="Setup Failed"
					icon="heroicons:x-circle"
				>
					<template #description>
						Failed to add WolfStar to the server. The bot may already be present, or you may not have the required permissions.
					</template>
					<template #actions>
						<StarButton to="/login" size="sm" variant="outline" class="w-full sm:w-auto">
							Return to Login
						</StarButton>
					</template>
				</OauthStatusPanel>
			</div>
		`,
	}),
};

export const Redirecting: Story = {
	render: () => ({
		template: `
			<div>
				<OauthStatusPanel
					tone="info"
					loading
					title="Redirecting"
					icon="ph:discord-logo-fill"
				>
					<template #description>Taking you to the server dashboard...</template>
				</OauthStatusPanel>
			</div>
		`,
	}),
};
